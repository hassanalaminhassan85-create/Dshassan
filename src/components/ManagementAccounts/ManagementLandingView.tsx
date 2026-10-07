import React, { useState, useMemo } from 'react';
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

interface ManagementLandingViewProps {
  onSelectRole: (role: ManagementRoleCode) => void;
  onNavigateHome: () => void;
  theme: 'light' | 'dark';
}

export const ManagementLandingView: React.FC<ManagementLandingViewProps> = ({
  onSelectRole,
  onNavigateHome,
  theme
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
        
        {/* Only Back Navigation Remains - No header bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
          >
            <ArrowLeft size={14} className="text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Main Website</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>CAC RC-1849204</span>
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

        {/* Management Accounts Feed: matching careers section vacancy cards */}
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

              return (
                <div 
                  key={role.code}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 group hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-2.5 text-left md:max-w-2xl flex-grow">
                    {/* Role Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded uppercase font-mono tracking-wider">
                        {role.departmentCode}
                      </span>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Mail size={12} className="text-orange-500" />
                        <span className="font-mono text-[11px] select-all">{role.email}</span>
                      </div>
                      {isCeo && (
                        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded text-[9px] font-extrabold tracking-wider uppercase border border-orange-200/60 dark:border-orange-800/60">
                          Executive Board
                        </span>
                      )}
                    </div>

                    {/* Role Title & Department */}
                    <div>
                      <h3 className="font-extrabold text-[#000E32] dark:text-white text-base md:text-lg font-serif uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                        {role.title}
                      </h3>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                        {role.department}
                      </p>
                    </div>

                    {/* Role Description */}
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">
                      {role.description}
                    </p>

                    {/* Remit / Scope Tag */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[10px] font-medium rounded border border-slate-200/60 dark:border-slate-800/60">
                        <strong className="text-slate-800 dark:text-slate-200 uppercase font-mono text-[9px] mr-1">Remit:</strong>
                        {role.scope}
                      </span>
                    </div>
                  </div>

                  {/* Action Button: right aligned, crisp styling */}
                  <div className="w-full md:w-auto text-left md:text-right shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectRole(role.code)}
                      className="w-full md:w-auto px-5 py-2.5 bg-[#000E32] hover:bg-[#00174F] dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:scale-[1.02]"
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

        {/* Footer Note */}
        <div className="pt-6 pb-12 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800">
          <span>DS Tech & Digital Marketing Agency Limited · Area 1, Garki, Abuja, FCT, Nigeria · All management logins are cryptographically logged</span>
        </div>
      </div>
    </div>
  );
};
