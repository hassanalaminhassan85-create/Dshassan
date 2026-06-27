import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Clock, Briefcase, ChevronRight, UserCheck, HelpCircle } from 'lucide-react';

interface CareersSectionProps {
  onApplyForJob: (roleTitle: string) => void;
}

export const CareersSection: React.FC<CareersSectionProps> = ({ onApplyForJob }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const departments = ['all', 'Engineering', 'Marketing', 'Legal & Compliance', 'Customer Operations'];

  const vacancies = [
    {
      id: "vac_1",
      title: "Lead Frontend Developer",
      department: "Engineering",
      location: "Hybrid (Abuja / Remote)",
      type: "Full-Time / Hybrid",
      salary: "₦350,000 - ₦600,000 / month",
      desc: "Architect elite React-based websites, develop fluid micro-animated Framer Motion modules, and integrate robust server-side APIs.",
      requirements: ["React 18/19", "Tailwind CSS v4", "TypeScript", "3+ years production experience"]
    },
    {
      id: "vac_2",
      title: "Senior Digital Marketing Strategist",
      department: "Marketing",
      location: "On-Site (Garki, Abuja)",
      type: "Full-Time",
      salary: "₦250,000 - ₦450,000 / month",
      desc: "Manage sponsored ad campaigns on Meta & TikTok, set up conversion tracking, and coordinate client ROAS targets.",
      requirements: ["Meta Ads Certification", "programmatic pixel setup", "copywriting expertise", "A/B testing"]
    },
    {
      id: "vac_3",
      title: "Corporate Legal Consultant",
      department: "Legal & Compliance",
      location: "Remote (Nigeria)",
      type: "Contract / Remote",
      salary: "₦150,000 - ₦300,000 / contract",
      desc: "Coordinate CAC company incorporations, draft board resolutions, and manage SCUML and TIN certificate approvals.",
      requirements: ["Called to Nigerian Bar (BL)", "CAC portal expert", "regulatory filings familiarity"]
    },
    {
      id: "vac_4",
      title: "AI Chatbot Developer",
      department: "Engineering",
      location: "Remote (Nigeria / Africa)",
      type: "Contract / Remote",
      salary: "₦400,000 - ₦750,000 / contract",
      desc: "Implement automated conversational support workflows utilizing Google GenAI SDK, vector stores, and custom WhatsApp webhooks.",
      requirements: ["NodeJS / Python", "Google GenAI SDK", "WhatsApp Cloud API", "JSON schema drafting"]
    }
  ];

  // Filtering vacuums
  const filteredVacancies = useMemo(() => {
    return vacancies.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'all' || v.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, selectedDept]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-12 animate-fade-in text-left text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="space-y-4">
        <span className="text-orange-500 text-xs uppercase tracking-widest font-black">WE ARE HIRING</span>
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
          Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">Talent Node</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-3xl font-light">
          We seek motivated, elite professionals to scale West Africa's digital ecosystem. Click 'Apply Now' on any vacancy to open our verified digital accreditation portal.
        </p>
      </div>

      {/* Search & Department filters bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Search */}
        <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-1.5 flex items-center shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mx-3 shrink-0" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search open positions..." 
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 py-1"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedDept === dept
                  ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60'
              }`}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* VACANCIES FEED */}
      {filteredVacancies.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-slate-50 dark:bg-slate-900/35 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <HelpCircle size={30} className="mx-auto text-slate-400 animate-pulse" />
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">No open positions found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredVacancies.map((vac) => (
            <div 
              key={vac.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-3 text-left md:max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 rounded uppercase">
                    {vac.department}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <MapPin size={11} />
                    <span>{vac.location}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Clock size={11} />
                    <span>{vac.type}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-[#000E32] dark:text-white text-base font-serif uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                  {vac.title}
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">
                  {vac.desc}
                </p>

                {/* Requirements tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {vac.requirements.map((req, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 text-slate-400 text-[9px] font-bold uppercase rounded border border-slate-100 dark:border-slate-800/40">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-auto text-left md:text-right space-y-3 shrink-0">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Proposed Salary</span>
                  <span className="text-xs font-mono font-black text-slate-800 dark:text-orange-400 block">{vac.salary}</span>
                </div>
                
                <button
                  onClick={() => onApplyForJob(vac.title)}
                  className="w-full md:w-auto px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Briefcase size={12} />
                  <span>Apply For Position</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
