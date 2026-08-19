import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Target, Eye, ShieldCheck, Award, Users, Sparkles, 
  CheckCircle2, Plus, Trash2, Edit3, Save, Upload, MapPin, 
  Briefcase, Phone, Mail, ArrowRight, Compass, Shield
} from 'lucide-react';
import { 
  apiSubscribeToPageContent, apiSavePageContent, 
  apiSubscribeToCacMetadata, apiUploadFile, resolveImageUrl 
} from '../lib/api';
import { StandalonePageHeader } from './StandalonePageHeader';
import { StandalonePageFooter } from './StandalonePageFooter';

interface AboutSectionProps {
  isAdmin?: boolean;
  onBackToMain?: () => void;
  hideHeader?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ isAdmin = false, onBackToMain, hideHeader = false }) => {

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Content state
  const [content, setContent] = useState<any>({
    title: 'Architecting Digital Authority & Enterprise Scale',
    subtitle: 'DS Tech & Digital Marketing Agency is a premier technology architecture, performance advertising, and vocational training corporate ecosystem headquartered in Abuja, Nigeria.',
    story: 'Founded with a vision to redefine corporate digital footprint across West Africa, DS Tech combines military-grade software architecture with high-conversion performance marketing engines. Our multidisciplinary team of senior software engineers, media buyers, brand strategists, and regulatory legal advisors empower brands to establish dominant online authority.',
    mission: 'To construct high-yield digital infrastructure, automate corporate compliance, and nurture elite technical talent that accelerates enterprise growth across emerging markets.',
    vision: 'To be West Africa’s most trusted technology architecture and digital transformation ecosystem by 2030.',
    pillars: [
      { id: '1', title: 'High-Impact Software Engineering', description: 'Developing resilient, scalable enterprise web and mobile applications with micro-animated user interfaces.' },
      { id: '2', title: 'Data-Driven Media Bidding', description: 'Architecting targeted ad campaigns that generate high ROI and verified conversion pipelines.' },
      { id: '3', title: 'Corporate Regulatory Clearance', description: 'Streamlining CAC incorporation, SCUML anti-money laundering certifications, and FIRS tax setups.' },
      { id: '4', title: 'Vocational Technical Academy', description: 'Empowering future tech leaders through intensive, industry-aligned upskilling and mentorship.' }
    ],
    leadership: [
      { id: 'l1', name: 'Engr. David Solomon', title: 'Managing Director & Founder', bio: 'Enterprise Systems Architect with over 10 years of expertise in software engineering and digital media strategy.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
      { id: 'l2', name: 'Dr. Amina Bello', title: 'Head of Regulatory Affairs & Compliance', bio: 'Corporate legal strategist specializing in CAC statutory clearance, FIRS tax compliance, and SCUML certifications.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' }
    ],
    team: [
      { id: 't1', name: 'Emmanuel Okonkwo', role: 'Lead Frontend Architect', department: 'Software Engineering' },
      { id: 't2', name: 'Fatima Zahra', role: 'Head of Performance Marketing', department: 'Digital Strategy' },
      { id: 't3', name: 'Chidi Nnamdi', role: 'Senior DevOps & Security Lead', department: 'Infrastructure' }
    ]
  });

  const [cacData, setCacData] = useState<any>(null);

  useEffect(() => {
    const unsubContent = apiSubscribeToPageContent('about_page', (data) => {
      if (data && Object.keys(data).length > 0) {
        setContent((prev: any) => ({ ...prev, ...data }));
      }
    });

    const unsubCac = apiSubscribeToCacMetadata((cacList) => {
      if (cacList && cacList.length > 0) {
        const published = cacList.find((c: any) => c.is_published === 1) || cacList[0];
        setCacData(published);
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
      await apiSavePageContent('about_page', content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save about page:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeadershipUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await apiUploadFile(file);
      setContent((prev: any) => ({
        ...prev,
        leadership: prev.leadership.map((l: any) => l.id === id ? { ...l, image: url } : l)
      }));
    } catch (err) {
      alert('Failed to upload image file.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-500 flex flex-col w-full selection:bg-orange-500 selection:text-white">
      {/* Standalone Header */}
      {!hideHeader && (
        <StandalonePageHeader 
          activePage="about" 
          badgeText="COMPANY OVERVIEW" 
          onBackToMain={onBackToMain}
          extraActions={
            isAdmin ? (
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save CMS'}</span>
              </button>
            ) : null
          }
        />
      )}

      {/* Main Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16 animate-fade-in text-left">
        
        {/* HERO BANNER */}
        <section className="relative rounded-3xl bg-gradient-to-br from-[#000E32] via-[#011442] to-slate-950 text-white p-6 sm:p-10 md:p-12 overflow-hidden border border-indigo-950 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5 text-orange-400" />
              <span>ESTABLISHED 2021 | ABUJA, NIGERIA</span>
            </div>

            {isAdmin ? (
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-3 text-2xl font-bold text-white font-serif"
              />
            ) : (
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase font-serif">
                Architecting Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 font-extrabold italic">
                  Authority & Scale
                </span>
              </h1>
            )}

            {isAdmin ? (
              <textarea
                value={content.subtitle}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-3 text-xs text-slate-200"
                rows={3}
              />
            ) : (
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl font-light">
                {content.subtitle}
              </p>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">2021</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Founding Year</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">RC: 1845921</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">CAC Registered</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">200+</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Enterprise Clients</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">3 Core Nodes</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Tech, Ads, Academy</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: GENESIS STORY & MISSION/VISION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Genesis Story */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 text-orange-500 font-mono text-xs font-black uppercase tracking-widest">
              <Compass size={16} />
              <span>THE GENESIS STORY</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif tracking-tight">
              Built on Technical Rigor & Legal Integrity
            </h2>

            {isAdmin ? (
              <textarea
                value={content.story}
                onChange={(e) => setContent({ ...content, story: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-xs leading-relaxed"
                rows={6}
              />
            ) : (
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal space-y-4">
                {content.story}
              </p>
            )}
          </div>

          {/* Right Column: Mission & Vision Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Mission Card */}
            <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-500/15 dark:to-transparent rounded-3xl p-6 border border-orange-500/20 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
                  <Target size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-serif">Our Mission</h3>
              </div>
              {isAdmin ? (
                <textarea
                  value={content.mission}
                  onChange={(e) => setContent({ ...content, mission: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-orange-500/30 rounded-xl p-3 text-xs"
                  rows={3}
                />
              ) : (
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
                  {content.mission}
                </p>
              )}
            </div>

            {/* Vision Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent dark:from-indigo-500/15 dark:to-transparent rounded-3xl p-6 border border-indigo-500/20 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
                  <Eye size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-serif">Our Vision</h3>
              </div>
              {isAdmin ? (
                <textarea
                  value={content.vision}
                  onChange={(e) => setContent({ ...content, vision: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-xl p-3 text-xs"
                  rows={3}
                />
              ) : (
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
                  {content.vision}
                </p>
              )}
            </div>

          </div>
        </section>

        {/* SECTION 2: CORE OPERATIONAL PILLARS */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-orange-500 font-mono text-xs font-black uppercase tracking-widest">
              WHAT DRIVES OUR SYSTEM
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif uppercase tracking-wide">
              Core Operational Pillars
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">
              Four foundational pillars powering enterprise digital transformation across Nigeria and international markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.pillars?.map((pillar: any, idx: number) => (
              <div 
                key={pillar.id || idx}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-3xl font-mono font-black text-orange-500/20 block">
                    0{idx + 1}
                  </span>
                  
                  {isAdmin ? (
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => {
                        const newPillars = [...content.pillars];
                        newPillars[idx].title = e.target.value;
                        setContent({ ...content, pillars: newPillars });
                      }}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-bold"
                    />
                  ) : (
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-serif">
                      {pillar.title}
                    </h3>
                  )}

                  {isAdmin ? (
                    <textarea
                      value={pillar.description}
                      onChange={(e) => {
                        const newPillars = [...content.pillars];
                        newPillars[idx].description = e.target.value;
                        setContent({ ...content, pillars: newPillars });
                      }}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs"
                      rows={3}
                    />
                  ) : (
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-orange-500 font-mono text-[10px] font-bold uppercase">
                  <CheckCircle2 size={12} />
                  <span>Enterprise Standard</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: EXECUTIVE LEADERSHIP & DIRECTORATE */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-orange-500 font-mono text-xs font-black uppercase tracking-widest">
                EXECUTIVE BOARD
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif uppercase tracking-wide mt-1">
                Leadership & Governance
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  const newLead = {
                    id: `l_${Date.now()}`,
                    name: 'New Executive',
                    title: 'Director',
                    bio: 'Executive summary details here...',
                    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                  };
                  setContent({ ...content, leadership: [...(content.leadership || []), newLead] });
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
              >
                <Plus size={14} />
                <span>Add Executive</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.leadership?.map((exec: any, idx: number) => (
              <div 
                key={exec.id || idx}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-6 items-start relative group"
              >
                {/* Photo container */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-950 shrink-0 relative border border-slate-200 dark:border-slate-800">
                  <img 
                    src={resolveImageUrl(exec.image)} 
                    alt={exec.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {isAdmin && (
                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <Upload size={18} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleLeadershipUpload(exec.id, e)} 
                      />
                    </label>
                  )}
                </div>

                {/* Info Container */}
                <div className="space-y-3 flex-1">
                  <div>
                    {isAdmin ? (
                      <input
                        type="text"
                        value={exec.name}
                        onChange={(e) => {
                          const newLead = [...content.leadership];
                          newLead[idx].name = e.target.value;
                          setContent({ ...content, leadership: newLead });
                        }}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-sm font-bold"
                      />
                    ) : (
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-serif">
                        {exec.name}
                      </h3>
                    )}

                    {isAdmin ? (
                      <input
                        type="text"
                        value={exec.title}
                        onChange={(e) => {
                          const newLead = [...content.leadership];
                          newLead[idx].title = e.target.value;
                          setContent({ ...content, leadership: newLead });
                        }}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-1.5 text-xs text-orange-500 font-mono mt-1"
                      />
                    ) : (
                      <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mt-0.5">
                        {exec.title}
                      </span>
                    )}
                  </div>

                  {isAdmin ? (
                    <textarea
                      value={exec.bio}
                      onChange={(e) => {
                        const newLead = [...content.leadership];
                        newLead[idx].bio = e.target.value;
                        setContent({ ...content, leadership: newLead });
                      }}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs"
                      rows={3}
                    />
                  ) : (
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-normal">
                      {exec.bio}
                    </p>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setContent({
                          ...content,
                          leadership: content.leadership.filter((l: any) => l.id !== exec.id)
                        });
                      }}
                      className="text-red-500 hover:text-red-600 text-xs font-bold uppercase flex items-center gap-1 pt-2"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: CAC & STATUTORY ACCREDITATION BANNER */}
        <section className="bg-gradient-to-r from-slate-900 via-[#000E32] to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest">
                <ShieldCheck size={14} />
                <span>OFFICIAL STATUTORY ACCREDITATION</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif">
                Fully Incorporated & Regulatory Compliant
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                DS Tech & Digital Marketing Agency operates under full corporate registration in the Federal Republic of Nigeria.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-3 shrink-0 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-amber-400" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">CAC RC NUMBER</span>
                  <span className="text-xl font-black text-white font-mono">1845921</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4 text-[11px] font-mono text-slate-300">
                <span>SCUML Anti-Money Laundering</span>
                <span className="text-emerald-400 font-bold">VERIFIED</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Standalone Footer */}
      <StandalonePageFooter />
    </div>
  );
};
