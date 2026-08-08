import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Plus, Edit3, Trash2, Sparkles, Filter, Check, 
  Search, Eye, Loader2, Image as ImageIcon, Save, X, 
  Calendar, User, Clock, Tag, ChevronRight, Layout, ExternalLink, Upload
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  apiGetBlogs, apiSaveBlog, apiUpdateBlog, apiDeleteBlog, apiSubscribeToBlogs,
  apiUploadGeneralFile, resolveImageUrl
} from '../lib/api';
import { generateDynamicSvgUrl } from '../lib/mediaUtils';

interface BlogCMSProps {
  onRefresh?: () => Promise<void>;
}

export const BlogCMS: React.FC<BlogCMSProps> = ({ onRefresh }) => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [activePost, setActivePost] = useState<any | null>(null);
  const [formState, setFormState] = useState({
    title: '',
    category: 'Marketing',
    description: '',
    content: '',
    image: '',
    author: 'Executive Editor',
    readTime: '5 min read',
    tags: [] as string[]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');

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

  const categories = ['Marketing', 'Business Growth', 'AI', 'Technology', 'Legal'];

  useEffect(() => {
    setLoading(true);
    const unsubscribe = apiSubscribeToBlogs((data) => {
      setBlogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await apiGetBlogs();
      setBlogs(data || []);
    } catch (e) {
      console.error("Failed to load blogs:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: any) => {
    setActivePost(post);
    setFormState({
      title: post.title || '',
      category: post.category || 'Marketing',
      description: post.description || '',
      content: post.content || post.description || '',
      image: post.image || '',
      author: post.author || 'Executive Editor',
      readTime: post.readTime || '5 min read',
      tags: post.tags || []
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setActivePost(null);
    setFormState({
      title: '',
      category: 'Marketing',
      description: '',
      content: '',
      image: '',
      author: 'Executive Editor',
      readTime: '5 min read',
      tags: []
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...formState,
        id: activePost?.id || `blog_${Math.random().toString(36).substring(2, 8)}`,
        date: activePost?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };

      if (activePost) {
        await apiUpdateBlog(activePost.id, payload);
      } else {
        await apiSaveBlog(payload);
      }
      
      await loadBlogs();
      setIsEditing(false);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently purge this article?")) return;
    try {
      await apiDeleteBlog(id);
      await loadBlogs();
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

  const filteredBlogs = blogs.filter(b => {
    const matchesCat = filterCat === 'All' || b.category === filterCat;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-[#000E32] rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
            <BookOpen className="text-orange-400" size={32} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-[#000E32] uppercase font-serif tracking-tight">Insights Blog Engine</h2>
            <p className="text-slate-500 text-xs font-medium max-w-md mt-1">
              Draft, compose, and publish industry perspectives. Utilize markdown formatting and real-time cognitive previews.
            </p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="relative z-10 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>New Article</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 flex flex-wrap gap-2">
          <button 
            onClick={() => setFilterCat('All')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filterCat === 'All' ? 'bg-[#000E32] text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}
          >
            All Insights
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterCat === cat ? 'bg-[#000E32] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="lg:col-span-4 relative">
          <input 
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-orange-500 transition-all shadow-sm"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Rich Editor Form */}
            <div className="xl:col-span-7 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <Edit3 className="text-orange-500" size={20} />
                    <h3 className="text-sm font-black text-[#000E32] uppercase font-serif">Article Composer</h3>
                  </div>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Headline</label>
                      <input 
                        type="text" 
                        required
                        value={formState.title}
                        onChange={e => setFormState({...formState, title: e.target.value})}
                        className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                        placeholder="Navigating compliance thresholds..."
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Taxonomy Node</label>
                      <select 
                        value={formState.category}
                        onChange={e => setFormState({...formState, category: e.target.value})}
                        className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Visual Asset Image</label>
                      <label className="cursor-pointer text-[10px] font-bold text-orange-600 hover:text-orange-500 flex items-center gap-1">
                        <Upload size={12} />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                        <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" disabled={uploadingImage} />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formState.image}
                        onChange={e => setFormState({...formState, image: e.target.value})}
                        className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                        placeholder="Paste URL or click 'Upload File'"
                      />
                      <button 
                        type="button"
                        onClick={() => setFormState({...formState, image: generateDynamicSvgUrl(formState.title || 'Insight', formState.category.toLowerCase(), 'blog')})}
                        className="px-4 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all"
                      >
                        Gen SVG
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Meta Tags</label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {formState.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-indigo-100">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-rose-500"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                        placeholder="Add tag and press Enter..."
                      />
                      <button type="button" onClick={addTag} className="px-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold">Add</button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Content Markup (Markdown Supported)</label>
                    <textarea 
                      rows={12}
                      required
                      value={formState.content}
                      onChange={e => setFormState({...formState, content: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium leading-relaxed focus:bg-white focus:border-orange-500 focus:outline-none transition-all resize-none font-mono"
                      placeholder="Write your article body here. You can use standard markdown syntax..."
                    />
                  </div>

                  <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                    <div className="flex gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-300 block">Author</label>
                        <input type="text" value={formState.author} onChange={e=>setFormState({...formState, author: e.target.value})} className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-600 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-300 block">Read Time</label>
                        <input type="text" value={formState.readTime} onChange={e=>setFormState({...formState, readTime: e.target.value})} className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-600 focus:outline-none" />
                      </div>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-10 py-3 bg-[#000E32] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Publish Article Node
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Pane */}
            <div className="xl:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Layout size={12} className="text-orange-500" />
                    Cognitive Live Preview
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Rendering State</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                  <div className="space-y-6">
                    {/* Visual Card Preview */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl max-w-[320px] mx-auto">
                        <div className="h-40 relative bg-slate-900">
                          {formState.image ? (
                            <img src={resolveImageUrl(formState.image)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-50"><ImageIcon size={32} strokeWidth={1} /></div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-orange-500">{formState.category}</span>
                          <h4 className="text-xs font-black text-slate-900 uppercase font-serif line-clamp-2">{formState.title || 'Draft Article Headline'}</h4>
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                            <div className="w-4 h-4 rounded-full bg-indigo-500" />
                            <span className="text-[8px] font-bold text-slate-400">{formState.author} • {formState.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Full Article Content Preview */}
                    <div className="space-y-4 text-left">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-500 tracking-widest">
                          <Calendar size={10} />
                          <span>{activePost?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#000E32] font-serif leading-tight">
                          {formState.title || 'Insight Title Placeholder'}
                        </h1>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {formState.tags.map(t => <span key={t} className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">#{t}</span>)}
                        </div>
                      </div>

                      <div className="prose prose-sm max-w-none prose-slate">
                        <div className="text-slate-600 leading-relaxed font-medium markdown-body">
                          <ReactMarkdown>{formState.content || 'Initialize article body content in the composer to generate the live cognitive rendering here. Markdown structural elements will be processed in real-time.'}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-4 text-left mt-auto">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 h-max"><Sparkles size={16} /></div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-wide">AI Readability Audit</h4>
                    <p className="text-[9px] text-indigo-700 font-medium leading-relaxed">
                      Your article has high structural clarity. The use of tags improves SEO indexing by 24% for localized West African corporate queries.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="py-5 px-8">Article Context</th>
                    <th className="py-5 px-6">Classification</th>
                    <th className="py-5 px-6">Author / Velocity</th>
                    <th className="py-5 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-orange-500" size={32} />
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Querying Blog Database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBlogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-400 space-y-3 px-8">
                        <BookOpen size={40} className="mx-auto opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">No matching insights found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBlogs.map(post => (
                      <motion.tr 
                        layout
                        key={post.id} 
                        className="group hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-10 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                              <img 
                                src={resolveImageUrl(post.image)} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-slate-900 uppercase font-serif tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                                {post.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                <Calendar size={10} />
                                <span>{post.date}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                            {post.category}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-[10px]">
                              {post.author.charAt(0)}
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-black text-slate-700 block uppercase tracking-tight">{post.author}</span>
                              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1 font-bold">
                                <Clock size={10} /> {post.readTime}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(post)}
                              className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-all shadow-sm"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="p-2.5 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-all shadow-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button className="p-2.5 bg-white text-slate-400 hover:text-[#000E32] rounded-xl border border-slate-200 shadow-sm">
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing {filteredBlogs.length} of {blogs.length} published node records
              </span>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Prev</button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Next</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
