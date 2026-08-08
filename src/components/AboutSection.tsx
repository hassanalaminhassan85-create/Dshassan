import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, Target, Edit, Trash2, Plus, Save, X, Image as ImageIcon, ArrowLeft, Sun, Moon, Loader2,
  Upload, ArrowUp, ArrowDown, CheckCircle2, UserCheck, Shield
} from 'lucide-react';
import { Logo } from './Logo';
import { 
  apiGetPageContent, 
  apiSavePageContent, 
  apiGetCacMetadata, 
  apiUploadGeneralFile, 
  resolveImageUrl,
  apiSubscribeToPageContent,
  apiSubscribeToCacMetadata
} from '../lib/api';

interface AboutSectionProps {
  isAdmin?: boolean;
  onBackToMain?: () => void;
  hideHeader?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ 
  isAdmin = false, 
  onBackToMain,
  hideHeader = false
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // CMS Content State
  const [content, setContent] = useState<any>({
    who_we_are: {
      badge: "WHO WE ARE",
      title_prefix: "The",
      title_accent: "Agency",
      title_suffix: "Story",
      description: "DS Tech operates at the intersection of elite software engineering, high-conversion digital marketing, and strict regulatory compliance. We don't just build websites; we architect digital authorities."
    },
    genesis: {
      heading: "The Genesis of DS Tech",
      paragraph1: "Before 2021, starting and scaling a fully compliant digital business in Nigeria required fragmented services. You needed one agency for branding, another for software development, and a completely separate law firm for corporate registry compliance. The process was disjointed, capital-heavy, and slow.",
      paragraph2: "DS Tech was formed to solve this. By bringing corporate attorneys, senior software developers, and Meta/Google ad consultants under a single, unified enterprise structure, we deliver bulletproof growth funnels alongside fully compliant legal setups."
    },
    mission: {
      heading: "Our Mission Statement",
      text: "To build high-performing digital engines, write flawless, micro-animated client interfaces, and process fast legal compliance certificates, ensuring West African brands command global authorities."
    },
    vision: {
      heading: "Our Corporate Vision",
      text: "To be the primary, most trusted full-stack digital product engineering and high-performance marketing agency in Sub-Saharan Africa by 2030, trusted by governments, enterprises, and innovators alike."
    },
    pillars: [
      { title: "Surgical Precision", desc: "We design code and target ad segments with mathematical clarity. No wasted efforts." },
      { title: "Ironclad Compliance", desc: "Every system, company name, and contract agreement we issue operates strictly within Nigerian federal statutes." },
      { title: "Continuous Innovation", desc: "We integrate state-of-the-art visual frameworks (Tailwind, Framer Motion) and AI engines before others know they exist." }
    ],
    leadership: [
      { id: '1', name: "Hassan Al-Amin", role: "Founder & Chief Architect", bio: "Ex-Google Consultant, digital marketing strategist, and systems design expert.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=60" },
      { id: '2', name: "Barr. Chidi Onyekwelu", role: "Chief of Legal & Compliance", bio: "Corporate registry attorney, specialized in CAC, tax restructuring, and SCUML protocols.", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=60" },
      { id: '3', name: "David Alao Chibuzor", role: "Director of Software Engineering", bio: "Full-stack engineer, React 19 visualizer, and generative AI specialist.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=60" }
    ],
    team: [
      { id: 't1', name: "Tunde Olanrewaju", role: "Senior Frontend Engineer" },
      { id: 't2', name: "Amara Nwosu", role: "Lead Creative Designer" },
      { id: 't3', name: "Musa Ibrahim", role: "Digital Campaigns Lead" },
      { id: 't4', name: "Yusuf Ibrahim Garki", role: "Academic Mentor & Advisor" }
    ],
    timeline: [
      { id: 'tm1', year: "2021", title: "Foundation", desc: "Launched as a boutique digital campaign consultancy in Abuja, Nigeria." },
      { id: 'tm2', year: "2023", title: "Incorporation & Expansion", desc: "Officially incorporated with CAC (RC: 1845921) and expanded into custom Web Development." },
      { id: 'tm3', year: "2024", title: "Training Academy & Compliance Nodes", desc: "Launched the vocational training catalog and legal compliance branch helping 200+ local companies." },
      { id: 'tm4', year: "2026", title: "The Next-Gen Digital Ecosystem", desc: "Integrated AI Solutions, custom Gemini systems, and an offline-first Client Portal platform." }
    ]
  });

  const [publishedCac, setPublishedCac] = useState<any>(null);

  // Load Content from Firestore with Real-time Sync
  useEffect(() => {
    setIsLoading(true);
    
    const unsubContent = apiSubscribeToPageContent('about_company', (remote) => {
      if (remote && remote.content) {
        setContent(prev => ({
          ...prev,
          ...remote.content
        }));
      }
      setIsLoading(false);
    });

    const unsubCac = apiSubscribeToCacMetadata((cacData) => {
      if (cacData && cacData.length > 0) {
        const published = cacData.find((c: any) => c.is_published === 1) || cacData[0];
        if (published) {
          setPublishedCac(published);
        }
      }
    });

    return () => {
      unsubContent();
      unsubCac();
    };
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await apiSavePageContent('about_company', content);
      alert('About content updated successfully!');
    } catch (e) {
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const [editingLeader, setEditingLeader] = useState<any | null>(null);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [uploadingLeaderImg, setUploadingLeaderImg] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingLeader) return;

    try {
      setUploadingLeaderImg(true);
      try {
        const res = await apiUploadGeneralFile(file);
        if (res && res.url) {
          setEditingLeader((prev: any) => ({ ...prev, image: res.url }));
          showToast("Leader photo uploaded!");
          return;
        }
      } catch (err) {
        console.warn("Server upload failed, converting to DataURL:", err);
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditingLeader((prev: any) => ({ ...prev, image: reader.result as string }));
          showToast("Leader photo attached!");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Leader image upload failed:", err);
      alert("Could not attach image.");
    } finally {
      setUploadingLeaderImg(false);
    }
  };

  const moveLeader = (index: number, direction: 'up' | 'down') => {
    const newLeadership = [...content.leadership];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newLeadership.length) return;
    const temp = newLeadership[index];
    newLeadership[index] = newLeadership[targetIdx];
    newLeadership[targetIdx] = temp;
    setContent({ ...content, leadership: newLeadership });
    showToast("Leader reordered!");
  };

  const handleSaveLeader = () => {
    if (!editingLeader.name) return;
    let newLeadership;
    if (editingLeader.isNew) {
      newLeadership = [...content.leadership, { ...editingLeader, id: Date.now().toString(), isNew: undefined }];
    } else {
      newLeadership = content.leadership.map((l: any) => l.id === editingLeader.id ? editingLeader : l);
    }
    setContent({ ...content, leadership: newLeadership });
    setEditingLeader(null);
    showToast("Leader details updated!");
  };

  const handleSaveTeam = () => {
    if (!editingTeam.name) return;
    let newTeam;
    if (editingTeam.isNew) {
      newTeam = [...content.team, { ...editingTeam, id: Date.now().toString(), isNew: undefined }];
    } else {
      newTeam = content.team.map((t: any) => t.id === editingTeam.id ? editingTeam : t);
    }
    setContent({ ...content, team: newTeam });
    setEditingTeam(null);
    showToast("Team member updated!");
  };

  const deleteLeader = (id: string) => {
    if (window.confirm('Delete this leader profile?')) {
      setContent({ ...content, leadership: content.leadership.filter((l: any) => l.id !== id) });
      showToast("Leader removed!");
    }
  };

  const deleteTeam = (id: string) => {
    if (window.confirm('Delete this team member?')) {
      setContent({ ...content, team: content.team.filter((t: any) => t.id !== id) });
      showToast("Team member removed!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <span className="text-slate-400 font-mono text-xs uppercase tracking-widest">Loading Corporate Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-500 relative flex flex-col w-full`}>
      {/* Top Standalone Header Bar */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-8 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToMain}>
              <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
              >
                {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                <span>{isSaving ? 'Syncing...' : 'Save All CMS Changes'}</span>
              </button>
            )}

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
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm ${isPreviewMode ? 'bg-orange-100 dark:bg-orange-900' : ''}`}
            >
              <Eye size={15} className={isPreviewMode ? 'text-orange-500' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm"
            >
              {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
            </button>
          </div>
        </header>
      )}

      {/* Floating Save Button for Embedded Admin Mode */}
      {isAdmin && hideHeader && (
        <div className="sticky top-0 z-50 flex justify-end p-4 pointer-events-none">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="pointer-events-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-2xl flex items-center gap-2 shadow-2xl disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95 border border-emerald-500/30"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{isSaving ? 'Synchronizing Data...' : 'Persist CMS Changes'}</span>
          </button>
        </div>
      )}
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 space-y-20 py-10 animate-fade-in text-left">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-xs uppercase tracking-widest font-black">
              {isAdmin ? (
                <input 
                  value={content.who_we_are.badge} 
                  onChange={(e) => setContent({...content, who_we_are: {...content.who_we_are, badge: e.target.value}})}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none w-32 text-slate-900 dark:text-white"
                />
              ) : content.who_we_are.badge}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white flex flex-wrap gap-x-3 items-baseline">
            {isAdmin && !isPreviewMode ? (
              <>
                <input 
                  value={content.who_we_are.title_prefix} 
                  onChange={(e) => setContent({...content, who_we_are: {...content.who_we_are, title_prefix: e.target.value}})}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none w-24 text-slate-900 dark:text-white"
                />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">
                  <input 
                    value={content.who_we_are.title_accent} 
                    onChange={(e) => setContent({...content, who_we_are: {...content.who_we_are, title_accent: e.target.value}})}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none w-36 italic text-slate-900 dark:text-white"
                  />
                </span>
                <input 
                  value={content.who_we_are.title_suffix} 
                  onChange={(e) => setContent({...content, who_we_are: {...content.who_we_are, title_suffix: e.target.value}})}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none w-32 text-slate-900 dark:text-white"
                />
              </>
            ) : (
              <>
                {content.who_we_are.title_prefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">{content.who_we_are.title_accent}</span> {content.who_we_are.title_suffix}
              </>
            )}
          </h1>

          {isAdmin ? (
            <textarea 
              value={content.who_we_are.description} 
              onChange={(e) => setContent({...content, who_we_are: {...content.who_we_are, description: e.target.value}})}
              className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:border-orange-500 outline-none w-full text-xs md:text-sm font-medium min-h-[100px] text-slate-700 dark:text-slate-300 shadow-sm"
            />
          ) : (
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-4xl font-medium">
              {content.who_we_are.description}
            </p>
          )}
        </div>

        {/* 1. OUR GENESIS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight text-slate-900 dark:text-white border-l-4 border-orange-500 pl-4">
              {isAdmin ? (
                <input 
                  value={content.genesis.heading} 
                  onChange={(e) => setContent({...content, genesis: {...content.genesis, heading: e.target.value}})}
                  className="bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-orange-500 outline-none w-full"
                />
              ) : content.genesis.heading}
            </h2>
            
            {isAdmin ? (
              <div className="space-y-4">
                <textarea 
                  value={content.genesis.paragraph1} 
                  onChange={(e) => setContent({...content, genesis: {...content.genesis, paragraph1: e.target.value}})}
                  className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:border-orange-500 outline-none w-full text-xs leading-relaxed font-medium min-h-[100px] text-slate-700 dark:text-slate-300 shadow-sm"
                />
                <textarea 
                  value={content.genesis.paragraph2} 
                  onChange={(e) => setContent({...content, genesis: {...content.genesis, paragraph2: e.target.value}})}
                  className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:border-orange-500 outline-none w-full text-xs leading-relaxed font-medium min-h-[100px] text-slate-700 dark:text-slate-300 shadow-sm"
                />
              </div>
            ) : (
              <>
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
                  {content.genesis.paragraph1}
                </p>
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
                  {content.genesis.paragraph2}
                </p>
              </>
            )}
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                <Target size={18} />
              </div>
              <div className="flex-1">
                {isAdmin ? (
                  <>
                    <input 
                      value={content.mission.heading} 
                      onChange={(e) => setContent({...content, mission: {...content.mission, heading: e.target.value}})}
                      className="bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-orange-500 outline-none w-full text-xs font-black uppercase font-serif text-slate-900 dark:text-white mb-1"
                    />
                    <textarea 
                      value={content.mission.text} 
                      onChange={(e) => setContent({...content, mission: {...content.mission, text: e.target.value}})}
                      className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:border-orange-500 outline-none w-full text-xs leading-relaxed mt-1"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-black uppercase font-serif text-slate-900 dark:text-white mb-1">{content.mission.heading}</h3>
                    <p className="text-slate-700 dark:text-slate-200 text-[13px] leading-relaxed font-medium">
                      {content.mission.text}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-4 items-start border-t border-slate-200/40 dark:border-slate-800 pt-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                <Eye size={18} />
              </div>
              <div className="flex-1">
                {isAdmin ? (
                  <>
                    <input 
                      value={content.vision.heading} 
                      onChange={(e) => setContent({...content, vision: {...content.vision, heading: e.target.value}})}
                      className="bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-orange-500 outline-none w-full text-xs font-black uppercase font-serif text-slate-900 dark:text-white mb-1"
                    />
                    <textarea 
                      value={content.vision.text} 
                      onChange={(e) => setContent({...content, vision: {...content.vision, text: e.target.value}})}
                      className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:border-orange-500 outline-none w-full text-xs leading-relaxed mt-1"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-black uppercase font-serif text-slate-900 dark:text-white mb-1">{content.vision.heading}</h3>
                    <p className="text-slate-700 dark:text-slate-200 text-[13px] leading-relaxed font-medium">
                      {content.vision.text}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. CORE VALUES */}
        <section className="space-y-10">
          <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight text-slate-900 dark:text-white border-l-4 border-orange-500 pl-4">
            Our Core Pillars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.pillars.map((val: any, i: number) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800 shadow-sm space-y-2 relative group">
                <span className="text-orange-500 font-mono text-xs font-bold block">0{i+1}</span>
                {isAdmin ? (
                  <>
                    <input 
                      value={val.title} 
                      onChange={(e) => {
                        const newPillars = [...content.pillars];
                        newPillars[i].title = e.target.value;
                        setContent({...content, pillars: newPillars});
                      }}
                      className="bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-orange-500 outline-none w-full font-extrabold text-slate-900 dark:text-white text-sm uppercase font-serif"
                    />
                    <textarea 
                      value={val.desc} 
                      onChange={(e) => {
                        const newPillars = [...content.pillars];
                        newPillars[i].desc = e.target.value;
                        setContent({...content, pillars: newPillars});
                      }}
                      className="bg-transparent border border-slate-100 dark:border-slate-800 rounded p-2 focus:border-orange-500 outline-none w-full text-xs leading-relaxed font-light mt-1"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase font-serif">{val.title}</h3>
                    <p className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed font-medium">{val.desc}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 4. LEADERSHIP TEAM */}
        <section className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight text-slate-900 dark:text-white border-l-4 border-orange-500 pl-4">
                Leadership Team
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pl-5 mt-1">
                Executive directors and principal architects driving corporate strategy and technological innovation.
              </p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setEditingLeader({ isNew: true, name: '', role: '', bio: '', image: '' })}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 shrink-0"
              >
                <Plus size={14} /> Add Leader Profile
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.leadership.map((leader: any, i: number) => (
              <motion.div 
                key={leader.id || i}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="h-64 overflow-hidden relative bg-slate-950">
                    <img 
                      src={resolveImageUrl(leader.image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop&q=60')} 
                      alt={leader.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                    
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-md">
                      <UserCheck size={12} className="text-orange-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">Executive</span>
                    </div>

                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur p-1.5 rounded-xl border border-white/10 shadow-lg">
                        <button 
                          onClick={() => moveLeader(i, 'up')} 
                          disabled={i === 0}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button 
                          onClick={() => moveLeader(i, 'down')} 
                          disabled={i === content.leadership.length - 1}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button 
                          onClick={() => setEditingLeader(leader)} 
                          className="p-1.5 hover:bg-orange-500 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Edit Leader"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => deleteLeader(leader.id)} 
                          className="p-1.5 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Delete Leader"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-2.5 text-left">
                    <h3 className="font-black text-slate-900 dark:text-white text-base uppercase font-serif tracking-tight">{leader.name}</h3>
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider block font-mono">{leader.role}</span>
                    <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">{leader.bio}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => setEditingLeader(leader)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Edit size={12} /> Edit Profile & Role
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. TEAM MEMBERS */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold uppercase font-serif tracking-tight text-slate-900 dark:text-white">
              Our Domain Experts
            </h3>
            {isAdmin && (
              <button 
                onClick={() => setEditingTeam({ isNew: true, name: '', role: '' })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-orange-500 transition-colors"
              >
                <Plus size={12} /> Add Team Member
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {content.team.map((member: any, i: number) => (
              <div key={member.id || i} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center relative group shadow-sm">
                <span className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide block font-serif">{member.name}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block mt-1">{member.role}</span>
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingTeam(member)} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                      <Edit size={10} />
                    </button>
                    <button onClick={() => deleteTeam(member.id)} className="p-1 bg-rose-100 text-rose-600 rounded">
                      <Trash2 size={10} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. CERTIFICATIONS */}
        <section className="p-6 md:p-8 bg-indigo-950 text-white rounded-3xl border border-indigo-900 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full filter blur-2xl pointer-events-none" />
          <div className="space-y-2 text-center md:text-left">
            <span className="text-orange-400 text-xs uppercase tracking-widest font-black">REGULATORY COMPLIANCE</span>
            <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight leading-tight">
              Accredited & <br />
              <span className="text-orange-400 font-extrabold italic">FIRS Authorized Entity</span>
            </h2>
            <p className="text-slate-200 text-xs max-w-xl leading-relaxed font-medium">
              DS Tech operates as an incorporated agency with full legal clearances. We maintain compliance reporting logs with CAC, FIRS (TIN processing node), and the Special Control Unit Against Money Laundering (SCUML).
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="text-orange-400 font-mono text-xs font-bold block">{publishedCac?.registration_number || 'RC 1845921'}</span>
              <span className="text-[9px] text-slate-300 uppercase font-black">CAC Incorporated</span>
            </div>
            <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="text-orange-400 font-mono text-xs font-bold block">SCUML Approved</span>
              <span className="text-[9px] text-slate-300 uppercase font-black">Anti-Money Laundering</span>
            </div>
          </div>
        </section>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 text-xs font-black uppercase tracking-wider"
            >
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Modals */}
        <AnimatePresence>
          {editingLeader && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-left"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase font-serif">
                      {editingLeader.isNew ? 'Add Leadership Profile' : 'Edit Leader Details'}
                    </h3>
                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
                      Executive Profile Editor
                    </p>
                  </div>
                  <button 
                    onClick={() => setEditingLeader(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-xl"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      value={editingLeader.name || ''}
                      onChange={(e) => setEditingLeader({ ...editingLeader, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                      placeholder="e.g. Hassan Al-Amin"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Executive Role / Designation *
                    </label>
                    <input 
                      type="text" 
                      value={editingLeader.role || ''}
                      onChange={(e) => setEditingLeader({ ...editingLeader, role: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono"
                      placeholder="e.g. Founder & Chief Architect"
                    />
                  </div>

                  {/* Photo Upload Component */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Leader Headshot Photo</span>
                      <span className="text-[9px] text-orange-500 font-bold">Upload file or enter URL</span>
                    </label>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <label className="w-full sm:w-auto px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all shrink-0">
                        {uploadingLeaderImg ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        <span>{uploadingLeaderImg ? 'Uploading...' : 'Choose Photo File'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLeaderImageUpload}
                          className="hidden" 
                        />
                      </label>

                      <input 
                        type="text" 
                        value={editingLeader.image || ''}
                        onChange={(e) => setEditingLeader({ ...editingLeader, image: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                        placeholder="https://..."
                      />
                    </div>

                    {editingLeader.image && (
                      <div className="relative mt-2 h-24 w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
                        <img 
                          src={resolveImageUrl(editingLeader.image)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Executive Bio / Summary *
                    </label>
                    <textarea 
                      rows={3}
                      value={editingLeader.bio || ''}
                      onChange={(e) => setEditingLeader({ ...editingLeader, bio: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-orange-500 resize-none"
                      placeholder="Write executive bio and professional background..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setEditingLeader(null)} 
                    className="px-4 py-2 text-xs font-black uppercase text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveLeader} 
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
                  >
                    Save Leader
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {editingTeam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-left"
              >
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase font-serif">
                  {editingTeam.isNew ? 'Add Team Member' : 'Edit Team Member'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 mb-1">Member Name</label>
                    <input 
                      type="text" 
                      value={editingTeam.name}
                      onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 mb-1">Role / Specialization</label>
                    <input 
                      type="text" 
                      value={editingTeam.role}
                      onChange={(e) => setEditingTeam({ ...editingTeam, role: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button onClick={() => setEditingTeam(null)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                  <button onClick={handleSaveTeam} className="px-5 py-2 bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl">Save</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
