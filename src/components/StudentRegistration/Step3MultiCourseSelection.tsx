import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, AlertTriangle, Check, Layers, Clock, Globe2, Sparkles, Filter, Grid, CheckCircle2, ArrowRight } from 'lucide-react';
import { ACADEMY_COURSES, ACADEMY_CATEGORIES, AcademyCourse } from '../../lib/academyCoursesData';
import { CourseCatalogue, AnimatedBookIcon } from '../CourseCatalogue';
import { getAcademyTuition } from '../../lib/pricing';
import { 
  SelectedCourseConfig, 
  DurationOption, 
  LearningMode, 
  LectureDays, 
  LanguagePreference 
} from '../../types/studentRegistration';

interface Step3MultiCourseSelectionProps {
  primaryCourse: SelectedCourseConfig;
  additionalCourses: SelectedCourseConfig[];
  onUpdatePrimary: (course: SelectedCourseConfig) => void;
  onUpdateAdditional: (courses: SelectedCourseConfig[]) => void;
}

const DURATIONS: DurationOption[] = ['1 Month', '3 Months', '6 Months'];
const MODES: LearningMode[] = ['Physical', 'Virtual', 'Hybrid'];
const LECTURE_DAYS: LectureDays[] = ['Mondays-Wednesdays', 'Wednesdays-Fridays', 'Saturdays & Sundays'];
const LANGUAGES: LanguagePreference[] = ['English', 'Hausa', 'Yoruba', 'Igbo'];

export const Step3MultiCourseSelection: React.FC<Step3MultiCourseSelectionProps> = ({
  primaryCourse,
  additionalCourses,
  onUpdatePrimary,
  onUpdateAdditional,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);

  // All selected courses array (primary + additional)
  const allSelectedCourses = useMemo(() => {
    const list: SelectedCourseConfig[] = [];
    if (primaryCourse.courseCode) list.push(primaryCourse);
    list.push(...additionalCourses);
    return list;
  }, [primaryCourse, additionalCourses]);

  const selectedCount = allSelectedCourses.length;

  // Calculate official pricing helper using getAcademyTuition matrix
  const calculatePrice = (dur: DurationOption, mode: LearningMode, basePrice: number = 50000) => {
    return getAcademyTuition(dur, mode, basePrice);
  };

  // Filter courses for browsing
  const filteredCatalog = useMemo(() => {
    let list = ACADEMY_COURSES;
    if (selectedCategory !== 'All') {
      list = list.filter(c => c.categoryName === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.code.toLowerCase().includes(q) || 
        c.title.toLowerCase().includes(q) || 
        c.categoryName.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Schedule conflict detection
  const conflicts = useMemo(() => {
    const issues: string[] = [];
    if (allSelectedCourses.length > 1) {
      for (let i = 0; i < allSelectedCourses.length; i++) {
        for (let j = i + 1; j < allSelectedCourses.length; j++) {
          const c1 = allSelectedCourses[i];
          const c2 = allSelectedCourses[j];
          if (c1.lectureDays === c2.lectureDays && c1.mode === c2.mode) {
            issues.push(
              `Schedule overlap: "${c1.courseCode}" and "${c2.courseCode}" are both scheduled for ${c1.lectureDays} via ${c1.mode} mode.`
            );
          }
        }
      }
    }
    return issues;
  }, [allSelectedCourses]);

  // Total fees calculation
  const totalTuition = useMemo(() => {
    return allSelectedCourses.reduce((sum, c) => sum + (c.calculatedPrice || 0), 0);
  }, [allSelectedCourses]);

  const deposit70 = Math.round(totalTuition * 0.7);
  const balance30 = Math.round(totalTuition * 0.3);

  // Toggle selection
  const handleToggleCourse = (course: AcademyCourse) => {
    const isPrimary = primaryCourse.courseCode === course.code;
    const additionalIndex = additionalCourses.findIndex(c => c.courseCode === course.code);

    if (isPrimary) {
      return; // Primary cannot be toggled off directly here
    }

    if (additionalIndex >= 0) {
      const updated = additionalCourses.filter((_, idx) => idx !== additionalIndex);
      onUpdateAdditional(updated);
    } else {
      if (selectedCount >= 3) {
        alert('You can select a maximum of 3 concurrent programmes for an active semester.');
        return;
      }
      const baseP = course.price || 50000;
      const initialPrice = getAcademyTuition('1 Month', primaryCourse.mode || 'Physical', baseP);
      const newCourseConfig: SelectedCourseConfig = {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        categoryName: course.categoryName,
        duration: '1 Month',
        mode: primaryCourse.mode || 'Physical',
        lectureDays: primaryCourse.lectureDays === 'Mondays-Wednesdays' ? 'Wednesdays-Fridays' : 'Mondays-Wednesdays',
        language: primaryCourse.language || 'English',
        basePrice: baseP,
        calculatedPrice: initialPrice
      };
      onUpdateAdditional([...additionalCourses, newCourseConfig]);
    }
  };

  const handleUpdateAdditionalCourse = (index: number, updated: SelectedCourseConfig) => {
    const list = [...additionalCourses];
    list[index] = updated;
    onUpdateAdditional(list);
  };

  const handleRemoveAdditional = (index: number) => {
    const updated = additionalCourses.filter((_, idx) => idx !== index);
    onUpdateAdditional(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
            Step 3 of 10 • Course Enrollment
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
            Multi-Programme Enrollment & Customization
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bundle up to 3 complementary programmes. Each course has independent duration, learning mode, schedule, and language settings.
          </p>
        </div>
        
        {/* Selected Counter Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center gap-3 shrink-0 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-sm font-mono border border-orange-500/30">
            {selectedCount}/3
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Active Bundle</span>
            <span className="text-xs font-bold text-white">{selectedCount} of 3 programmes selected</span>
          </div>
        </div>
      </div>

      {/* Schedule Conflict Notification */}
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5 shadow-lg"
        >
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Schedule Overlap Notice</span>
          </div>
          {conflicts.map((msg, i) => (
            <p key={i} className="text-[11px] text-amber-200/90 pl-6 leading-relaxed font-medium">
              • {msg}
            </p>
          ))}
          <p className="text-[10px] text-amber-400/80 pl-6 pt-1 font-semibold">
            Tip: Adjust lecture days (e.g. Mon-Wed vs Wed-Fri vs Weekends) or mode (Virtual vs Physical) below to resolve schedule overlap.
          </p>
        </motion.div>
      )}

      {/* Configured Programmes Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <span>Configured Enrolment Stack ({allSelectedCourses.length})</span>
          </h4>
          <button
            type="button"
            onClick={() => setIsCatalogueOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/20"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Open Full 115-Course Catalogue</span>
            <Sparkles className="w-3 h-3 text-amber-200" />
          </button>
        </div>

        {/* Primary Course Card */}
        {primaryCourse.courseCode && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-orange-500/50 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3.5 py-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl shadow-md">
              Primary Programme
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-12">
              <div className="flex items-center gap-3.5">
                <AnimatedBookIcon categoryId="tech" title={primaryCourse.courseTitle} className="w-11 h-11 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-xs font-mono font-bold border border-orange-500/30">
                      {primaryCourse.courseCode}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{primaryCourse.categoryName}</span>
                  </div>
                  <h5 className="text-sm sm:text-base font-black text-white mt-1">{primaryCourse.courseTitle}</h5>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block uppercase font-bold">Tuition</span>
                <span className="text-base font-black text-orange-400 font-display">₦{primaryCourse.calculatedPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* In-place adjustments */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Duration</label>
                <select
                  value={primaryCourse.duration}
                  onChange={(e) => {
                    const dur = e.target.value as DurationOption;
                    const pr = calculatePrice(dur, primaryCourse.mode || 'Physical', primaryCourse.basePrice || 50000);
                    onUpdatePrimary({ ...primaryCourse, duration: dur, calculatedPrice: pr });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-orange-500"
                >
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Learning Mode</label>
                <select
                  value={primaryCourse.mode}
                  onChange={(e) => {
                    const m = e.target.value as LearningMode;
                    const pr = calculatePrice(primaryCourse.duration || '1 Month', m, primaryCourse.basePrice || 50000);
                    onUpdatePrimary({ ...primaryCourse, mode: m, calculatedPrice: pr });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-orange-500"
                >
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Lecture Schedule</label>
                <select
                  value={primaryCourse.lectureDays}
                  onChange={(e) => onUpdatePrimary({ ...primaryCourse, lectureDays: e.target.value as LectureDays })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-orange-500"
                >
                  {LECTURE_DAYS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Language</label>
                <select
                  value={primaryCourse.language}
                  onChange={(e) => onUpdatePrimary({ ...primaryCourse, language: e.target.value as LanguagePreference })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-orange-500"
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Additional Courses Cards */}
        {additionalCourses.map((c, idx) => (
          <div key={c.courseCode} className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-xl space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
              <div className="flex items-center gap-3.5">
                <AnimatedBookIcon categoryId="tech" title={c.courseTitle} className="w-11 h-11 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
                      {c.courseCode}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{c.categoryName}</span>
                  </div>
                  <h5 className="text-sm sm:text-base font-black text-white mt-1">{c.courseTitle}</h5>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block uppercase font-bold">Tuition</span>
                  <span className="text-base font-black text-amber-400 font-display">₦{c.calculatedPrice.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAdditional(idx)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer border border-red-500/20"
                  title="Remove Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-place adjustments */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Duration</label>
                <select
                  value={c.duration}
                  onChange={(e) => {
                    const dur = e.target.value as DurationOption;
                    const pr = calculatePrice(dur, c.mode || 'Physical', c.basePrice || 50000);
                    handleUpdateAdditionalCourse(idx, { ...c, duration: dur, calculatedPrice: pr });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-orange-500"
                >
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Learning Mode</label>
                <select
                  value={c.mode}
                  onChange={(e) => {
                    const m = e.target.value as LearningMode;
                    const pr = calculatePrice(c.duration || '1 Month', m, c.basePrice || 50000);
                    handleUpdateAdditionalCourse(idx, { ...c, mode: m, calculatedPrice: pr });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-orange-500"
                >
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Lecture Schedule</label>
                <select
                  value={c.lectureDays}
                  onChange={(e) => handleUpdateAdditionalCourse(idx, { ...c, lectureDays: e.target.value as LectureDays })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-orange-500"
                >
                  {LECTURE_DAYS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Language</label>
                <select
                  value={c.language}
                  onChange={(e) => handleUpdateAdditionalCourse(idx, { ...c, language: e.target.value as LanguagePreference })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-orange-500"
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Catalog Search & Filter Section to Add Courses */}
      {selectedCount < 3 && (
        <div className="space-y-4 p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-200">
                Browse & Add Additional Courses (Up to {3 - selectedCount} more)
              </h4>
              <span className="text-[11px] text-orange-400 font-bold">Displaying complete catalog of 115 DSTA Programmes</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by DSTA code (e.g. DSTA-AI103), title, industry, or keywords..."
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
          </div>

          {/* 22 Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              All Programmes (115)
            </button>
            {ACADEMY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name} ({cat.courseCount})
              </button>
            ))}
          </div>

          {/* Catalog Grid of All Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredCatalog.map((c) => {
              const isAlreadySelected = allSelectedCourses.some(item => item.courseCode === c.code);
              const catalogTuition = getAcademyTuition('1 Month', primaryCourse.mode || 'Physical', c.price || 50000);
              return (
                <div
                  key={c.id}
                  onClick={() => handleToggleCourse(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isAlreadySelected
                      ? 'bg-orange-500/10 border-orange-500/50 text-white shadow-md'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <AnimatedBookIcon categoryId={c.categoryId} title={c.title} className="w-10 h-10 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                          {c.code}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{c.categoryName}</span>
                      </div>
                      <h6 className="text-xs font-extrabold text-slate-100 mt-1 truncate">{c.title}</h6>
                      <div className="text-[10px] text-slate-400 mt-0.5">₦{catalogTuition.toLocaleString()} (1 Mo base)</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 ${
                    isAlreadySelected ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}>
                    {isAlreadySelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Total Fee with 70% Breakdown Display */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Enrolment Package Tuition</span>
            <h4 className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-display">₦{totalTuition.toLocaleString()}</h4>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold w-fit">
            {allSelectedCourses.length} {allSelectedCourses.length === 1 ? 'Programme' : 'Programmes'} Bundled
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/25 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 block">
              70% Deposit Due Before Commencement
            </span>
            <span className="text-2xl font-black text-orange-400 font-display">₦{deposit70.toLocaleString()}</span>
            <p className="text-xs text-orange-200/80 pt-1">Secures admission slot, lab access, and student starter kit.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              30% Balance Due on Program Completion
            </span>
            <span className="text-2xl font-black text-slate-300 font-display">₦{balance30.toLocaleString()}</span>
            <p className="text-xs text-slate-400 pt-1">Due prior to final certification and internship placement.</p>
          </div>
        </div>
      </div>

      {/* Course Catalogue Popup Modal */}
      <CourseCatalogue
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        onSelectCourse={(selectedCourse) => {
          handleToggleCourse(selectedCourse);
          setIsCatalogueOpen(false);
        }}
        selectedCourseCodes={allSelectedCourses.map(c => c.courseCode)}
        actionText="Add Course to Bundle"
      />
    </div>
  );
};
