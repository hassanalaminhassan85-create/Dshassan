import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, BookOpen, Clock, Laptop, Monitor, Globe2, Tag, Check, AlertCircle, Sparkles, Grid } from 'lucide-react';
import { ACADEMY_COURSES, AcademyCourse } from '../../lib/academyCoursesData';
import { getAcademyTuition, MIN_ACADEMY_TUITION, formatNGN } from '../../lib/pricing';
import { CourseCatalogue, AnimatedBookIcon } from '../CourseCatalogue';
import { 
  DurationOption, 
  LearningMode, 
  LectureDays, 
  LanguagePreference, 
  SelectedCourseConfig 
} from '../../types/studentRegistration';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);

  // Filter courses by code, title, or category (all 115 courses)
  const filteredCourses = useMemo(() => {
    let list = ACADEMY_COURSES;
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase();
      list = list.filter(
        c => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.categoryName.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
      );
    }
    return list;
  }, [courseSearch]);

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
    setCourseSearch(`${course.code} - ${course.title}`);
    setIsDropdownOpen(false);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
          Step 2 of 10
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Application Information
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Select your primary programme of study and customize your learning mode, schedule, and duration.
        </p>
      </div>

      {/* Date of Application (Auto-filled) */}
      <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Date of Application</span>
            <div className="text-sm font-bold text-white font-mono">{applicationDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
        <span className="self-start sm:self-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
          Auto-Verified
        </span>
      </div>

      {/* Programme / Course Selection from ALL 115 Courses */}
      <div className="space-y-3 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Select Programme / Course <span className="text-orange-400">*</span>
            <span className="ml-2 text-[10px] font-normal text-slate-400 font-mono">(115 Courses with DSTA Codes Available)</span>
          </label>
          
          <button
            type="button"
            onClick={() => setIsCatalogueOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600 border border-orange-500/40 text-orange-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
          >
            <Grid className="w-3.5 h-3.5 text-orange-400" />
            <span>Browse Animated Course Catalogue</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={courseSearch || (primaryCourse.courseCode ? `${primaryCourse.courseCode} - ${primaryCourse.courseTitle}` : '')}
            onChange={(e) => {
              setCourseSearch(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Type DSTA code (e.g. DSTA-AI101) or course name..."
            className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Dropdown Results */}
        {isDropdownOpen && (
          <div className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 space-y-1">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((c) => {
                const isSelected = primaryCourse.courseCode === c.code;
                const itemTuition = getAcademyTuition(primaryCourse.duration || '1 Month', primaryCourse.mode || 'Physical', c.price || 50000);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCourse(c)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-orange-500/20 border border-orange-500/40 text-white'
                        : 'hover:bg-slate-800 text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AnimatedBookIcon categoryId={c.categoryId} title={c.title} className="w-9 h-9 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-mono font-bold">
                            {c.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{c.categoryName}</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-100 mt-1">{c.title}</h5>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-orange-400">₦{itemTuition.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-400 font-medium">{primaryCourse.duration || '1 Month'} ({primaryCourse.mode || 'Physical'})</div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No courses match "{courseSearch}". Try searching by keyword or code.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auto-filled Course Code and Category Badge */}
      {primaryCourse.courseCode && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/30 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-mono font-black text-xs shadow-md">
              {primaryCourse.courseCode}
            </div>
            <div>
              <div className="text-xs font-bold text-white">{primaryCourse.courseTitle}</div>
              <div className="text-[10px] text-slate-400 font-medium">{primaryCourse.categoryName}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Calculated Tuition</span>
            <span className="text-base font-black text-orange-400">₦{primaryCourse.calculatedPrice.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      {/* Preferred Duration (Pill Buttons) */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Preferred Duration <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {DURATIONS.map((dur) => {
            const isSelected = primaryCourse.duration === dur;
            return (
              <button
                key={dur}
                type="button"
                onClick={() => handleDurationChange(dur)}
                className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{dur}</span>
                <span className="text-[9px] font-normal opacity-80">
                  {dur === '1 Month' ? 'Foundational' : dur === '3 Months' ? 'Professional' : 'Masterclass'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Learning Mode (Pill Buttons) */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Learning Mode <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MODES.map((mode) => {
            const isSelected = primaryCourse.mode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => onChange({ ...primaryCourse, mode: mode.value })}
                className={`p-3.5 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{mode.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Lecture Days (Pill Buttons) */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Preferred Lecture Days <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {LECTURE_DAYS.map((days) => {
            const isSelected = primaryCourse.lectureDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => onChange({ ...primaryCourse, lectureDays: days })}
                className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>{days}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Language (Pill Buttons) */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Preferred Instruction Language <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {LANGUAGES.map((lang) => {
            const isSelected = primaryCourse.language === lang.value;
            return (
              <button
                key={lang.value}
                type="button"
                onClick={() => onChange({ ...primaryCourse, language: lang.value })}
                className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fee Display Calculation Box */}
      <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Programme Selected</span>
          <span className="text-xs font-bold text-white">{primaryCourse.courseCode || 'None'} - {primaryCourse.courseTitle || 'Please select a course'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Tuition</span>
            <span className="text-lg font-black text-white">₦{primaryCourse.calculatedPrice.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest block">70% Due Before Start</span>
            <span className="text-lg font-black text-orange-400">₦{Math.round(primaryCourse.calculatedPrice * 0.7).toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">30% Balance on Finish</span>
            <span className="text-lg font-black text-slate-300">₦{Math.round(primaryCourse.calculatedPrice * 0.3).toLocaleString()}</span>
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
    </div>
  );
};
