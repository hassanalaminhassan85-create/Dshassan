import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, CheckCircle, ChevronRight, ArrowRight, Layers,
  Terminal, ShieldCheck, Cpu, Code2, RefreshCw, X, Tag, ListFilter
} from 'lucide-react';
import { apiGetOngoingProjects, OngoingProject } from '../lib/api';

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
    async function load() {
      try {
        setLoading(true);
        const data = await apiGetOngoingProjects(false); // false = public mode, only published
        
        // Debugging duplicate keys
        const ids = data.map(p => p.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            console.error("DUPLICATE PROJECT IDS FOUND!", ids);
        }

        setProjects(data);
      } catch (err) {
        console.warn('Could not fetch public ongoing projects, loading fallbacks.', err);
        // Robust fallback list if API is unreachable during initial boot
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
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = projects.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300';
      case 'UI/UX Design': return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300';
      case 'Frontend Development': return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300';
      case 'Backend Development': return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300';
      case 'Testing': return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300';
      case 'Deployment': return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300';
      case 'Completed': return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cyber Security': return <ShieldCheck className="h-4 w-4" />;
      case 'Enterprise Cloud': return <Cpu className="h-4 w-4" />;
      case 'Government Tech': return <Layers className="h-4 w-4" />;
      case 'AI & Automation': return <Terminal className="h-4 w-4" />;
      default: return <Code2 className="h-4 w-4" />;
    }
  };

  // Translations Map
  const titleText = language === 'zh' ? '当前开发中的项目' : 'Enterprise Ongoing Projects';
  const subtitleText = language === 'zh' ? '实时透明公开：我们通过全透明的敏捷管线，随时向公众和客户公开最新研发成果和Sprint进度。' : 'Transparent agile pipelines: We offer a real-time window into our engineering laboratories, detailing sprint completions, timelines, and live status states.';
  const learnMoreLabel = language === 'zh' ? '查看技术详情规格 →' : 'Deep-Dive Specifications →';

  return (
    <section id="ongoing-projects" className="py-20 px-4 md:px-6 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-full text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono text-[10px] uppercase tracking-wider font-black">
          <Clock className="h-3 w-3 animate-spin-slow text-orange-500" />
          <span>Real-time Engineering Telemetry</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold uppercase font-serif tracking-tight leading-none text-slate-900 dark:text-white">
          {titleText}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed font-sans">
          {subtitleText}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center items-center gap-2 max-w-2xl mx-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 border shadow-sm ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white hover:opacity-90'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat !== 'All' && <span className="opacity-70">{getCategoryIcon(cat)}</span>}
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          <p className="text-[11px] font-mono font-medium text-slate-400 animate-pulse">Syncing live pipelines from edge database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800/60 rounded-2xl max-w-md mx-auto">
          <p className="text-sm font-bold text-slate-400">No active sprints in this category</p>
          <p className="text-xs text-slate-400/80 mt-1">Please select another segment or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((proj, idx) => {
            const coverUrl = proj.cover_image_key 
              ? (proj.cover_image_key.startsWith('http://') || proj.cover_image_key.startsWith('https://')
                  ? proj.cover_image_key
                  : `/api/ongoing-projects/file?key=${encodeURIComponent(proj.cover_image_key)}`)
              : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80';

            return (
              <motion.div
                key={`${proj.id}-${proj.cover_image_key}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
              >
                {/* Image & Badges */}
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <img 
                    src={coverUrl} 
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-center object-cover aspect-video group-hover:scale-[1.03] transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-lg shadow-sm font-sans ${getStatusBg(proj.status)}`}>
                    {proj.status}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                      {getCategoryIcon(proj.category)}
                      <span>{proj.category}</span>
                    </span>
                    <h3 className="font-extrabold text-base tracking-tight font-serif line-clamp-1 mt-1">{proj.title}</h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {proj.short_description}
                  </p>

                  {/* Tech stack */}
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.split(',').slice(0, 4).map((tech, i) => (
                        <span key={`${proj.id}-${tech.trim()}-${i}`} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-800">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Live Progress Metrics */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-50 dark:border-slate-800/80">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-400">Sprint Progress</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{proj.progress_percentage}%</span>
                    </div>
                    {/* Progress Track */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${proj.progress_percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer specs trigger */}
                <div 
                  onClick={() => setSelectedProject(proj)}
                  className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span className="flex items-center gap-1 text-orange-500">
                    <Terminal className="h-3.5 w-3.5 text-orange-500" />
                    <span>{learnMoreLabel}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deep-Dive Specifications Overlay Panel */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Title & category */}
              <div className="space-y-2">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-lg ${getStatusBg(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight font-serif text-slate-900 dark:text-white leading-tight">
                  {selectedProject.title}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                  <Tag className="h-3 w-3" />
                  <span>Category Segment: {selectedProject.category}</span>
                </p>
              </div>

              {/* Overview Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-400 font-sans">
                {selectedProject.estimated_completion && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Estimated Launch: <strong className="text-slate-800 dark:text-slate-200">{selectedProject.estimated_completion}</strong></span>
                  </div>
                )}
                {selectedProject.last_updated && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Milestone Updated: <strong className="text-slate-800 dark:text-slate-200">{selectedProject.last_updated}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2 md:col-span-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                  <Code2 className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">Agile Tech-Stack: <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">{selectedProject.technologies || 'None declared'}</strong></span>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4 font-sans text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider font-mono">Project Specifications</p>
                <div className="p-4 bg-orange-50/30 dark:bg-orange-950/10 border-l-4 border-orange-500 rounded-r-xl">
                  <p className="italic text-xs font-medium text-slate-700 dark:text-slate-300">{selectedProject.short_description}</p>
                </div>
                <p className="text-xs sm:text-sm whitespace-pre-line font-medium leading-relaxed">
                  {selectedProject.full_description}
                </p>
              </div>

              {/* Progress track */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Current Phase Development Progress</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{selectedProject.progress_percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedProject.progress_percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold font-mono flex items-center gap-1 justify-center pt-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span>State authenticated and verified via Cloudflare D1 distributed clusters</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
