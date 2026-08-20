import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Database, 
  RefreshCw,
  Clock,
  GraduationCap,
  ChevronRight,
  Filter,
  Check,
  Building2,
  FileText
} from 'lucide-react';
import { AcademyCourse, ACADEMY_CATEGORIES } from '../lib/academyCoursesData';
import { apiFetchAcademyCoursesFromFirestore } from '../lib/academyStorage';
import { getAcademyTuition, formatNGN } from '../lib/pricing';

export interface CourseCatalogueProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectCourse?: (course: AcademyCourse) => void;
  selectedCourseCodes?: string[];
  mode?: 'modal' | 'embedded';
  title?: string;
  subtitle?: string;
  allowMultiSelect?: boolean;
  onToggleMultiCourse?: (course: AcademyCourse) => void;
  actionText?: string;
}

// Custom Animated Book-Inspired SVG Icons
export const AnimatedBookIcon: React.FC<{ categoryId?: string; title?: string; className?: string }> = ({ 
  categoryId, 
  title = '', 
  className = "w-10 h-10" 
}) => {
  const cat = (categoryId || '').toLowerCase();
  const lowerTitle = title.toLowerCase();

  // 1. AI & Machine Learning Book
  if (cat.includes('ai') || cat.includes('machine') || lowerTitle.includes('ai') || lowerTitle.includes('python')) {
    return (
      <div className="relative group shrink-0">
        <svg className={`${className} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Glowing Aura */}
          <circle cx="24" cy="24" r="20" fill="#EA580C" fillOpacity="0.12" className="animate-pulse" />
          {/* Book Back Cover */}
          <rect x="8" y="6" width="30" height="36" rx="4" fill="#0F172A" stroke="#F97316" strokeWidth="2" />
          {/* Book Pages Layer */}
          <path d="M12 10H34V38H12C10.3431 38 9 36.6569 9 35V13C9 11.3431 10.3431 10 12 10Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Cyber Lines on Book Spine */}
          <path d="M14 16H28M14 22H32M14 28H24" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
          {/* Animated AI Circuit Node on Cover */}
          <circle cx="30" cy="28" r="3" fill="#F97316" className="animate-ping" />
          <circle cx="30" cy="28" r="2" fill="#38BDF8" />
          <path d="M26 28H22" stroke="#F97316" strokeWidth="1.5" strokeDasharray="2 2" />
          {/* Floating Bookmark */}
          <path d="M26 6V14L29 12L32 14V6" fill="#F97316" />
        </svg>
      </div>
    );
  }

  // 2. Web & Software Engineering Book
  if (cat.includes('web') || cat.includes('software') || lowerTitle.includes('code') || lowerTitle.includes('dev')) {
    return (
      <div className="relative group shrink-0">
        <svg className={`${className} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#0284C7" fillOpacity="0.12" className="animate-pulse" />
          <rect x="8" y="6" width="30" height="36" rx="4" fill="#0F172A" stroke="#0284C7" strokeWidth="2" />
          <path d="M12 10H34V38H12C10.3431 38 9 36.6569 9 35V13C9 11.3431 10.3431 10 12 10Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Code Emblem < / > on cover */}
          <path d="M16 20L13 23L16 26" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 20L29 23L26 26" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 19L20 27" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          {/* Ribbon */}
          <path d="M28 6V14L30.5 12.5L33 14V6" fill="#0EA5E9" />
        </svg>
      </div>
    );
  }

  // 3. Religious Organizations & Faith-Based Book (NEUTRAL Academic Book - NO CROSS, NO BIBLE)
  if (cat.includes('faith') || cat.includes('church') || lowerTitle.includes('church') || lowerTitle.includes('ministry') || lowerTitle.includes('faith')) {
    return (
      <div className="relative group shrink-0">
        <svg className={`${className} transition-transform duration-300 group-hover:scale-110`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#8B5CF6" fillOpacity="0.15" />
          {/* Open Academic Tome (Neutral Knowledge Book) */}
          <path d="M24 12V36M24 12C20 9.5 13 9.5 8 12V36C13 33.5 20 33.5 24 36M24 12C28 9.5 35 9.5 40 12V36C35 33.5 28 33.5 24 36" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#1E1B4B" />
          {/* Text Lines on Left Page */}
          <path d="M12 18H19M12 23H17M12 28H18" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
          {/* Text Lines on Right Page */}
          <path d="M29 18H36M29 23H34M29 28H35" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
          {/* Golden Bookmark Center */}
          <path d="M24 10V28" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          <polygon points="24,28 22,32 26,32" fill="#F59E0B" />
        </svg>
      </div>
    );
  }

  // 4. Cybersecurity & Digital Vault Book
  if (cat.includes('cyber') || cat.includes('security') || lowerTitle.includes('security') || lowerTitle.includes('hacker')) {
    return (
      <div className="relative group shrink-0">
        <svg className={`${className} transition-transform duration-300 group-hover:scale-110`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#10B981" fillOpacity="0.12" />
          <rect x="8" y="6" width="30" height="36" rx="4" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
          <path d="M12 10H34V38H12C10.3431 38 9 36.6569 9 35V13C10.3431 10 12 10 12 10Z" fill="#0F172A" stroke="#34D399" strokeWidth="1.5" />
          {/* Shield Lock Embossing */}
          <path d="M21 18H27V21C27 24.5 24 27 24 27C24 27 21 24.5 21 21V18Z" fill="#10B981" fillOpacity="0.3" stroke="#34D399" strokeWidth="1.5" />
          <circle cx="24" cy="22" r="1.5" fill="#34D399" />
          <path d="M28 6V14L30.5 12.5L33 14V6" fill="#10B981" />
        </svg>
      </div>
    );
  }

  // 5. Cloud & Infrastructure Book
  if (cat.includes('cloud') || cat.includes('devops') || lowerTitle.includes('aws') || lowerTitle.includes('azure')) {
    return (
      <div className="relative group shrink-0">
        <svg className={`${className} transition-transform duration-300 group-hover:scale-110`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#6366F1" fillOpacity="0.12" />
          <rect x="8" y="6" width="30" height="36" rx="4" fill="#1E1B4B" stroke="#6366F1" strokeWidth="2" />
          <path d="M12 10H34V38H12C10.3431 38 9 36.6569 9 35V13C10.3431 10 12 10 12 10Z" fill="#0F172A" stroke="#818CF8" strokeWidth="1.5" />
          {/* Cloud Outline */}
          <path d="M18 25C17 25 15 24 15 22C15 20 17 19 19 19C20 17 22 17 24 17C26 17 28 18 28 20C30 20 31 21 31 23C31 25 29 25 28 25H18Z" fill="#6366F1" fillOpacity="0.3" stroke="#A5B4FC" strokeWidth="1.5" />
          <path d="M28 6V14L30.5 12.5L33 14V6" fill="#6366F1" />
        </svg>
      </div>
    );
  }

  // Default: DSTA Master Tech Codex Tome
  return (
    <div className="relative group shrink-0">
      <svg className={`${className} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" fill="#F97316" fillOpacity="0.12" />
        <rect x="8" y="6" width="30" height="36" rx="4" fill="#18181B" stroke="#F97316" strokeWidth="2" />
        <path d="M12 10H34V38H12C10.3431 38 9 36.6569 9 35V13C10.3431 10 12 10 12 10Z" fill="#27272A" stroke="#FB923C" strokeWidth="1.5" />
        {/* DSTA Book Crest */}
        <polygon points="24,18 29,22 29,27 24,30 19,27 19,22" fill="#F97316" fillOpacity="0.2" stroke="#F97316" strokeWidth="1.5" />
        <path d="M22 23L24 25L27 21" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 6V14L30.5 12.5L33 14V6" fill="#EA580C" />
      </svg>
    </div>
  );
};

export const CourseCatalogue: React.FC<CourseCatalogueProps> = ({
  isOpen = true,
  onClose,
  onSelectCourse,
  selectedCourseCodes = [],
  mode = 'modal',
  title = 'DS TECH Academy Official Programme Catalogue',
  subtitle = 'Browse all 115+ accredited technology, AI, and professional digital courses from our live database.',
  allowMultiSelect = false,
  onToggleMultiCourse,
  actionText = 'Select Programme'
}) => {
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbSource, setDbSource] = useState<'firestore' | 'cached'>('firestore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [activeCourseDetail, setActiveCourseDetail] = useState<AcademyCourse | null>(null);

  // Fetch courses on mount from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      setIsLoading(true);
      try {
        const fetched = await apiFetchAcademyCoursesFromFirestore();
        if (isMounted) {
          setCourses(fetched);
          setDbSource('firestore');
        }
      } catch (e) {
        console.error('Failed to load catalog courses:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCourses();
    return () => { isMounted = false; };
  }, []);

  // Filtered course list
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesCat = c.categoryName.toLowerCase().includes(q);
        const matchesInd = c.industry.toLowerCase().includes(q);
        const matchesDesc = (c.description || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesCat && !matchesInd && !matchesDesc) return false;
      }

      // Category
      if (selectedCatId !== 'all') {
        if (c.categoryId !== selectedCatId) return false;
      }

      // Duration
      if (selectedDuration !== 'all') {
        if (!c.duration.toLowerCase().includes(selectedDuration.toLowerCase())) return false;
      }

      return true;
    });
  }, [courses, searchQuery, selectedCatId, selectedDuration]);

  // Categories list with count
  const categoryOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    courses.forEach(c => {
      counts[c.categoryId] = (counts[c.categoryId] || 0) + 1;
    });
    return [
      { id: 'all', name: 'All Categories', count: courses.length },
      ...ACADEMY_CATEGORIES.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: counts[cat.id] || 0
      }))
    ];
  }, [courses]);

  if (mode === 'modal' && !isOpen) return null;

  const content = (
    <div className="flex flex-col h-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
      
      {/* Top Header */}
      <div className="p-6 bg-slate-950/80 border-b border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3 h-3 text-orange-400 animate-pulse" />
              Live Database Connected • {courses.length} Programmes
            </span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
              DSTA Official Catalogue
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-orange-500" />
            {title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {mode === 'modal' && onClose && (
          <button
            onClick={onClose}
            className="self-end md:self-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close catalogue"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800/80 space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by programme code (e.g. DSTA-AI101), title, or keywords..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Category Filter Pills (Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {categoryOptions.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isSelected ? 'bg-orange-700 text-white' : 'bg-slate-900 text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Duration Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Duration:</span>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 text-xs font-bold focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Durations</option>
              <option value="4 Weeks">4 Weeks / 1 Month</option>
              <option value="6 Weeks">6 Weeks / 1.5 Months</option>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
            </select>
          </div>
        </div>

      </div>

      {/* Courses Grid Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900">
        
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-400">Loading dynamic course catalogue from database...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-8">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No courses match your search filters</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">Try clearing your search query or selecting a different course category.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCatId('all'); setSelectedDuration('all'); }}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const isSelected = selectedCourseCodes.includes(course.code);

              return (
                <div
                  key={course.id}
                  className={`p-5 rounded-2xl bg-slate-950/80 border transition-all duration-300 flex flex-col justify-between relative group hover:shadow-xl ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/30' 
                      : 'border-slate-800/80 hover:border-orange-500/50 hover:bg-slate-950'
                  }`}
                >
                  <div>
                    {/* Card Top Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {/* Animated Book Icon */}
                        <AnimatedBookIcon categoryId={course.categoryId} title={course.title} className="w-10 h-10" />
                        <div>
                          <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 block w-fit">
                            {course.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            {course.categoryName}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-white group-hover:text-orange-400 transition-colors line-clamp-2 mb-2">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {course.description}
                    </p>
                  </div>

                  {/* Card Bottom Meta & Actions */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    
                    {/* Duration & Official Fee Matrix Badge */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Tuition</span>
                        <span className="text-sm font-black text-white font-display">From ₦50,000</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveCourseDetail(course)}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Syllabus</span>
                      </button>

                      {allowMultiSelect && onToggleMultiCourse ? (
                        <button
                          type="button"
                          onClick={() => onToggleMultiCourse(course)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Select Position</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectCourse) onSelectCourse(course);
                            if (onClose) onClose();
                          }}
                          className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-md shadow-orange-500/20 cursor-pointer"
                        >
                          <span>{actionText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer info bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-orange-400" />
          <span>DS TECH Academy • CAC Accredited Technology Institution (RC: 95)</span>
        </div>
        <span>{filteredCourses.length} of {courses.length} Programmes Shown</span>
      </div>

      {/* Detailed Syllabus Preview Modal Drawer */}
      <AnimatePresence>
        {activeCourseDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveCourseDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-6 max-h-[85vh] overflow-y-auto text-white shadow-2xl relative"
            >
              <button
                onClick={() => setActiveCourseDetail(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <AnimatedBookIcon categoryId={activeCourseDetail.categoryId} title={activeCourseDetail.title} className="w-12 h-12 shrink-0" />
                <div>
                  <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
                    {activeCourseDetail.code}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1.5 font-display">
                    {activeCourseDetail.title}
                  </h3>
                  <p className="text-xs text-slate-400">{activeCourseDetail.categoryName} • {activeCourseDetail.industry}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange-400">Programme Description</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{activeCourseDetail.description}</p>
              </div>

              {/* Official Matrix Rates */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-orange-500/30 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Official Fixed Tuition Matrix</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">1 Month</span>
                    <span className="font-extrabold text-orange-400">₦50k - ₦150k</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">3 Months</span>
                    <span className="font-extrabold text-orange-400">₦100k - ₦300k</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">6 Months</span>
                    <span className="font-extrabold text-orange-400">₦200k - ₦400k</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center">Price is determined solely by programme duration and training mode (Virtual, Physical, Hybrid).</p>
              </div>

              {/* Learning Outcomes */}
              {activeCourseDetail.learningOutcomes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Key Practical Outcomes</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeCourseDetail.learningOutcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modal Footer Action */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveCourseDetail(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const c = activeCourseDetail;
                    setActiveCourseDetail(null);
                    if (onSelectCourse) onSelectCourse(c);
                    if (onClose) onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>Select {activeCourseDetail.code}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );

  if (mode === 'embedded') {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="w-full max-w-6xl h-full flex items-center justify-center">
        {content}
      </div>
    </div>
  );
};
