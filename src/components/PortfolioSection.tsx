import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, X, Activity, Sun, Moon, Sparkles, Search, 
  Layers, CheckCircle2, Building, ExternalLink, MessageSquare, Flame
} from 'lucide-react';
import { apiSubscribeToPortfolio, resolveImageUrl } from '../lib/api';
import { PORTFOLIO } from '../lib/data';
import { StandalonePageHeader } from './StandalonePageHeader';
import { StandalonePageFooter } from './StandalonePageFooter';

export const PortfolioSection: React.FC<{ onBackToMain?: () => void }> = ({ onBackToMain }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const [projects, setProjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('admin_portfolio_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return PORTFOLIO;
    } catch (e) {
      return PORTFOLIO;
    }
  });

  useEffect(() => {
    const unsubscribe = apiSubscribeToPortfolio((data) => {
      if (data && data.length > 0) {
        setProjects(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(projects.map(p => p.category)))];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesTab = activeTab === 'all' || p.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.title?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) || 
        p.category?.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)));
      return matchesTab && matchesSearch;
    });
  }, [projects, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-500 flex flex-col w-full selection:bg-orange-500 selection:text-white">
      {/* Standalone Header */}
      <StandalonePageHeader 
        activePage="portfolio" 
        badgeText="CASE STUDIES" 
        onBackToMain={onBackToMain} 
      />

      {/* Main Page Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16 animate-fade-in text-left">
        
        {/* HERO BANNER SECTION */}
        <section className="relative rounded-3xl bg-gradient-to-br from-[#000E32] via-[#011442] to-slate-950 text-white p-6 sm:p-10 md:p-12 overflow-hidden border border-indigo-950 shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>VERIFIED CASE STUDIES & METRICS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase font-serif">
              Engineering Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 font-extrabold italic">
                Authority & Growth
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl font-light">
              Explore our physical record of high-converting growth funnels, custom software architectures, legal compliance automation, and enterprise brand setups delivered across West Africa and beyond.
            </p>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">200+</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Delivered Projects</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">99.8%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">On-Time Completion</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">100%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Regulatory Clearance</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">$12M+</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Ad Volume Scaled</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH AND CATEGORY FILTER DECK */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm backdrop-blur-md">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, client, tech stack, or tags..."
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all font-sans"
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

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-md shadow-indigo-900/20'
                        : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {cat === 'all' ? 'All Case Studies' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PROJECT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((proj, idx) => (
                <motion.div 
                  key={proj.id} 
                  layout
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  onClick={() => setSelectedProject(proj)}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col cursor-pointer relative"
                >
                  {/* Image Container */}
                  <div className="relative h-52 overflow-hidden bg-slate-950">
                    <img 
                      src={resolveImageUrl(proj.image)} 
                      alt={proj.title} 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Stats Badge */}
                    {proj.stats && (
                      <div className="absolute bottom-3 left-3 bg-[#000E32]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black text-orange-400 border border-white/10 shadow-lg">
                        {proj.stats}
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold uppercase text-slate-300 border border-white/10">
                      {proj.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-5 text-left">
                    <div className="space-y-2.5">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-serif group-hover:text-orange-500 transition-colors tracking-tight line-clamp-1">
                        {proj.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-normal line-clamp-3">
                        {proj.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {proj.tags?.slice(0, 3).map((tag: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold uppercase rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center justify-between text-xs font-bold text-orange-500 dark:text-orange-400 group-hover:translate-x-1 transition-transform">
                      <span>View Full Case Study</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredProjects.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-4 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Layers className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">No case studies located for your criteria.</p>
                <button 
                  onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Reset Search & Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CASE STUDY DETAIL MODAL */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden shadow-2xl text-left flex flex-col max-h-[90vh]"
              >
                {/* Media Box */}
                <div className="h-60 sm:h-72 relative bg-slate-950 shrink-0">
                  {selectedProject.video ? (
                    <video 
                      src={selectedProject.video} 
                      controls 
                      autoPlay 
                      loop 
                      muted 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <img 
                      src={resolveImageUrl(selectedProject.image)} 
                      alt={selectedProject.title} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center text-xs font-black hover:bg-black transition-colors z-10 border border-white/10"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                {/* Content Details */}
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-orange-500 font-bold px-2.5 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                      {selectedProject.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block font-bold">{selectedProject.date}</span>
                  </div>
                  
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xl sm:text-2xl font-serif tracking-tight leading-snug">
                    {selectedProject.title}
                  </h3>
                  
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-300 space-y-2 bg-slate-100/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        Client: <span className="text-slate-900 dark:text-slate-100 font-bold">
                          {selectedProject.display_client_name !== false 
                            ? (selectedProject.client || 'Garki Enterprise Node') 
                            : 'Confidential Client (Privacy Enforced)'}
                        </span>
                      </div>
                      {selectedProject.display_client_logo !== false && selectedProject.client_logo && (
                        <img 
                          src={selectedProject.client_logo} 
                          alt="Client Logo" 
                          className="h-6 max-w-[80px] object-contain rounded opacity-90"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>

                    {selectedProject.stats && (
                      <div className="pt-1">
                        Outcome Indicator: <span className="text-emerald-500 font-mono font-bold">{selectedProject.stats}</span>
                      </div>
                    )}
                    
                    {selectedProject.display_live_website !== false && selectedProject.live_website_url && (
                      <div className="pt-1">
                        <a 
                          href={selectedProject.live_website_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 text-orange-500 hover:underline text-xs font-bold uppercase"
                        >
                          <Activity size={12} className="text-orange-500 animate-pulse" />
                          <span>Visit Live Website</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  {selectedProject.display_testimonial !== false && selectedProject.testimonial_text && (
                    <div className="bg-orange-500/5 dark:bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-2xl space-y-2 text-left">
                      <p className="text-slate-700 dark:text-slate-200 italic text-xs leading-relaxed font-serif">
                        "{selectedProject.testimonial_text}"
                      </p>
                      {selectedProject.testimonial_author && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono block">
                          — {selectedProject.testimonial_author}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                    {selectedProject.description}
                  </p>
                  
                  {selectedProject.content && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-orange-500 font-black block">// Full Case Analysis</span>
                      <div className="text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed font-normal">
                        {selectedProject.content.split('\n').map((line: string, i: number) => {
                          if (line.startsWith('# ')) {
                            return <h2 key={i} className="text-sm font-extrabold uppercase font-serif text-slate-900 dark:text-white pt-2">{line.replace('# ', '')}</h2>;
                          } else if (line.startsWith('## ')) {
                            return <h3 key={i} className="text-xs font-bold uppercase font-serif text-orange-500 pt-1.5">{line.replace('## ', '')}</h3>;
                          } else if (line.startsWith('- ')) {
                            return <li key={i} className="list-disc list-inside pl-2">{line.replace('- ', '')}</li>;
                          } else if (line.trim()) {
                            return <p key={i}>{line}</p>;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1.5 max-w-[65%]">
                      {selectedProject.tags?.map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase rounded-lg">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => setSelectedProject(null)}
                      className="px-5 py-2 bg-[#000E32] dark:bg-orange-600 text-white text-xs font-bold uppercase rounded-xl shrink-0"
                    >
                      Close
                    </button>
                  </div>
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
