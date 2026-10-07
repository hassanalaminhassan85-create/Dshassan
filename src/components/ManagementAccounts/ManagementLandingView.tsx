import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  ChevronRight, 
  Lock, 
  Briefcase, 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Palette, 
  Cpu, 
  Bot, 
  Scale, 
  Sparkles, 
  Search,
  Building,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { Logo } from '../Logo';
import { OFFICIAL_MANAGEMENT_ROLES } from '../../lib/managementApi';
import { ManagementRoleCode, ManagementAccountRoleMeta } from '../../types/management';

interface ManagementLandingViewProps {
  onSelectRole: (role: ManagementRoleCode) => void;
  onNavigateHome: () => void;
  theme: 'light' | 'dark';
}

const roleIconsMap: Record<ManagementRoleCode, React.ElementType> = {
  CEO: CrownIcon,
  HOD_HR: Users,
  HOD_ADMIN: Building2,
  HOD_BUSINESS: TrendingUp,
  HOD_FINANCE: DollarSign,
  HOD_CREATIVE_DIGITAL: Palette,
  HOD_IT: Cpu,
  HOD_AI_TECH: Bot,
  HOD_LEGAL: Scale
};

function CrownIcon(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}

export const ManagementLandingView: React.FC<ManagementLandingViewProps> = ({
  onSelectRole,
  onNavigateHome,
  theme
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = OFFICIAL_MANAGEMENT_ROLES.filter((role) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      role.title.toLowerCase().includes(q) ||
      role.department.toLowerCase().includes(q) ||
      role.description.toLowerCase().includes(q) ||
      role.scope.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Logo size="sm" showText={false} />
            <div>
              <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>DS TECH COMPANY</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold border border-orange-200/60 dark:border-orange-800/60">
                  MANAGEMENT PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Corporate Governance & Leadership Accounts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} className="text-orange-500" />
              <span>Back to Main Site</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex-grow">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Authorized DS Tech Leadership Portal</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[10px] text-orange-500">CAC RC-1849204</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white text-balance leading-tight">
            Management Accounts
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-balance">
            Secure access portal for DS Tech Company management and departmental leadership. Select your designated role below to proceed to verified corporate sign-in.
          </p>

          {/* Quick Search */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, department, or scope..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs"
            />
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRoles.map((role, idx) => {
            const IconComponent = roleIconsMap[role.code] || Briefcase;
            const isCeo = role.code === 'CEO';

            return (
              <motion.div
                key={role.code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between border ${
                  isCeo 
                    ? 'bg-gradient-to-br from-white via-orange-50/20 to-white dark:from-slate-900 dark:via-orange-950/10 dark:to-slate-900 border-orange-300/80 dark:border-orange-500/30 shadow-md hover:shadow-lg' 
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div>
                  {/* Top Role Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isCeo 
                        ? 'bg-orange-500 text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/50 group-hover:text-orange-500'
                    }`}>
                      <IconComponent size={20} />
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isCeo
                          ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/80'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {role.departmentCode}
                      </span>
                      {isCeo && (
                        <span className="text-[9px] font-semibold text-orange-600 dark:text-orange-400 mt-1">
                          Executive Board
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Department */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {role.title}
                  </h3>
                  
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {role.department}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3 line-clamp-3">
                    {role.description}
                  </p>

                  {/* Key Scope Lead */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Operational Remit
                    </div>
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                      {role.scope}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6 pt-3">
                  <button
                    type="button"
                    onClick={() => onSelectRole(role.code)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCeo
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'
                    }`}
                  >
                    <Lock size={13} />
                    <span>Access Account</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state for search */}
        {filteredRoles.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <Search size={28} className="mx-auto text-slate-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching role found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Check your keyword or reset search to view all 9 official corporate management roles.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Security & Governance Bottom Note */}
        <div className="mt-12 sm:mt-16 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Statutory Enterprise Security Architecture
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every management account is backed by role-based access control, cryptographic session hashes, and audited executive oversight under DS Tech & Digital Marketing Agency Ltd (CAC RC-1849204).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto text-xs text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>256-Bit TLS Endpoints</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} DS Tech & Digital Marketing Agency Limited. All Rights Reserved.</span>
          <span className="font-mono text-[11px]">Area 1, Garki, Abuja, FCT, Nigeria</span>
        </div>
      </footer>
    </div>
  );
};
