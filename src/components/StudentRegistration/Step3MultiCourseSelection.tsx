import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, AlertTriangle, Check, Layers, Clock, Globe2, Sparkles, Filter } from 'lucide-react';
import { ACADEMY_COURSES, ACADEMY_CATEGORIES, AcademyCourse } from '../../lib/academyCoursesData';
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

  // All selected courses array (primary + additional)
  const allSelectedCourses = useMemo(() => {
    const list: SelectedCourseConfig[] = [];
    if (primaryCourse.courseCode) list.push(primaryCourse);
    list.push(...additionalCourses);
    return list;
  }, [primaryCourse, additionalCourses]);

  const selectedCount = allSelectedCourses.length;

  // Calculate pricing helper
  const calculatePrice = (base: number, dur: DurationOption) => {
    if (dur === '1 Month') return base;
    if (dur === '3 Months') return Math.round(base * 2.2);
    return Math.round(base * 3.8);
  };

  // Filter courses for browsing
  const filteredCatalog = useMemo(() => {
    let list = ACADEMY_COURSES;
    if (selectedCategory !== 'All') {
      list = list.filter(c => c.categoryName === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.categoryName.toLowerCase().includes(q));
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
              `Conflict detected: "${c1.courseCode}" and "${c2.courseCode}" are both scheduled for ${c1.lectureDays} via ${c1.mode} mode.`
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
      // Cannot uncheck primary here; prompt to change in Step 2 or swap
      return;
    }

    if (additionalIndex >= 0) {
      // Remove from additional
      const updated = additionalCourses.filter((_, idx) => idx !== additionalIndex);
      onUpdateAdditional(updated);
    } else {
      // Add if under max 3
      if (selectedCount >= 3) {
        alert('You can select a maximum of 3 concurrent programmes for an active semester.');
        return;
      }
      const newCourseConfig: SelectedCourseConfig = {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        categoryName: course.categoryName,
        duration: '1 Month',
        mode: primaryCourse.mode || 'Physical',
        lectureDays: primaryCourse.lectureDays === 'Mondays-Wednesdays' ? 'Wednesdays-Fridays' : 'Mondays-Wednesdays',
        language: primaryCourse.language || 'English',
        basePrice: course.price,
        calculatedPrice: course.price
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
            Step 3 of 10
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Multi-Course Selection (Max 3)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bundle complementary skillsets. Each course has independent duration, schedule, and mode settings.
          </p>
        </div>
        
        {/* Selected Counter Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center gap-3 shrink-0 shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-sm font-mono">
            {selectedCount}/3
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Selected</span>
            <span className="text-xs font-bold text-white">{selectedCount} of 3 courses enrolled</span>
          </div>
        </div>
      </div>

      {/* Schedule Conflict Notification */}
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5"
        >
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Schedule Overlap Notice</span>
          </div>
          {conflicts.map((msg, i) => (
            <p key={i} className="text-[11px] text-amber-200/90 pl-6 leading-relaxed">
              • {msg}
            </p>
          ))}
          <p className="text-[10px] text-amber-400/80 pl-6 pt-1">
            Tip: Adjust lecture days (e.g. Mon-Wed vs Wed-Fri vs Weekends) or mode (Virtual vs Physical) for one of the courses below.
          </p>
        </motion.div>
      )}

      {/* Selected Courses Configuration Cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-400" />
          <span>Configured Programmes ({allSelectedCourses.length})</span>
        </h4>

        {/* Primary Course Card */}
        {primaryCourse.courseCode && (
          <div className="p-5 rounded-3xl bg-slate-900 border border-orange-500/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl">
              Primary Programme
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-12">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-xs font-mono font-bold">
                    {primaryCourse.courseCode}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{primaryCourse.categoryName}</span>
                </div>
                <h5 className="text-sm font-black text-white mt-1">{primaryCourse.courseTitle}</h5>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-sm font-black text-orange-400">₦{primaryCourse.calculatedPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* In-place adjustments */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Duration</label>
                <select
                  value={primaryCourse.duration}
                  onChange={(e) => {
                    const dur = e.target.value as DurationOption;
                    const pr = calculatePrice(primaryCourse.basePrice, dur);
                    onUpdatePrimary({ ...primaryCourse, duration: dur, calculatedPrice: pr });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Mode</label>
                <select
                  value={primaryCourse.mode}
                  onChange={(e) => onUpdatePrimary({ ...primaryCourse, mode: e.target.value as LearningMode })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Lecture Days</label>
                <select
                  value={primaryCourse.lectureDays}
                  onChange={(e) => onUpdatePrimary({ ...primaryCourse, lectureDays: e.target.value as LectureDays })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {LECTURE_DAYS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Language</label>
                <select
                  value={primaryCourse.language}
                  onChange={(e) => onUpdatePrimary({ ...primaryCourse, language: e.target.value as LanguagePreference })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Additional Courses Cards */}
        {additionalCourses.map((c, idx) => (
          <div key={c.courseCode} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-700 shadow-xl space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                    {c.courseCode}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{c.categoryName}</span>
                </div>
                <h5 className="text-sm font-black text-white mt-1">{c.courseTitle}</h5>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-amber-400">₦{c.calculatedPrice.toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAdditional(idx)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  title="Remove Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-place adjustments */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Duration</label>
                <select
                  value={c.duration}
                  onChange={(e) => {
                    const dur = e.target.value as DurationOption;
                    const pr = calculatePrice(c.basePrice, dur);
                    handleUpdateAdditionalCourse(idx, { ...c, duration: dur, calculatedPrice: pr });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Mode</label>
                <select
                  value={c.mode}
                  onChange={(e) => handleUpdateAdditionalCourse(idx, { ...c, mode: e.target.value as LearningMode })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Lecture Days</label>
                <select
                  value={c.lectureDays}
                  onChange={(e) => handleUpdateAdditionalCourse(idx, { ...c, lectureDays: e.target.value as LectureDays })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {LECTURE_DAYS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Language</label>
                <select
                  value={c.language}
                  onChange={(e) => handleUpdateAdditionalCourse(idx, { ...c, language: e.target.value as LanguagePreference })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
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
        <div className="space-y-4 p-5 rounded-3xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">
              Browse & Add Additional Courses (Up to {3 - selectedCount} more)
            </h4>
            <span className="text-[10px] text-orange-400 font-bold">115 DSTA Programmes</span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by DSTA code (e.g. DSTA-AI103), title, or keywords..."
              className="w-full px-4 py-3 pl-10 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-orange-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* 22 Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              All (115)
            </button>
            {ACADEMY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name} ({cat.courseCount})
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredCatalog.map((c) => {
              const isAlreadySelected = allSelectedCourses.some(item => item.courseCode === c.code);
              return (
                <div
                  key={c.id}
                  onClick={() => handleToggleCourse(c)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isAlreadySelected
                      ? 'bg-orange-500/10 border-orange-500/40 text-white'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${
                      isAlreadySelected ? 'bg-orange-500 border-orange-400 text-white' : 'border-slate-700 bg-slate-950'
                    }`}>
                      {isAlreadySelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-orange-400">{c.code}</span>
                        <span className="text-[9px] text-slate-500">{c.categoryName}</span>
                      </div>
                      <h6 className="text-xs font-bold text-slate-200 mt-0.5 line-clamp-1">{c.title}</h6>
                      <div className="text-[10px] text-slate-400 mt-0.5">1-6 Mo • ₦{c.price.toLocaleString()} base</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-orange-400 shrink-0">
                    {isAlreadySelected ? 'Selected' : '+ Add'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Total Fee with 70% Breakdown Display */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Tuition Package</span>
            <h4 className="text-2xl font-black text-white mt-0.5">₦{totalTuition.toLocaleString()}</h4>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            {allSelectedCourses.length} {allSelectedCourses.length === 1 ? 'Course' : 'Courses'} Bundled
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 block">
              70% Deposit Due Before Commencement
            </span>
            <span className="text-xl font-black text-orange-400">₦{deposit70.toLocaleString()}</span>
            <p className="text-[10px] text-orange-200/80 mt-1">Secures admission slot, lab access & starter kit.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              30% Balance Due on Program Completion
            </span>
            <span className="text-xl font-black text-slate-300">₦{balance30.toLocaleString()}</span>
            <p className="text-[10px] text-slate-400 mt-1">Due prior to final certification & internship placement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
