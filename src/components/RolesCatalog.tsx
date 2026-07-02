import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CAREER_ROLES, CATEGORIES, CareerRole } from '../lib/roles';
import { TRANSLATIONS } from '../lib/translations';
import { Search, Filter, Cpu, Globe, Palette, Building2, HelpCircle, Briefcase, DollarSign, Wrench } from 'lucide-react';

interface RolesCatalogProps {
  language: string;
  onSelectRole: (roleTitle: string) => void;
}

export function RolesCatalog({ language, onSelectRole }: RolesCatalogProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const t = TRANSLATIONS[language as any] || TRANSLATIONS.en;

  // Filter roles based on search and category
  const filteredRoles = useMemo(() => {
    return CAREER_ROLES.filter(role => {
      const matchesCategory = activeCategory === 'all' || role.category === activeCategory;
      const matchesSearch = 
        role.title.toLowerCase().includes(search.toLowerCase()) ||
        role.description.toLowerCase().includes(search.toLowerCase()) ||
        role.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        role.tools.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const categoryIcons: Record<string, any> = {
    tech: Cpu,
    marketing: Globe,
    creative: Palette,
    operations: Building2,
  };

  return (
    <div className="space-y-6 text-left w-full">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="text-orange-500 dark:text-orange-400 font-extrabold text-xs uppercase tracking-widest block font-mono">
            {t.exploreTitle || 'CHOOSE YOUR ACCREDITED PATH'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#000E32] dark:text-white uppercase tracking-tight font-serif leading-none">
            {t.exploreHeading || 'Explore Accredited Positions'}
          </h2>
          <p className="text-slate-500 dark:text-slate-300 text-xs font-light">
            {t.exploreSubheading || 'Browse our catalog of 30+ official vacancies, filter by sector, and click on any position to start your accredited application.'}
          </p>
        </div>

        {/* Total Badge */}
        <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-bold font-mono shrink-0 w-max">
          🚀 {CAREER_ROLES.length} {t.rolesCount || 'Accreditation Profiles Active'}
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchRolesPlaceholder || "Search position, skill, tool..."}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
        </div>

        {/* Categories Tab selector */}
        <div className="flex flex-wrap items-center gap-1.5 w-full overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#000E32] text-white dark:bg-orange-600 dark:text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.allSectors || 'All Sectors'}
          </button>

          {Object.entries(CATEGORIES).map(([catKey, catValue]) => {
            const IconComponent = categoryIcons[catKey] || HelpCircle;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === catKey
                    ? 'bg-indigo-500 dark:bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <IconComponent size={12} className="shrink-0" />
                <span>{catValue.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Animated Role Cards */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredRoles.map((role) => {
            const catMeta = CATEGORIES[role.category];
            const CatIcon = categoryIcons[role.category] || HelpCircle;

            return (
              <motion.div
                layout
                key={role.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-l-4 ${catMeta.color} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group`}
              >
                <div className="space-y-3.5">
                  {/* Card Category Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${catMeta.bgColor} ${catMeta.textColor}`}>
                      <CatIcon size={9} />
                      {catMeta.label.split(' & ')[0]}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-300">
                      ID: {role.id}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug tracking-tight font-serif group-hover:text-orange-500 transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-300 text-[10px] leading-relaxed line-clamp-3">
                      {role.description}
                    </p>
                  </div>

                  {/* Skills tags list */}
                  <div className="space-y-1">
                    <div className="text-[8px] uppercase font-black text-slate-500 dark:text-slate-300 tracking-wider">
                      {t.coreFocus}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.skills.map((skill, index) => (
                        <span key={index} className="text-[9px] font-medium bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tools tags list */}
                  <div className="space-y-1">
                    <div className="text-[8px] uppercase font-black text-slate-500 dark:text-slate-300 tracking-wider flex items-center gap-1">
                      <Wrench size={8} />
                      {t.toolsStack}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.tools.map((tool, index) => (
                        <span key={index} className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded-lg">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer section of Card */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase font-bold text-slate-500 dark:text-slate-300 block leading-none">{t.estimateAllowance}</span>
                    <span className="text-xs font-mono font-bold text-orange-500 dark:text-orange-400 block mt-0.5">{role.estimatedSalary} <span className="text-[8px] text-slate-400 font-sans font-normal">/mo</span></span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectRole(role.title)}
                    className="px-2.5 py-1 bg-[#000E32] hover:bg-orange-500 dark:bg-slate-800 dark:hover:bg-orange-600 text-white dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    {t.applyNow}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredRoles.length === 0 && (
          <div className="col-span-full py-12 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl">
            <div className="mx-auto w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
              <Search size={20} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide">{t.noVacancyFound}</h4>
              <p className="text-slate-500 dark:text-slate-300 text-[11px]">{t.noVacancyDesc}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
