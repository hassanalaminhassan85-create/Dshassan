import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Lock, 
  Search,
  Mail,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { OFFICIAL_MANAGEMENT_ROLES } from '../../lib/managementApi';
import { ManagementRoleCode } from '../../types/management';
import { OfficialRoleSvg } from './OfficialRoleSvgs';
import { apiGetCacMetadata, apiSubscribeToCacMetadata, apiSubscribeToRealtimeSync } from '../../lib/api';

interface ManagementLandingViewProps {
  onSelectRole: (role: ManagementRoleCode) => void;
  onNavigateHome: () => void;
  theme: 'light' | 'dark';
  publishedCac?: any;
}

// Visual styling metadata tailored for each role's official color palette
const roleThemeStyles: Record<ManagementRoleCode, {
  svgContainer: string;
  badge: string;
  accentText: string;
  cardBorder: string;
}> = {
  CEO: {
    svgContainer: 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/15 dark:border-amber-500/40 shadow-amber-500/10',
    badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-800/60',
    accentText: 'text-amber-600 dark:text-amber-400',
    cardBorder: 'border-amber-200/80 hover:border-amber-400 dark:border-slate-800 dark:hover:border-amber-500/40'
  },
  HOD_HR: {
    svgContainer: 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/15 dark:border-emerald-500/40 shadow-emerald-500/10',
    badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-800/60',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    cardBorder: 'border-emerald-200/80 hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-500/40'
  },
  HOD_ADMIN: {
    svgContainer: 'bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/15 dark:border-blue-500/40 shadow-blue-500/10',
    badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300/60 dark:border-blue-800/60',
    accentText: 'text-blue-600 dark:text-blue-400',
    cardBorder: 'border-blue-200/80 hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-500/40'
  },
  HOD_BUSINESS: {
    svgContainer: 'bg-purple-500/10 border-purple-500/30 dark:bg-purple-500/15 dark:border-purple-500/40 shadow-purple-500/10',
    badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-300/60 dark:border-purple-800/60',
    accentText: 'text-purple-600 dark:text-purple-400',
    cardBorder: 'border-purple-200/80 hover:border-purple-400 dark:border-slate-800 dark:hover:border-purple-500/40'
  },
  HOD_FINANCE: {
    svgContainer: 'bg-teal-500/10 border-teal-500/30 dark:bg-teal-500/15 dark:border-teal-500/40 shadow-teal-500/10',
    badge: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-300/60 dark:border-teal-800/60',
    accentText: 'text-teal-600 dark:text-teal-400',
    cardBorder: 'border-teal-200/80 hover:border-teal-400 dark:border-slate-800 dark:hover:border-teal-500/40'
  },
  HOD_CREATIVE_DIGITAL: {
    svgContainer: 'bg-rose-500/10 border-rose-500/30 dark:bg-rose-500/15 dark:border-rose-500/40 shadow-rose-500/10',
    badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300/60 dark:border-rose-800/60',
    accentText: 'text-rose-600 dark:text-rose-400',
    cardBorder: 'border-rose-200/80 hover:border-rose-400 dark:border-slate-800 dark:hover:border-rose-500/40'
  },
  HOD_IT: {
    svgContainer: 'bg-sky-500/10 border-sky-500/30 dark:bg-sky-500/15 dark:border-sky-500/40 shadow-sky-500/10',
    badge: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-300/60 dark:border-sky-800/60',
    accentText: 'text-sky-600 dark:text-sky-400',
    cardBorder: 'border-sky-200/80 hover:border-sky-400 dark:border-slate-800 dark:hover:border-sky-500/40'
  },
  HOD_AI_TECH: {
    svgContainer: 'bg-indigo-500/10 border-indigo-500/30 dark:bg-indigo-500/15 dark:border-indigo-500/40 shadow-indigo-500/10',
    badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-300/60 dark:border-indigo-800/60',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    cardBorder: 'border-indigo-200/80 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-500/40'
  },
  HOD_LEGAL: {
    svgContainer: 'bg-yellow-500/10 border-yellow-600/30 dark:bg-yellow-500/15 dark:border-yellow-500/40 shadow-yellow-500/10',
    badge: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-400 border border-yellow-300/60 dark:border-yellow-800/60',
    accentText: 'text-yellow-700 dark:text-yellow-400',
    cardBorder: 'border-yellow-200/80 hover:border-yellow-400 dark:border-slate-800 dark:hover:border-yellow-500/40'
  }
};

export const ManagementLandingView: React.FC<ManagementLandingViewProps> = ({
  onSelectRole,
  onNavigateHome,
  theme,
  publishedCac: initialPublishedCac
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [liveCac, setLiveCac] = useState<any>(initialPublishedCac || null);

  // Sync real-time CAC metadata with database and main home footer
  useEffect(() => {
    if (initialPublishedCac) {
      setLiveCac(initialPublishedCac);
    }
  }, [initialPublishedCac]);

  useEffect(() => {
    let isMounted = true;
    const loadCac = async () => {
      try {
        const data = await apiGetCacMetadata(false);
        if (data && data.length > 0 && isMounted) {
          const published = data.find((c: any) => c.is_published === 1) || data[0];
          if (published) {
            setLiveCac(published);
          }
        }
      } catch (e) {
        // Fallback remains active
      }
    };

    if (!initialPublishedCac) {
      loadCac();
    }

    const unsubCac = apiSubscribeToCacMetadata((cacData) => {
      if (cacData && cacData.length > 0 && isMounted) {
        const published = cacData.find((c: any) => c.is_published === 1) || cacData[0];
        if (published) {
          setLiveCac(published);
        }
      }
    });

    const unsubSSE = apiSubscribeToRealtimeSync((event) => {
      if (event?.type?.startsWith('CAC_')) {
        loadCac();
      }
    });

    return () => {
      isMounted = false;
      unsubCac();
      unsubSSE();
    };
  }, [initialPublishedCac]);

  // Exact same clean RC logic as main home footer
  const cleanRawRc = liveCac?.registration_number || initialPublishedCac?.registration_number || '1845921';
  const rcNumber = cleanRawRc.replace(/^RC[:\s-]*/i, '');

  const categories = [
    { id: 'all', label: 'All Accounts' },
    { id: 'EXEC', label: 'Executive' },
    { id: 'HRM', label: 'Human Resources' },
    { id: 'ADM', label: 'Administration' },
    { id: 'BIZ', label: 'Business Dev' },
    { id: 'FIN', label: 'Finance' },
    { id: 'CMD', label: 'Creative Media' },
    { id: 'ITD', label: 'Information Tech' },
    { id: 'AIC', label: 'AI & Creative Tech' },
    { id: 'LGC', label: 'Legal & Compliance' }
  ];

  const filteredRoles = useMemo(() => {
    return OFFICIAL_MANAGEMENT_ROLES.filter((role) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        role.title.toLowerCase().includes(q) ||
        role.department.toLowerCase().includes(q) ||
        role.email.toLowerCase().includes(q) ||
        role.scope.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || role.departmentCode === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-orange-500 selection:text-white transition-colors duration-200">
      {/* Page Content: matching exact careers section layout & typography */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8 animate-fade-in text-left">
        
        {/* Only Back Navigation Remains + Real-Time CAC RC matching Main Home Footer */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer group shrink"
          >
            <ArrowLeft size={14} className="text-orange-500 group-hover:-translate-x-0.5 transition-transform shrink-0" />
            <span className="truncate">Back <span className="hidden sm:inline">to Main Website</span></span>
          </button>

          {/* Real-time CAC RC Badge (synchronized with Main Footer, fully mobile responsive) */}
          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-700 dark:text-slate-300 shadow-2xs shrink-0 whitespace-nowrap">
            <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
            <span>CAC RC: <strong className="text-slate-950 dark:text-white font-bold">{rcNumber}</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5 shrink-0" />
          </div>
        </div>

        {/* Section Header: identical typography to careers section */}
        <div className="space-y-3">
          <span className="text-orange-500 text-xs uppercase tracking-widest font-black">
            MANAGEMENT ACCOUNTS
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
            Leadership <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">Access Portal</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-3xl font-light">
            Secure access portal for DS Tech Company management and departmental leadership. Select your authorized management account below to sign in.
          </p>
        </div>

        {/* Search & Category Filter Pills Bar (exact career page style) */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Search */}
          <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-1.5 flex items-center shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mx-3 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search management accounts..." 
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 py-1"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Management Accounts Feed: Highly polished cards with Official Coloured SVGs */}
        {filteredRoles.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-white dark:bg-slate-900/35 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <HelpCircle size={30} className="mx-auto text-slate-400 animate-pulse" />
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              No management account found
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-2 text-xs font-bold text-orange-500 hover:underline cursor-pointer"
            >
              Reset filters to view all 9 roles
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRoles.map((role) => {
              const isCeo = role.code === 'CEO';
              const style = roleThemeStyles[role.code] || roleThemeStyles.CEO;

              return (
                <div 
                  key={role.code}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 group hover:shadow-lg ${style.cardBorder}`}
                >
                  {/* Left: Role SVG Emblem + Detailed Meta */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 flex-grow min-w-0">
                    
                    {/* Official Coloured SVG Emblem Respectively */}
                    <div className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-2.5 transition-all duration-300 group-hover:scale-105 border ${style.svgContainer} shadow-sm`}>
                      <OfficialRoleSvg role={role.code} size={54} />
                    </div>

                    {/* Role Texts & Details */}
                    <div className="space-y-2 text-left flex-grow min-w-0">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400">
                        <span className={`px-2 py-0.5 rounded uppercase font-mono tracking-wider font-extrabold ${style.badge}`}>
                          {role.departmentCode}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Mail size={12} className={style.accentText} />
                          <span className="font-mono text-[11px] select-all">{role.email}</span>
                        </div>
                        {isCeo && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded text-[9px] font-extrabold tracking-wider uppercase border border-amber-300/60 dark:border-amber-800/60 shadow-2xs">
                            Executive Board
                          </span>
                        )}
                      </div>

                      {/* Role Title & Department */}
                      <div>
                        <h3 className="font-extrabold text-[#000E32] dark:text-white text-base md:text-lg font-serif uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                          {role.title}
                        </h3>
                        <p className={`text-xs font-semibold mt-0.5 ${style.accentText}`}>
                          {role.department}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">
                        {role.description}
                      </p>

                      {/* Remit / Scope Tag */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                          <strong className="text-slate-800 dark:text-slate-200 uppercase font-mono text-[9px] mr-1.5">Remit:</strong>
                          {role.scope}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Access Account Action Button */}
                  <div className="w-full md:w-auto text-left md:text-right shrink-0 pt-2 md:pt-0">
                    <button
                      type="button"
                      onClick={() => onSelectRole(role.code)}
                      className="w-full md:w-auto px-5 py-3 bg-[#000E32] hover:bg-[#00174F] dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:scale-[1.02]"
                    >
                      <Lock size={13} />
                      <span>Access Account</span>
                      <ChevronRight size={14} className="text-orange-400 dark:text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Note with Real-time CAC RC */}
        <div className="pt-6 pb-12 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
          <p>DS Tech & Digital Marketing Agency Limited · CAC RC: <strong className="font-mono text-slate-600 dark:text-slate-300 font-bold">{rcNumber}</strong> · Area 1, Garki, Abuja, FCT, Nigeria</p>
          <p className="text-[10px] text-slate-400/80">SCUML & FIRS Compliant Corporate Management System</p>
        </div>
      </div>
    </div>
  );
};
