import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, X, Activity, ArrowLeft, Sun, Moon
} from 'lucide-react';
import { apiGetPortfolio, resolveImageUrl, apiSubscribeToPortfolio } from '../lib/api';
import { Logo } from './Logo';

export const PortfolioSection: React.FC<{ onBackToMain?: () => void }> = ({ onBackToMain }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Sync theme with document root
  useEffect(() => {
    const isRootDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isRootDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [projects, setProjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('admin_portfolio_projects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const unsubscribe = apiSubscribeToPortfolio((data) => {
      if (data && data.length > 0) {
        setProjects(data);
        localStorage.setItem('admin_portfolio_projects', JSON.stringify(data));
      } else {
        setProjects([]);
        localStorage.setItem('admin_portfolio_projects', JSON.stringify([]));
      }
    });

    return () => unsubscribe();
  }, []);

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = activeTab === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeTab);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-500 relative`}>
      <div className="min-h-screen flex flex-col">
        {/* Top Standalone Header Bar */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToMain}>
              <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onBackToMain && (
              <button
                type="button"
                onClick={onBackToMain}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                title="Back to Main Site"
              >
                <ArrowLeft size={15} className="text-orange-500" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-slate-500">Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm"
            >
              {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 space-y-12 animate-fade-in text-left">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-orange-500 text-xs uppercase tracking-widest font-black">CASE STUDIES</span>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
              Our Projects & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">Success Stories</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-3xl font-light">
              A physical record of digital transformation, high-performance ad delivery, enterprise software architecture, and fast-track corporate registries.
            </p>
          </div>

          {/* PROJECTS SHOWCASE */}
          <section className="space-y-8">
            {/* Category switcher */}
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeTab === cat
                      ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-md shadow-indigo-900/10'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60'
                  }`}
                >
                  {cat === 'all' ? 'All Case Studies' : cat}
                </button>
              ))}
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => (
                <div 
                  key={proj.id} 
                  onClick={() => setSelectedProject(proj)}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/40 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={resolveImageUrl(proj.image)} 
                      alt={proj.title} 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {proj.stats && (
                      <div className="absolute bottom-3 left-3 bg-[#000E32]/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] uppercase font-black text-orange-400 border border-white/5">
                        {proj.stats}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono tracking-widest uppercase text-indigo-500 dark:text-indigo-400 font-bold block">{proj.category}</span>
                      <h3 className="font-extrabold text-[#000E32] dark:text-white text-sm uppercase font-serif line-clamp-1 group-hover:text-orange-500 transition-colors">{proj.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light line-clamp-3">{proj.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.tags?.map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No projects found.
                </div>
              )}
            </div>
          </section>

          {/* Case Study Detail Modal */}
          <AnimatePresence>
            {selectedProject && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden shadow-2xl text-left flex flex-col max-h-[90vh]"
                >
                  {/* Media Box: Video or Image */}
                  <div className="h-56 relative bg-slate-950 shrink-0">
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
                      <img src={resolveImageUrl(selectedProject.image)} alt={selectedProject.title} className="w-full h-full object-cover" />
                    )}
                    <button 
                      onClick={() => setSelectedProject(null)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center text-xs font-black hover:bg-black transition-colors z-10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-500 dark:text-indigo-400 font-bold">{selectedProject.category}</span>
                      <span className="text-[10px] text-slate-400 block font-bold">{selectedProject.date}</span>
                    </div>
                    
                    <h3 className="font-extrabold text-[#000E32] dark:text-white text-base uppercase font-serif tracking-tight leading-tight">{selectedProject.title}</h3>
                    
                    <div className="text-xs font-bold text-slate-500 space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          Client: <span className="text-slate-800 dark:text-slate-200">
                            {selectedProject.display_client_name !== false 
                              ? (selectedProject.client || 'Garki Enterprise Node') 
                              : 'Confidential Client (Privacy Enforced)'}
                          </span>
                        </div>
                        {selectedProject.display_client_logo !== false && selectedProject.client_logo && (
                          <img 
                            src={selectedProject.client_logo} 
                            alt="Client Logo" 
                            className="h-6 max-w-[80px] object-contain rounded opacity-90 hover:opacity-100 transition-opacity"
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>

                      {selectedProject.stats && <div>Outcome Indicator: <span className="text-emerald-500 font-mono">{selectedProject.stats}</span></div>}
                      
                      {selectedProject.display_live_website !== false && selectedProject.live_website_url && (
                        <div className="pt-1">
                          <a 
                            href={selectedProject.live_website_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-orange-500 dark:text-orange-400 hover:underline text-[10px] uppercase font-black"
                          >
                            <Activity size={10} className="text-orange-500 animate-pulse" />
                            <span>Visit Live Website</span>
                            <ArrowRight size={10} />
                          </a>
                        </div>
                      )}
                      
                      {selectedProject.video && <div className="text-[10px] text-indigo-500 font-mono mt-0.5">// Playing Case Study Video review</div>}
                    </div>

                    {selectedProject.display_testimonial !== false && selectedProject.testimonial_text && (
                      <div className="bg-orange-500/5 dark:bg-orange-500/[0.02] border-l-2 border-orange-500 p-3.5 rounded-r-xl space-y-1.5 text-left">
                        <p className="text-slate-600 dark:text-slate-300 italic text-[11px] leading-relaxed">
                          "{selectedProject.testimonial_text}"
                        </p>
                        {selectedProject.testimonial_author && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#000E32] dark:text-orange-400 font-mono block">
                            — {selectedProject.testimonial_author}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-light font-sans">{selectedProject.description}</p>
                    
                    {selectedProject.content && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <span className="text-[9px] font-mono tracking-wider uppercase text-orange-500 font-black block">// Full Case Analysis</span>
                        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5 leading-relaxed font-light">
                          {selectedProject.content.split('\n').map((line: string, i: number) => {
                            if (line.startsWith('# ')) {
                              return <h2 key={i} className="text-sm font-extrabold uppercase font-serif text-[#000E32] dark:text-white pt-2">{line.replace('# ', '')}</h2>;
                            } else if (line.startsWith('## ')) {
                              return <h3 key={i} className="text-xs font-bold uppercase font-serif text-slate-800 dark:text-orange-400 pt-1.5">{line.replace('## ', '')}</h3>;
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
                      <div className="flex flex-wrap gap-1.5 max-w-[60%]">
                        {selectedProject.tags?.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button 
                        onClick={() => setSelectedProject(null)}
                        className="px-4 py-1.5 bg-[#000E32] dark:bg-orange-600 text-white text-[11px] font-bold uppercase rounded-xl shrink-0"
                      >
                        Close Case Study
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
