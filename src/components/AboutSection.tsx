import React from 'react';
import { motion } from 'motion/react';
import { 
  History, Eye, Target, Users, Award, ShieldCheck, 
  MapPin, Clock, Calendar, CheckCircle2, ChevronRight, Briefcase 
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const leadership = [
    { name: "Hassan Al-Amin", role: "Founder & Chief Architect", bio: "Ex-Google Consultant, digital marketing strategist, and systems design expert.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=60" },
    { name: "Barr. Chidi Onyekwelu", role: "Chief of Legal & Compliance", bio: "Corporate registry attorney, specialized in CAC, tax restructuring, and SCUML protocols.", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=60" },
    { name: "David Alao Chibuzor", role: "Director of Software Engineering", bio: "Full-stack engineer, React 19 visualizer, and generative AI specialist.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=60" }
  ];

  const team = [
    { name: "Tunde Olanrewaju", role: "Senior Frontend Engineer" },
    { name: "Amara Nwosu", role: "Lead Creative Designer" },
    { name: "Musa Ibrahim", role: "Digital Campaigns Lead" },
    { name: "Yusuf Ibrahim Garki", role: "Academic Mentor & Advisor" }
  ];

  const timeline = [
    { year: "2021", title: "Foundation", desc: "Launched as a boutique digital campaign consultancy in Abuja, Nigeria." },
    { year: "2023", title: "Incorporation & Expansion", desc: "Officially incorporated with CAC (RC: 1845921) and expanded into custom Web Development." },
    { year: "2024", title: "Training Academy & Compliance Nodes", desc: "Launched the vocational training catalog and legal compliance branch helping 200+ local companies." },
    { year: "2026", title: "The Next-Gen Digital Ecosystem", desc: "Integrated AI Solutions, custom Gemini systems, and an offline-first Client Portal platform." }
  ];

  const coreValues = [
    { title: "Surgical Precision", desc: "We design code and target ad segments with mathematical clarity. No wasted efforts." },
    { title: "Ironclad Compliance", desc: "Every system, company name, and contract agreement we issue operates strictly within Nigerian federal statutes." },
    { title: "Continuous Innovation", desc: "We integrate state-of-the-art visual frameworks (Tailwind, Framer Motion) and AI engines before others know they exist." }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 space-y-20 py-10 animate-fade-in text-left text-slate-800 dark:text-slate-100">
      {/* Page Header */}
      <div className="space-y-4">
        <span className="text-orange-500 text-xs uppercase tracking-widest font-black">WHO WE ARE</span>
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
          Our Story & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Corporate Identity</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-3xl font-light">
          DS Tech is West Africa's leading high-performance marketing and web engineering agency, bridging legal compliance registries with modern digital product ecosystems.
        </p>
      </div>

      {/* 1. COMPANY STORY */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <History size={16} />
            <span className="text-xs font-black uppercase tracking-widest font-serif">A Legacy of Growth</span>
          </div>
          <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight text-slate-900 dark:text-white">
            Born out of a need for comprehensive digital support.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-light">
            In the rapid digitalization of West Africa, many startups faced dual blockers: inefficient marketing channels that drained capital, and heavy, slow regulatory hurdles around corporate incorporation, FIRS, and SCUML authorizations.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-light">
            DS Tech was formed to solve this. By bringing corporate attorneys, senior software developers, and Meta/Google ad consultants under a single, unified enterprise structure, we deliver bulletproof growth funnels alongside fully compliant legal setups.
          </p>
        </div>
        <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
              <Target size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase font-serif text-slate-900 dark:text-white mb-1">Our Mission Statement</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                To build high-performing digital engines, write flawless, micro-animated client interfaces, and process fast legal compliance certificates, ensuring West African brands command global authorities.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start border-t border-slate-200/40 dark:border-slate-800 pt-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
              <Eye size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase font-serif text-slate-900 dark:text-white mb-1">Our Corporate Vision</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                To be the primary, most trusted full-stack digital product engineering and high-performance marketing agency in Sub-Saharan Africa by 2030, trusted by governments, enterprises, and innovators alike.
              </p>
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
          {coreValues.map((val, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-orange-500 font-mono text-xs font-bold block">0{i+1}</span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase font-serif">{val.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TIMELINE */}
      <section className="space-y-10">
        <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight text-slate-900 dark:text-white border-l-4 border-orange-500 pl-4">
          Company History Timeline
        </h2>
        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-4 space-y-10">
          {timeline.map((item, i) => (
            <div key={i} className="relative text-left">
              {/* Dot indicator */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 bg-orange-500 border-4 border-white dark:border-slate-950 rounded-full shadow" />
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full font-mono">{item.year}</span>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase font-serif">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-2xl font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LEADERSHIP TEAM */}
      <section className="space-y-10">
        <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight text-slate-900 dark:text-white border-l-4 border-orange-500 pl-4">
          Leadership Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leadership.map((leader, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/40 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={leader.image} 
                  alt={leader.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase font-serif">{leader.name}</h3>
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">{leader.role}</span>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">{leader.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TEAM MEMBERS */}
      <section className="space-y-6">
        <h3 className="text-lg font-extrabold uppercase font-serif tracking-tight text-slate-900 dark:text-white">
          Our Domain Experts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {team.map((member, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800 text-center">
              <span className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide block font-serif">{member.name}</span>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">{member.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CERTIFICATIONS */}
      <section className="p-6 md:p-8 bg-indigo-950 text-white rounded-3xl border border-indigo-900 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full filter blur-2xl pointer-events-none" />
        <div className="space-y-2 text-center md:text-left">
          <span className="text-orange-400 text-xs uppercase tracking-widest font-black">REGULATORY COMPLIANCE</span>
          <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight leading-tight">
            Accredited & <br />
            <span className="text-orange-400 font-extrabold italic">FIRS Authorized Entity</span>
          </h2>
          <p className="text-slate-300 text-xs max-w-xl leading-relaxed font-light">
            DS Tech operates as an incorporated agency with full legal clearances. We maintain compliance reporting logs with CAC, FIRS (TIN processing node), and the Special Control Unit Against Money Laundering (SCUML).
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-center">
            <span className="text-orange-400 font-mono text-xs font-bold block">RC 1845921</span>
            <span className="text-[9px] text-slate-300 uppercase font-black">CAC Incorporated</span>
          </div>
          <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-center">
            <span className="text-orange-400 font-mono text-xs font-bold block">SCUML Approved</span>
            <span className="text-[9px] text-slate-300 uppercase font-black">Anti-Money Laundering</span>
          </div>
        </div>
      </section>
    </div>
  );
};
