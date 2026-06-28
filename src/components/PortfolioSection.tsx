import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderOpen, ArrowRight, Layers, Smartphone, Database, 
  Sparkles, ShieldCheck, Cpu, Code, Zap, CheckCircle, Brain, X, Activity
} from 'lucide-react';
import { PORTFOLIO } from '../lib/data';
import { apiGetPortfolio, apiInitializePortfolio } from '../lib/api';

export const PortfolioSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [activeTechIndex, setActiveTechIndex] = useState<number | null>(null);

  const [projects, setProjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('admin_portfolio_projects');
      return saved ? JSON.parse(saved) : PORTFOLIO;
    } catch (e) {
      console.error('Failed to parse admin_portfolio_projects from localStorage:', e);
      return PORTFOLIO;
    }
  });

  useEffect(() => {
    const fetchD1Portfolio = async () => {
      try {
        const data = await apiGetPortfolio();
        if (data && data.length > 0) {
          setProjects(data);
          localStorage.setItem('admin_portfolio_projects', JSON.stringify(data));
        } else {
          // Empty D1 - seed with static PORTFOLIO
          await apiInitializePortfolio(PORTFOLIO);
          setProjects(PORTFOLIO);
          localStorage.setItem('admin_portfolio_projects', JSON.stringify(PORTFOLIO));
        }
      } catch (err) {
        console.warn('D1 portfolio database unreachable. Falling back to LocalStorage.', err);
      }
    };

    fetchD1Portfolio();

    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('admin_portfolio_projects');
        if (saved) {
          setProjects(JSON.parse(saved));
        } else {
          setProjects(PORTFOLIO);
        }
      } catch (e) {
        console.error('Failed to parse admin_portfolio_projects in storage event:', e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getTechAiInsight = (techName: string) => {
    switch (techName) {
      case 'React 19':
        return {
          optimization: 'Server Component Hydration',
          speedup: '40% load time reduction',
          bandwidth: '-120KB initial JS weight',
          advantage: 'Direct edge pre-rendering for low-end Android mobile browsers.'
        };
      case 'Tailwind CSS v4':
        return {
          optimization: 'Zero-Runtime CSS Parsing',
          speedup: 'Instant rendering (0ms TBT)',
          bandwidth: '-45% stylesheet size',
          advantage: 'CSS bundle compiled directly to native utilities to maximize paint speeds.'
        };
      case 'Node.js & Express':
        return {
          optimization: 'Thread-Pool Optimization',
          speedup: '8.4x higher req throughput',
          bandwidth: 'Optimized Gzip streams',
          advantage: 'High-velocity concurrency handling for millions of parallel applicant records.'
        };
      case 'Cloudflare D1':
        return {
          optimization: 'Edge SQLite Distributed DB',
          speedup: '12ms regional query delay',
          bandwidth: 'Zero egress cost',
          advantage: 'Distributed replica nodes placed directly at Lagos and Abuja Cloudflare edge centers.'
        };
      case 'Google GenAI SDK':
        return {
          optimization: 'Gemini Flash 1.5 Orchestrator',
          speedup: '240ms stream cold-start',
          bandwidth: 'Context-Cached Embeddings',
          advantage: 'Autonomous compliance matching and smart categorization logic.'
        };
      case 'TypeScript':
        return {
          optimization: 'Strict Type Soundness compiles',
          speedup: 'Zero runtime type errors',
          bandwidth: 'Stripped ESM compilation',
          advantage: 'Strong safety guards protecting high-integrity regulatory filing records.'
        };
      default:
        return {
          optimization: 'Algorithmic Optimization',
          speedup: 'Incremental performance gains',
          bandwidth: 'Optimized memory footprint',
          advantage: 'Seamless architecture configured for maximum enterprise-grade availability.'
        };
    }
  };

  const categories = ['all', 'Digital Marketing', 'Software Development', 'Compliance Services', 'AI Solutions'];

  const filteredProjects = activeTab === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeTab);

  // Before & After comparisons dataset
  const beforeAfters = [
    {
      metric: "Abuja Smart Homes Ad ROAS",
      before: "1.2x ROAS",
      after: "5.4x ROAS",
      desc: "By removing broad targets and deploying regional high-income hubs on WhatsApp CTA hooks.",
      pct: "+350%"
    },
    {
      metric: "Garki Logistics DB Latency",
      before: "2400ms Query Delay",
      after: "12ms Real-Time Sync",
      desc: "Re-engineered standard monolithic databases into bundled esbuild queries and in-memory caches.",
      pct: "99% faster"
    },
    {
      metric: "Corporate Registration Speed",
      before: "28 Business Days",
      after: "5 Business Days",
      desc: "Integrated digital CAC name reservation pipelines with parallel SCUML clearance triggers.",
      pct: "82% shorter"
    }
  ];

  // Tech stack items
  const techStack = [
    { name: "React 19", category: "Frontend", icon: <Code className="text-blue-500" /> },
    { name: "Tailwind CSS v4", category: "Styling", icon: <Layers className="text-sky-500" /> },
    { name: "Node.js & Express", category: "Backend", icon: <Zap className="text-green-500" /> },
    { name: "Cloudflare D1", category: "Database", icon: <Database className="text-orange-500" /> },
    { name: "Google GenAI SDK", category: "Intelligence", icon: <Sparkles className="text-amber-500" /> },
    { name: "TypeScript", category: "Safety", icon: <Cpu className="text-indigo-500" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-20 animate-fade-in text-left text-slate-800 dark:text-slate-100">
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

      {/* 1. PROJECTS SHOWCASE */}
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
                  : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60'
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
                  src={proj.image} 
                  alt={proj.title} 
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
                  {proj.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. BEFORE AND AFTER COMPARISONS */}
      <section className="space-y-8">
        <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight text-slate-900 dark:text-white border-l-4 border-orange-500 pl-4">
          Optimization Milestones (Before & After)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {beforeAfters.map((ba, i) => (
            <div key={i} className="bg-gradient-to-br from-[#000E32] to-[#011442] text-white p-6 rounded-3xl border border-indigo-950 shadow-md space-y-4">
              <span className="text-orange-400 text-[10px] uppercase font-black tracking-widest block font-mono">{ba.metric}</span>
              <div className="flex items-center justify-between gap-4 border-y border-white/5 py-3">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Before</span>
                  <span className="text-xs line-through text-slate-300 font-bold">{ba.before}</span>
                </div>
                <ArrowRight className="text-orange-500" size={16} />
                <div className="text-left">
                  <span className="text-[10px] text-orange-400 block uppercase font-black">After Optimized</span>
                  <span className="text-lg text-emerald-400 font-black font-serif">{ba.after}</span>
                </div>
              </div>
              <div className="flex justify-between items-start gap-2">
                <p className="text-slate-300 text-[11px] leading-relaxed font-light text-left">{ba.desc}</p>
                <span className="text-xs font-black text-emerald-400 shrink-0 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">{ba.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TECHNOLOGY STACK DISPLAY */}
      <section className="bg-gradient-to-b from-slate-50/60 to-slate-100/30 dark:from-slate-900/40 dark:to-slate-950/20 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800/80 text-center space-y-8 relative overflow-hidden">
        {/* Dynamic ambient background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 dark:bg-orange-500/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-orange-600 dark:text-orange-400 text-xs uppercase tracking-widest font-black font-mono block"
          >
            // OUR STACK
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-black uppercase font-serif tracking-tight text-[#000E32] dark:text-white"
          >
            High-Performance Tech Stack
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed font-light"
          >
            We write clean, lightweight, type-safe code that compiles instantly, runs at edge nodes, and delivers seamless viewport experiences on mobile and desktop.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
          {techStack.map((tech, i) => {
            const isSelected = activeTechIndex === i;
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 25, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 18 }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.06, 
                  rotate: i % 2 === 0 ? 1.5 : -1.5,
                  borderColor: 'rgba(249, 115, 22, 0.5)',
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                onClick={() => setActiveTechIndex(isSelected ? null : i)}
                className={`bg-white/95 dark:bg-slate-950/95 p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2.5 cursor-pointer relative overflow-hidden ${
                  isSelected 
                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg' 
                    : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-500/50'
                }`}
              >
                {/* Micro AI pulse */}
                <span className="absolute top-2 right-2 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                </span>

                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-inner border border-slate-100 dark:border-slate-800/50"
                >
                  {tech.icon}
                </motion.div>
                <div className="text-center space-y-0.5">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block font-serif uppercase tracking-tight">{tech.name}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black block tracking-wider">{tech.category}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Interactive AI Tech Diagnostic Overlay */}
        <AnimatePresence>
          {activeTechIndex !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative z-20 bg-[#000E32] text-white p-6 rounded-3xl border border-orange-500/30 text-left overflow-hidden mt-6 shadow-xl"
            >
              {/* Grid abstract background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#021a52_1px,transparent_1px),linear-gradient(to_bottom,#021a52_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Brain size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-orange-400 font-bold uppercase block">// AI CORE INTEGRATION DIAGNOSTICS</span>
                    <h3 className="text-base font-extrabold font-serif uppercase text-white tracking-tight flex items-center gap-1.5">
                      {techStack[activeTechIndex].name} Analysis
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold tracking-wider uppercase border border-emerald-500/20">Verified Optimal</span>
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTechIndex(null)}
                  className="self-end md:self-auto p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">Target Area Optimization</span>
                  <p className="text-xs font-bold text-white font-serif uppercase tracking-tight">{getTechAiInsight(techStack[activeTechIndex].name).optimization}</p>
                </div>
                
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">Regional Compression Benefit</span>
                  <p className="text-xs font-black text-emerald-400 font-mono">{getTechAiInsight(techStack[activeTechIndex].name).speedup}</p>
                  <p className="text-[9px] text-slate-400 leading-none mt-1">{getTechAiInsight(techStack[activeTechIndex].name).bandwidth}</p>
                </div>

                <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20 md:col-span-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-orange-400 font-bold block mb-1">Nigeria/Garki Edge Advantage</span>
                  <p className="text-xs text-orange-100 font-medium leading-relaxed">{getTechAiInsight(techStack[activeTechIndex].name).advantage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Case Study Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden shadow-2xl text-left"
          >
            {/* Media Box: Video or Image */}
            <div className="h-56 relative bg-slate-950">
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
                <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              )}
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center text-xs font-black hover:bg-black transition-colors z-10"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-500 dark:text-indigo-400 font-bold">{selectedProject.category}</span>
                <span className="text-[10px] text-slate-400 block font-bold">{selectedProject.date}</span>
              </div>
              
              <h3 className="font-extrabold text-[#000E32] dark:text-white text-base uppercase font-serif tracking-tight leading-tight">{selectedProject.title}</h3>
              
              <div className="text-xs font-bold text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <div>Client: <span className="text-slate-800 dark:text-slate-200">{selectedProject.client || 'Garki Enterprise Node'}</span></div>
                {selectedProject.stats && <div>Outcome Indicator: <span className="text-emerald-500 font-mono">{selectedProject.stats}</span></div>}
                {selectedProject.video && <div className="text-[10px] text-indigo-500 font-mono mt-1">// Playing Case Study Video review</div>}
              </div>

              {/* Brief Intro */}
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-light font-sans">{selectedProject.description}</p>
              
              {/* Detailed Content Case Study */}
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
                  {selectedProject.tags.map((tag: string, i: number) => (
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
        </div>
      )}
    </div>
  );
};
