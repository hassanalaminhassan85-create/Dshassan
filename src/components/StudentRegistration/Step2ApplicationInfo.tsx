import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Clock, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Grid, 
  Filter, 
  X, 
  BookOpen, 
  ChevronRight,
  Info
} from 'lucide-react';
import { ACADEMY_COURSES, ACADEMY_CATEGORIES, AcademyCourse } from '../../lib/academyCoursesData';
import { getAcademyTuition, formatNGN } from '../../lib/pricing';
import { CourseCatalogue } from '../CourseCatalogue';
import { 
  DurationOption, 
  LearningMode, 
  LectureDays, 
  LanguagePreference, 
  SelectedCourseConfig 
} from '../../types/studentRegistration';

// Professional Custom Colored SVG Icons representing each academic domain
const CategorySvgIcon: React.FC<{ catId: string; className?: string }> = ({ catId, className = "w-6 h-6" }) => {
  const normId = catId.toLowerCase().trim();

  switch (normId) {
    case 'ai':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#8B5CF6" fillOpacity="0.1" stroke="#A78BFA" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" stroke="#8B5CF6" strokeWidth="1.5" />
          <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1.5" fill="#C084FC" />
        </svg>
      );
    case 'healthcare':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#10B981" fillOpacity="0.1" stroke="#34D399" strokeWidth="1.5" />
          <path d="M12 7V17M7 12H17" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="8" stroke="#10B981" strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );
    case 'education':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#6366F1" fillOpacity="0.1" stroke="#818CF8" strokeWidth="1.5" />
          <path d="M12 6L4 10L12 14L20 10L12 6Z" stroke="#6366F1" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7.5 12V16.5C7.5 16.5 10 18.5 12 18.5C14 18.5 16.5 16.5 16.5 16.5V12" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'agriculture':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#22C55E" fillOpacity="0.1" stroke="#4ADE80" strokeWidth="1.5" />
          <path d="M12 6C9 6 6 8.5 6 12C6 15.5 8 18 12 18C16 18 18 15.5 18 12C18 8.5 15 6 12 6Z" stroke="#22C55E" strokeWidth="1.5" />
          <path d="M12 6V18M9 9H15M8 15H16" stroke="#22C55E" strokeWidth="1.2" />
        </svg>
      );
    case 'marketing':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#F97316" fillOpacity="0.1" stroke="#FB923C" strokeWidth="1.5" />
          <path d="M18 17V7M13 17V11M8 17V14M18 7L13 11M13 11L8 14" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="18" cy="7" r="1.5" fill="#F97316" />
        </svg>
      );
    case 'creative':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#EC4899" fillOpacity="0.1" stroke="#F472B6" strokeWidth="1.5" />
          <circle cx="9" cy="9" r="2" fill="#EC4899" />
          <circle cx="15" cy="15" r="3" stroke="#EC4899" strokeWidth="1.5" />
          <path d="M6 18C6 14.5 10 14.5 12 14.5" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'tech':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#0EA5E9" fillOpacity="0.1" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M8 9L5 12L8 15M16 9L19 12L16 15M13.5 7L10.5 17" stroke="#0EA5E9" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'fintech':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#0D9488" fillOpacity="0.1" stroke="#2DD4BF" strokeWidth="1.5" />
          <path d="M12 6V18M12 6L9 9M12 6L15 9M12 18L9 15M12 18L15 15" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" stroke="#0D9488" strokeWidth="1.2" />
        </svg>
      );
    case 'business':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#D97706" fillOpacity="0.1" stroke="#F59E0B" strokeWidth="1.5" />
          <rect x="5" y="8" width="14" height="10" rx="2" stroke="#D97706" strokeWidth="1.5" />
          <path d="M9 8V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V8" stroke="#D97706" strokeWidth="1.5" />
        </svg>
      );
    case 'executive':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#EAB308" fillOpacity="0.1" stroke="#FDE047" strokeWidth="1.5" />
          <path d="M5 16L7 8L12 11L17 8L19 16H5Z" stroke="#EAB308" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="1" fill="#EAB308" />
        </svg>
      );
    case 'realestate':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#4F46E5" fillOpacity="0.1" stroke="#818CF8" strokeWidth="1.5" />
          <path d="M6 18V8L11 5V18M11 18V10L18 13V18M6 18H18" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'hospitality':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#DB2777" fillOpacity="0.1" stroke="#F472B6" strokeWidth="1.5" />
          <path d="M12 6C8 6 5 8 5 12H19C19 8 16 6 12 6ZM5 14H19V16H5V14Z" stroke="#DB2777" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'legal':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#475569" fillOpacity="0.1" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M12 5V19M8 8H16M6 13C6 11 8 11 8 11H12M18 13C18 11 16 11 16 11H12" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'government':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#059669" fillOpacity="0.1" stroke="#34D399" strokeWidth="1.5" />
          <path d="M4 18H20M12 6L4 11V13H20V11L12 6ZM7 13V16M12 13V16M17 13V16" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'ngo':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#0284C7" fillOpacity="0.1" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="5" stroke="#0284C7" strokeWidth="1.5" />
          <path d="M12 2C10 4 10 20 12 22M2 12C4 10 20 10 22 12" stroke="#0284C7" strokeWidth="1.2" />
        </svg>
      );
    case 'fashion':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#F43F5E" fillOpacity="0.1" stroke="#FB7185" strokeWidth="1.5" />
          <path d="M12 5C11 5 10 6 10 7C10 8.5 14 8.5 14 10C14 11 13 11 12 11" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5 19L9 11H15L19 19H5Z" stroke="#F43F5E" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'construction':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#EA580C" fillOpacity="0.1" stroke="#F97316" strokeWidth="1.5" />
          <path d="M12 5L4 12V18H20V12L12 5Z" stroke="#EA580C" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2" fill="#EA580C" />
        </svg>
      );
    case 'energy':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#DC2626" fillOpacity="0.1" stroke="#F87171" strokeWidth="1.5" />
          <path d="M13 3L5 12H12L11 21L19 12H12L13 3Z" fill="#DC2626" fillOpacity="0.2" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'faith':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#7C3AED" fillOpacity="0.1" stroke="#A78BFA" strokeWidth="1.5" />
          <path d="M12 6C9.5 6 6 8.5 6 12V18H18V12C18 8.5 14.5 6 12 6Z" stroke="#7C3AED" strokeWidth="1.5" />
          <path d="M12 6V18" stroke="#7C3AED" strokeWidth="1.5" />
        </svg>
      );
    case 'manufacturing':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#64748B" fillOpacity="0.1" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" stroke="#64748B" strokeWidth="1.5" />
          <path d="M12 5V7M12 17V19M5 12H7M17 12H19" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'entertainment':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#BE185D" fillOpacity="0.1" stroke="#F472B6" strokeWidth="1.5" />
          <rect x="4" y="6" width="16" height="12" rx="2" stroke="#BE185D" strokeWidth="1.5" />
          <circle cx="8" cy="12" r="1.5" fill="#BE185D" />
          <circle cx="16" cy="12" r="1.5" fill="#BE185D" />
        </svg>
      );
    case 'remote':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#059669" fillOpacity="0.1" stroke="#34D399" strokeWidth="1.5" />
          <rect x="4" y="5" width="16" height="11" rx="2" stroke="#059669" strokeWidth="1.5" />
          <path d="M2 19H22M8 16V19M16 16V19" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#EA580C" fillOpacity="0.1" stroke="#F97316" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" stroke="#EA580C" strokeWidth="1.5" />
        </svg>
      );
  }
};

interface Step2ApplicationInfoProps {
  primaryCourse: SelectedCourseConfig;
  onChange: (course: SelectedCourseConfig) => void;
  applicationDate: string;
}

const DURATIONS: DurationOption[] = ['1 Month', '3 Months', '6 Months'];
const MODES: { value: LearningMode; label: string; desc: string }[] = [
  { value: 'Physical', label: 'Physical (Campus)', desc: 'Abuja Main or Adamawa Regional Hub' },
  { value: 'Virtual', label: 'Virtual (Live Online)', desc: 'Interactive Zoom & LMS Lab Rooms' },
  { value: 'Hybrid', label: 'Hybrid (Flex)', desc: 'Combined in-person & online sprints' },
];
const LECTURE_DAYS: LectureDays[] = ['Mondays-Wednesdays', 'Wednesdays-Fridays', 'Saturdays & Sundays'];
const LANGUAGES: { value: LanguagePreference; flag: string }[] = [
  { value: 'English', flag: '🇬🇧' },
  { value: 'Hausa', flag: '🇳🇬' },
  { value: 'Yoruba', flag: '🇳🇬' },
  { value: 'Igbo', flag: '🇳🇬' },
];

export const Step2ApplicationInfo: React.FC<Step2ApplicationInfoProps> = ({
  primaryCourse,
  onChange,
  applicationDate
}) => {
  const [courseSearch, setCourseSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);

  // Dynamic search and filter logic for ALL 115 programs
  const filteredCourses = useMemo(() => {
    let list = ACADEMY_COURSES;
    
    // 1. Filter by category
    if (activeCategoryId !== 'all') {
      list = list.filter(c => c.categoryId === activeCategoryId);
    }
    
    // 2. Filter by search input
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase();
      list = list.filter(
        c => c.code.toLowerCase().includes(q) || 
             c.title.toLowerCase().includes(q) || 
             c.categoryName.toLowerCase().includes(q) || 
             c.industry.toLowerCase().includes(q) ||
             (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategoryId, courseSearch]);

  // Handle course selection
  const handleSelectCourse = (course: AcademyCourse) => {
    const currentDur = primaryCourse.duration || '1 Month';
    const currentMode = primaryCourse.mode || 'Physical';
    const baseP = course.price || 50000;
    const newPrice = getAcademyTuition(currentDur, currentMode, baseP);
    
    onChange({
      ...primaryCourse,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      categoryName: course.categoryName,
      basePrice: baseP,
      calculatedPrice: newPrice
    });
  };

  const handleDurationChange = (dur: DurationOption) => {
    const currentMode = primaryCourse.mode || 'Physical';
    const baseP = primaryCourse.basePrice || 50000;
    const newPrice = getAcademyTuition(dur, currentMode, baseP);
    onChange({
      ...primaryCourse,
      duration: dur,
      calculatedPrice: newPrice
    });
  };

  const handleModeChange = (mode: LearningMode) => {
    const currentDur = primaryCourse.duration || '1 Month';
    const baseP = primaryCourse.basePrice || 50000;
    const newPrice = getAcademyTuition(currentDur, mode, baseP);
    onChange({
      ...primaryCourse,
      mode,
      calculatedPrice: newPrice
    });
  };

  // Find currently selected course details to show in premium view
  const currentSelectedCourseObj = useMemo(() => {
    if (!primaryCourse.courseId) return null;
    return ACADEMY_COURSES.find(c => c.id === primaryCourse.courseId) || null;
  }, [primaryCourse.courseId]);

  // Find active category label
  const activeCategoryLabel = useMemo(() => {
    const cat = ACADEMY_CATEGORIES.find(c => c.id === activeCategoryId);
    return cat ? cat.name : 'All Programs';
  }, [activeCategoryId]);

  return (
    <div className="space-y-10">
      
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
            Step 2 of 10
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Select Your Primary Programme
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Browse and search all 115 certified DSTA courses. Customize your learning timeline, location mode, and schedule to match your career goals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCatalogueOpen(true)}
          className="self-start md:self-center px-4 py-2.5 rounded-xl bg-orange-600/10 hover:bg-orange-600 border border-orange-500/30 text-orange-400 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-orange-500/5 hover:scale-102 active:scale-98 shrink-0"
        >
          <Grid className="w-4 h-4 text-orange-400" />
          <span>Interactive Syllabus Catalogue</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </button>
      </div>

      {/* Verified Application Meta */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Registry Intake Date</span>
            <div className="text-sm font-bold text-white font-mono">{applicationDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
        <span className="self-start sm:self-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
          Auto-Verified Registry Docket
        </span>
      </div>

      {/* High-Fidelity Active Selection Summary Widget */}
      <div className="bg-gradient-to-r from-orange-950/20 via-slate-900 to-slate-900/40 border border-orange-500/25 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <h4 className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Current Active Programme Selection</span>
        </h4>

        {primaryCourse.courseCode ? (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-orange-500 text-white font-mono font-black text-xs shadow-sm">
                  {primaryCourse.courseCode}
                </span>
                <span className="text-xs font-semibold text-slate-400">{primaryCourse.categoryName}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1.5">
                {primaryCourse.courseTitle}
              </h2>
              {currentSelectedCourseObj && (
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
                  {currentSelectedCourseObj.description}
                </p>
              )}
            </div>
            
            <div className="border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 shrink-0 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Calculated Tuition</span>
              <span className="text-2xl font-black text-orange-400 font-mono mt-0.5">
                ₦{primaryCourse.calculatedPrice.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-400 font-medium block mt-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
                {primaryCourse.duration} / {primaryCourse.mode} / {primaryCourse.language}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-slate-400 text-sm py-8">
            <Info className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <span className="font-medium text-slate-300 block mb-1">No Primary Programme Selected Yet</span>
            <p className="text-xs text-slate-500">Please choose a program from the list below to build your custom schedule.</p>
          </div>
        )}

        {primaryCourse.courseCode && (
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Success! Selected programme has been synced. Adjust details below and click "Continue" at bottom when ready.</span>
          </div>
        )}
      </div>

      {/* Program Selector Workspace: Left Category Sidebar, Right Course Grid */}
      <div className="space-y-4">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          SELECT PROGRAMME / COURSE <span className="text-orange-400">*</span>
          <span className="ml-2 text-[10px] font-normal text-slate-500 font-mono">(115 Accredited Technical Courses Available)</span>
        </label>

        {/* Desktop Split Workspace / Mobile Single View */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Left Categories Panel (Desktop: Sidebar, Mobile: Trigger Button) */}
          <div className="w-full md:w-64 lg:w-72 shrink-0 space-y-3">
            {/* Mobile Category Trigger Button */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white font-bold flex items-center justify-between hover:bg-slate-850 hover:border-slate-600 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-400" />
                  <span className="text-xs uppercase tracking-wider text-slate-400">Category:</span>
                  <span className="text-xs text-white">{activeCategoryLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono">
                    {filteredCourses.length} Programs
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </button>
            </div>

            {/* Desktop Sidebar Panel */}
            <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-1.5 max-h-[620px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              <div className="px-2 pb-2 border-b border-slate-800 mb-2">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Sectors & Disciplines</span>
              </div>
              {ACADEMY_CATEGORIES.map((cat) => {
                const isSelected = activeCategoryId === cat.id;
                const catCount = cat.id === 'all' 
                  ? ACADEMY_COURSES.length 
                  : ACADEMY_COURSES.filter(c => c.categoryId === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategoryId(cat.id);
                      setCourseSearch(''); // Reset search when switching categories
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-orange-500/10 border border-orange-500/20 text-white font-bold'
                        : 'hover:bg-slate-800/80 text-slate-300 border border-transparent hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CategorySvgIcon catId={cat.id} className="w-5 h-5 shrink-0" />
                      <span className="text-xs truncate font-semibold leading-none">{cat.shortName || cat.name}</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected 
                        ? 'bg-orange-500/20 text-orange-400' 
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}>
                      {catCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Pane: Search bar and Grid of Cards */}
          <div className="flex-1 w-full space-y-4">
            
            {/* Search, Clear & Stats Section */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-inner">
              <div className="relative w-full flex-1">
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search by code (e.g. DSTA-AI101) or course name..."
                  className="w-full px-4 py-3 pl-10 pr-10 rounded-xl bg-slate-950 border border-slate-850 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all font-sans"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                {courseSearch && (
                  <button
                    type="button"
                    onClick={() => setCourseSearch('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-[10px] font-mono text-slate-400 font-bold w-full sm:w-auto text-center">
                Showing {filteredCourses.length} of {activeCategoryId === 'all' ? ACADEMY_COURSES.length : ACADEMY_COURSES.filter(c => c.categoryId === activeCategoryId).length} Programs
              </div>
            </div>

            {/* Main Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((c) => {
                  const isSelected = primaryCourse.courseId === c.id;
                  const itemTuition = getAcademyTuition(
                    primaryCourse.duration || '1 Month', 
                    primaryCourse.mode || 'Physical', 
                    c.price || 50000
                  );

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCourse(c)}
                      className={`w-full text-left p-5 rounded-2xl transition-all border flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-500/[0.04] to-slate-900 border-orange-500 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/25'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      {/* Top Ribbon Meta */}
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold ${
                            isSelected 
                              ? 'bg-orange-500 text-white shadow-sm' 
                              : 'bg-slate-850 text-slate-300 group-hover:bg-slate-800'
                          }`}>
                            {c.code}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block truncate max-w-[140px]">
                            {c.industry}
                          </span>
                        </div>

                        {/* Custom selection checkmark */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white scale-110'
                            : 'border border-slate-700 text-transparent scale-100 group-hover:border-slate-500'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-100 leading-snug tracking-tight group-hover:text-white transition-colors">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1 font-medium font-sans">
                          {c.description}
                        </p>
                      </div>

                      {/* Card Footer Details */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between w-full text-[10px]">
                        <div className="flex items-center gap-3 text-slate-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {c.duration}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-750 text-slate-400 text-[8px] font-bold font-mono">
                            {c.level}
                          </span>
                        </div>

                        {/* Tuition Price Display */}
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Est. Tuition</span>
                          <span className={`text-xs font-black font-mono ${
                            isSelected ? 'text-orange-400 text-sm' : 'text-slate-300 group-hover:text-slate-100'
                          }`}>
                            ₦{itemTuition.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center rounded-2xl bg-slate-900 border border-slate-850 p-6">
                  <Search className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <h5 className="text-sm font-bold text-slate-300">No Programs Match Your Query</h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    We couldn't find any courses matching "{courseSearch}" in this category. Try adjusting your search query or switching categories.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCourseSearch('');
                      setActiveCategoryId('all');
                    }}
                    className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Filter & Search
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Preferred Duration (Pill Buttons) */}
      <div className="space-y-3">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Preferred Duration <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DURATIONS.map((dur) => {
            const isSelected = primaryCourse.duration === dur;
            return (
              <button
                key={dur}
                type="button"
                onClick={() => handleDurationChange(dur)}
                className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500 text-white shadow-md shadow-orange-500/5 scale-[1.01]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="font-extrabold mt-0.5">{dur}</span>
                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">
                  {dur === '1 Month' ? 'Foundational Track' : dur === '3 Months' ? 'Professional Diploma' : 'Masterclass Executive'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Learning Mode (Pill Buttons) */}
      <div className="space-y-3">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Learning Mode <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODES.map((mode) => {
            const isSelected = primaryCourse.mode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => handleModeChange(mode.value)}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{mode.label}</span>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-orange-500 text-white' : 'border border-slate-700'}`}>
                    {isSelected && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-medium mt-1">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Lecture Days (Pill Buttons) */}
      <div className="space-y-3">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Preferred Lecture Days <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LECTURE_DAYS.map((days) => {
            const isSelected = primaryCourse.lectureDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => onChange({ ...primaryCourse, lectureDays: days })}
                className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'
                }`}
              >
                <span>{days}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Language (Pill Buttons) */}
      <div className="space-y-3">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Preferred Instruction Language <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LANGUAGES.map((lang) => {
            const isSelected = primaryCourse.language === lang.value;
            return (
              <button
                key={lang.value}
                type="button"
                onClick={() => onChange({ ...primaryCourse, language: lang.value })}
                className={`py-3.5 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fee Display Calculation Box */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-850 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-3 gap-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Active Registration Schedule Summary</span>
          <span className="text-xs font-bold text-white max-w-sm truncate text-right">
            {primaryCourse.courseCode ? `${primaryCourse.courseCode} - ${primaryCourse.courseTitle}` : 'No course selected'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-850">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Total Program Tuition</span>
            <span className="text-xl font-black text-white font-mono mt-1 block">
              ₦{primaryCourse.calculatedPrice.toLocaleString()}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest block">70% Installment Due Before Start</span>
            <span className="text-xl font-black text-orange-400 font-mono mt-1 block">
              ₦{Math.round(primaryCourse.calculatedPrice * 0.7).toLocaleString()}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-850">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">30% Balance on Course Completion</span>
            <span className="text-xl font-black text-slate-300 font-mono mt-1 block">
              ₦{Math.round(primaryCourse.calculatedPrice * 0.3).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Course Catalogue Popup Modal */}
      <CourseCatalogue
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        onSelectCourse={(selectedCourse) => {
          handleSelectCourse(selectedCourse);
          setIsCatalogueOpen(false);
        }}
        selectedCourseCodes={[primaryCourse.courseCode]}
        actionText="Select as Primary Programme"
      />

      {/* Mobile Categories Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md md:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative scrollbar-none"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-400" />
                  <span>Sectors & Disciplines</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-850 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {ACADEMY_CATEGORIES.map((cat) => {
                  const isSelected = activeCategoryId === cat.id;
                  const catCount = cat.id === 'all' 
                    ? ACADEMY_COURSES.length 
                    : ACADEMY_COURSES.filter(c => c.categoryId === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategoryId(cat.id);
                        setCourseSearch(''); // Reset search
                        setIsMobileFilterOpen(false); // Close modal
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/10 border border-orange-500/20 text-white font-bold'
                          : 'hover:bg-slate-850 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CategorySvgIcon catId={cat.id} className="w-5 h-5 shrink-0" />
                        <span className="text-xs truncate font-semibold leading-none">{cat.name}</span>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-orange-500/25 text-orange-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {catCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
