import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, CheckCircle, ChevronRight, ArrowRight, Layers,
  Terminal, ShieldCheck, Cpu, Code2, RefreshCw, X, Tag, Sparkles
} from 'lucide-react';
import { apiGetOngoingProjects, OngoingProject, apiSubscribeToOngoingProjects, resolveImageUrl } from '../lib/api';
import { generateDynamicSvgUrl } from '../lib/mediaUtils';

const CATEGORIES = [
  'All',
  'Cyber Security',
  'Enterprise Cloud',
  'Government Tech',
  'AI & Automation',
  'Web3 & Ledger'
];

export const OngoingProjectsSection: React.FC<{ language?: string }> = ({ language = 'en' }) => {
  const [projects, setProjects] = useState<OngoingProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<OngoingProject | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = apiSubscribeToOngoingProjects((data) => {
      const published = data.filter(p => p.is_published === 1 || p.is_published === true || p.is_published === undefined || p.is_published === '1');
      
      if (published.length > 0) {
        setProjects(published);
      } else {
        setProjects([
          {
            id: 'proj-1',
            title: 'Al Ihsan Cryptographic Security Hub',
            slug: 'al-ihsan-crypto-security-hub',
            category: 'Cyber Security',
            short_description: 'An advanced multi-tenant identity verification framework securing state information portals using WebAuthn biometrics and real-time ledger verification.',
            full_description: 'Our core cyber security project focuses on establishing a decentralized identity verification gateway. Designed to mitigate deep-fake identities, automated spam registrations, and malicious cyber attacks on sovereign portals. Features complete end-to-end encryption, multi-device physical passkey registrations, and live biometric telemetry auditing.',
            cover_image_key: 'seeds/crypto_security_hub.png',
            gallery: '[]',
            status: 'UI/UX Design',
            progress_percentage: 45,
            technologies: 'WebAuthn, Cryptographic Signatures, Cloudflare Edge, SQLite',
            estimated_completion: '2026-12-15',
            last_updated: '2026-07-18',
            is_featured: 1,
            is_published: 1,
            display_order: 1,
            created_at: '',
            updated_at: ''
          },
          {
            id: 'proj-2',
            title: 'DS Tech Autonomous Client Engine (ACE)',
            slug: 'ds-tech-autonomous-client-engine',
            category: 'Enterprise Cloud',
            short_description: 'A cloud-native SaaS suite that manages client SLAs, real-time ticket escalation, auto-invoicing, and ledger payment tracking.',
            full_description: 'The Autonomous Client Engine (ACE) is engineered to automate corporate client communication and payments. It features AI-driven ticket priority triaging, automated transactional email delivery using Brevo, PDF invoice generation directly at the edge, and secure client registry logs synchronized via WebSockets.',
            cover_image_key: 'seeds/autonomous_client_engine.png',
            gallery: '[]',
            status: 'Frontend Development',
            progress_percentage: 72,
            technologies: 'React, TypeScript, Tailwind CSS, SSE WebSockets, Cloudflare R2',
            estimated_completion: '2026-10-01',
            last_updated: '2026-07-18',
            is_featured: 1,
            is_published: 1,
            display_order: 2,
            created_at: '',
            updated_at: ''
          },
          {
            id: 'proj-3',
            title: 'Unified National Identity Bridge (UNIB)',
            slug: 'unified-national-identity-bridge',
            category: 'Government Tech',
            short_description: 'Strategic verification gateway connecting DS Tech biometric platforms directly with national registry ledgers for instantaneous pre-screening.',
            full_description: 'The Unified National Identity Bridge (UNIB) integrates state biometric verification protocols with sovereign national identity registers. By using high-performance secure edge endpoints, it verifies credential badges, checks fraud threat ratings in real-time using Gemini AI models, and logs secure verification histories on a transparent audit ledger.',
            cover_image_key: 'seeds/national_identity_bridge.png',
            gallery: '[]',
            status: 'Testing',
            progress_percentage: 90,
            technologies: 'Gemini 3.5 Flash, Cloudflare D1, secure API proxy, R2 Storage',
            estimated_completion: '2026-08-30',
            last_updated: '2026-07-18',
            is_featured: 0,
            is_published: 1,
            display_order: 3,
            created_at: '',
            updated_at: ''
          }
        ]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = projects.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300';
      case 'UI/UX Design': return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Frontend Development': return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Backend Development': return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Testing': return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Deployment': return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Completed': return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cyber Security': return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case 'Enterprise Cloud': return <Cpu className="h-4 w-4 text-blue-500" />;
      case 'Government Tech': return <Layers className="h-4 w-4 text-indigo-500" />;
      case 'AI & Automation': return <Terminal className="h-4 w-4 text-orange-500" />;
      default: return <Code2 className="h-4 w-4 text-amber-500" />;
    }
  };

  const titleText = language === 'zh' ? '当前开发中的项目实验室' : 'Enterprise Ongoing Projects & Labs';
  const subtitleText = language === 'zh' ? '实时透明公开：我们通过全透明的敏捷管线，随时向公众和客户公开最新研发成果和Sprint进度。' : 'High-velocity agile pipelines: Experience a real-time window into our engineering laboratories, tracking sprint deliverables, live status, and cryptographic validation.';
  const learnMoreLabel = language === 'zh' ? '查看技术详情规格 →' : 'Deep-Dive Specifications →';

  return (
    <section id="ongoing-projects" className="py-24 px-4 md:px-6 max-w-7xl mx-auto space-y-14 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-orange-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 border border-orange-500/30 font-mono text-[10px] uppercase tracking-widest font-black shadow-inner">
          <Clock className="h-3.5 w-3.5 animate-spin text-orange-500" />
          <span>Real-time Engineering Telemetry Matrix</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold uppercase font-serif tracking-tight leading-[1.1] text-slate-900 dark:text-white">
          {titleText}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-light leading-relaxed font-sans max-w-2xl mx-auto">
          {subtitleText}
        </p>
      </motion.div>

      {/* Category Tabs with High Motion Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap justify-center items-center gap-2.5 max-w-3xl mx-auto"
      >
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 border shadow-sm relative ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white border-orange-500 shadow-orange-500/25'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat !== 'All' && <span className={isActive ? 'text-white' : 'opacity-70'}>{getCategoryIcon(cat)}</span>}
              <span className="tracking-wide">{cat}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-2xl bg-white/20 pointer-events-none"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Grid of Projects with High Motion Cards */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-7 w-7 animate-spin text-orange-500" />
          <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing live pipelines from edge database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl max-w-md mx-auto space-y-2 bg-slate-50/50 dark:bg-slate-900/50"
        >
          <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 font-serif uppercase">No active sprints in this segment</p>
          <p className="text-xs text-slate-400">Please choose another category or check back during our next sprint update.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((proj, idx) => {
            const fallbackSvg = generateDynamicSvgUrl(proj.title, proj.category, 'project');
            const coverUrl = resolveImageUrl(proj.cover_image_key, fallbackSvg);

            return (
              <motion.div
                key={`${proj.id}-${proj.cover_image_key}`}
                initial={{ opacity: 0, y: 35, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  boxShadow: "0 25px 35px -10px rgba(0, 0, 0, 0.15), 0 0 20px rgba(249, 115, 22, 0.1)"
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-3xl shadow-lg flex flex-col justify-between overflow-hidden group relative cursor-pointer"
                onClick={() => setSelectedProject(proj)}
              >
                {/* Top Glowing Gradient Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Image & Badges Container */}
                <div className="relative h-52 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src={coverUrl} 
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-center object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = fallbackSvg;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Status Badge */}
                  <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-xl shadow-md font-sans backdrop-blur-md ${getStatusBg(proj.status)}`}>
                    {proj.status}
                  </span>

                  {/* Live Pulse Dot */}
                  <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-xl flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 font-bold uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live Lab</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1 font-mono">
                      {getCategoryIcon(proj.category)}
                      <span>{proj.category}</span>
                    </span>
                    <h3 className="font-extrabold text-base tracking-tight font-serif line-clamp-1 group-hover:text-orange-300 transition-colors">
                      {proj.title}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-5">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed font-sans line-clamp-3">
                    {proj.short_description}
                  </p>

                  {/* Tech Stack Pills */}
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.split(',').slice(0, 4).map((tech, i) => (
                        <span key={`${proj.id}-${tech.trim()}-${i}`} className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Live Progress Metrics with Shimmer */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest font-mono">
                      <span className="text-slate-400">Sprint Milestone Progress</span>
                      <span className="text-orange-500 font-extrabold">{proj.progress_percentage}%</span>
                    </div>
                    
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${proj.progress_percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 rounded-full relative overflow-hidden shadow-sm"
                      >
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Luxury Footer Button */}
                <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs font-extrabold text-slate-700 dark:text-slate-200 group-hover:bg-orange-500/5 transition-colors">
                  <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-serif uppercase tracking-wider">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>{learnMoreLabel}</span>
                  </span>
                  
                  <motion.div 
                    whileHover={{ x: 4 }}
                    className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deep-Dive Specifications Modal Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 max-w-2xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] space-y-6"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedProject(null)}
                className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-colors shadow-sm"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Title & category */}
              <div className="space-y-3">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 border rounded-xl shadow-sm ${getStatusBg(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
                <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight font-serif text-slate-900 dark:text-white leading-tight">
                  {selectedProject.title}
                </h3>
                <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Category Segment: {selectedProject.category}</span>
                </p>
              </div>

              {/* Overview Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-300 font-sans">
                {selectedProject.estimated_completion && (
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
                    <span>Estimated Launch: <strong className="text-slate-900 dark:text-white font-mono">{selectedProject.estimated_completion}</strong></span>
                  </div>
                )}
                {selectedProject.last_updated && (
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>Milestone Updated: <strong className="text-slate-900 dark:text-white font-mono">{selectedProject.last_updated}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 md:col-span-2 pt-3 border-t border-slate-200/50 dark:border-slate-800">
                  <Code2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="line-clamp-1">Agile Tech-Stack: <strong className="text-slate-900 dark:text-white font-mono text-[11px]">{selectedProject.technologies || 'None declared'}</strong></span>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4 font-sans text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                <p className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-widest font-mono">Engineering Specification Brief</p>
                <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border-l-4 border-orange-500 rounded-r-2xl">
                  <p className="italic text-xs font-medium text-slate-700 dark:text-slate-200">{selectedProject.short_description}</p>
                </div>
                <p className="text-xs sm:text-sm whitespace-pre-line font-normal leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedProject.full_description}
                </p>
              </div>

              {/* Progress track */}
              <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-widest font-mono">
                  <span className="text-slate-500">Current Phase Sprint Progress</span>
                  <span className="text-orange-500 font-bold">{selectedProject.progress_percentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedProject.progress_percentage}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 rounded-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold font-mono flex items-center gap-1.5 justify-center pt-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <span>State cryptographically authenticated & synchronized via Cloudflare D1 distributed edge clusters</span>
                </p>
              </div>

              {/* Modal Footer Action Button */}
              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 dark:text-slate-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md"
                >
                  Close Specifications
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

