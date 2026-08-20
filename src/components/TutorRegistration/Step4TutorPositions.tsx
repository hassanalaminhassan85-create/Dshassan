import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Check, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Globe, 
  Sparkles, 
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Grid
} from 'lucide-react';
import { ACADEMY_COURSES, AcademyCourse } from '../../lib/academyCoursesData';
import { CourseCatalogue, AnimatedBookIcon } from '../CourseCatalogue';
import { 
  TutorApplication, 
  INSTRUCTOR_CATEGORIES, 
  SelectedCoursePosition, 
  TutorLanguage 
} from '../../types/tutorRegistration';

interface Step4TutorPositionsProps {
  data: TutorApplication;
  onChange: (updated: Partial<TutorApplication>) => void;
}

const TUTOR_LANGUAGES: TutorLanguage[] = ['English', 'Hausa', 'Yoruba', 'Igbo'];

export const Step4TutorPositions: React.FC<Step4TutorPositionsProps> = ({
  data,
  onChange
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourseCode, setExpandedCourseCode] = useState<string | null>(null);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);

  // Selected courses with positions
  const selectedList = data.selectedCoursesWithPositions || [];

  // Filter courses
  const filteredCourses = useMemo(() => {
    let list = ACADEMY_COURSES;
    if (selectedCatId !== 'all') {
      const targetCat = INSTRUCTOR_CATEGORIES.find(c => c.id === selectedCatId);
      if (targetCat) {
        list = list.filter(c => 
          c.categoryName.toLowerCase().includes(targetCat.name.toLowerCase().split(',')[0].trim()) ||
          c.industry.toLowerCase().includes(targetCat.name.toLowerCase().split('&')[0].trim())
        );
      }
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
  }, [selectedCatId, searchQuery]);

  // Helper to find positions for a course based on its category
  const getPositionsForCourse = (course: AcademyCourse): string[] => {
    const matchedCategory = INSTRUCTOR_CATEGORIES.find(cat => 
      cat.name.toLowerCase().includes(course.categoryName.toLowerCase().split(' ')[0]) ||
      cat.positions.some(p => p.toLowerCase().includes(course.title.toLowerCase().split(' ')[0]))
    );

    if (matchedCategory) {
      return matchedCategory.positions;
    }

    // Default general tech instructor positions
    return [
      `${course.title} Lead Instructor`,
      `${course.title} Practical Lab Instructor`,
      `${course.categoryName} Curriculum Specialist`
    ];
  };

  // Toggle course selection
  const handleToggleCourse = (course: AcademyCourse) => {
    const exists = selectedList.find(item => item.courseCode === course.code);
    if (exists) {
      onChange({
        selectedCoursesWithPositions: selectedList.filter(item => item.courseCode !== course.code)
      });
      if (expandedCourseCode === course.code) {
        setExpandedCourseCode(null);
      }
    } else {
      const availablePositions = getPositionsForCourse(course);
      const newEntry: SelectedCoursePosition = {
        courseCode: course.code,
        courseTitle: course.title,
        categoryName: course.categoryName,
        selectedPositions: [availablePositions[0]]
      };
      onChange({
        selectedCoursesWithPositions: [...selectedList, newEntry]
      });
      setExpandedCourseCode(course.code);
    }
  };

  // Toggle specific position inside a selected course
  const handleTogglePosition = (courseCode: string, position: string) => {
    const updated = selectedList.map(item => {
      if (item.courseCode === courseCode) {
        const hasPos = item.selectedPositions.includes(position);
        const newPositions = hasPos
          ? item.selectedPositions.filter(p => p !== position)
          : [...item.selectedPositions, position];
        return {
          ...item,
          selectedPositions: newPositions
        };
      }
      return item;
    });
    onChange({ selectedCoursesWithPositions: updated });
  };

  // Toggle Language
  const handleToggleLanguage = (lang: TutorLanguage) => {
    const current = data.teachingLanguages || ['English'];
    const exists = current.includes(lang);
    if (exists) {
      if (current.length === 1) return; // Keep at least one
      onChange({ teachingLanguages: current.filter(l => l !== lang) });
    } else {
      onChange({ teachingLanguages: [...current, lang] });
    }
  };

  // Total selected instructor roles count
  const totalPositionsCount = useMemo(() => {
    return selectedList.reduce((acc, item) => acc + item.selectedPositions.length, 0);
  }, [selectedList]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
          Step 4 of 9 • Tutor Expertise & Teaching Selection
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
          Select Teaching Courses & Instructor Roles
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Choose the programmes you are qualified to instruct from our complete catalog of 115+ academy courses and specify your target instructor position titles.
        </p>
      </div>

      {/* Language Preference Pills */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-400" />
            <span>Languages You Can Teach In <span className="text-orange-400">*</span></span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">Select all applicable languages</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {TUTOR_LANGUAGES.map((lang) => {
            const isSelected = (data.teachingLanguages || []).includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => handleToggleLanguage(lang)}
                className={`py-2.5 px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20 border border-orange-500'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-white bg-white text-orange-600' : 'border-slate-600 bg-slate-950'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{lang}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Positions Summary Counter Box */}
      <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-950 border border-orange-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center font-bold text-lg font-mono">
            {selectedList.length}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white font-display">
              {selectedList.length === 0 ? 'No Courses Selected Yet' : `${selectedList.length} Course(s) • ${totalPositionsCount} Instructor Role(s) Selected`}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Select one or more courses below to reveal and check the specific teaching position roles you are applying for.
            </p>
          </div>
        </div>

        {selectedList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end max-w-xs">
            {selectedList.map(item => (
              <span
                key={item.courseCode}
                className="px-2.5 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-300 font-mono text-[10px] font-bold flex items-center gap-1.5"
              >
                <span>{item.courseCode}</span>
                <button
                  type="button"
                  onClick={() => onChange({
                    selectedCoursesWithPositions: selectedList.filter(c => c.courseCode !== item.courseCode)
                  })}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search & Category Filter Chips */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by DSTA code (e.g. DSTA-AI101) or course title..."
              className="w-full px-4 py-3.5 pl-11 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => setIsCatalogueOpen(true)}
            className="px-4 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Grid className="w-4 h-4 text-white" />
            <span>Open Animated Course Catalogue</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          </button>
        </div>

        {/* 24 Instructor Category Filter Chips */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Filter by 24 Instructor Position Categories:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCatId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCatId === 'all'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Categories (115 Courses)
            </button>
            {INSTRUCTOR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCatId === cat.id
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.number}. {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredCourses.map((course) => {
            const isSelected = selectedList.some(item => item.courseCode === course.code);
            const currentEntry = selectedList.find(item => item.courseCode === course.code);
            const isExpanded = expandedCourseCode === course.code;
            const availablePositions = getPositionsForCourse(course);

            return (
              <div
                key={course.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'bg-slate-950 border-orange-500/50 shadow-lg shadow-orange-950/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Course Main Row */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div 
                    onClick={() => handleToggleCourse(course)}
                    className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                      isSelected ? 'bg-orange-600 border-orange-500 text-white' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <AnimatedBookIcon categoryId={course.categoryId} title={course.title} className="w-10 h-10 shrink-0" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold border border-orange-500/30">
                          {course.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold truncate">{course.categoryName}</span>
                      </div>
                      <h5 className="text-sm font-bold text-white mt-1 leading-snug truncate">{course.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{course.description}</p>
                    </div>
                  </div>

                  {/* Expand Positions Button */}
                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => setExpandedCourseCode(isExpanded ? null : course.code)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span className="text-[10px] text-orange-400 font-mono">
                        {currentEntry?.selectedPositions.length || 0} Role(s)
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Sub-positions Expandable Panel */}
                {isSelected && (isExpanded || currentEntry?.selectedPositions.length === 0) && (
                  <div className="px-5 pb-5 pt-2 bg-slate-900/60 border-t border-slate-800/80 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Select Instructor Position Roles for this Programme:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availablePositions.map((pos) => {
                        const isPosChecked = currentEntry?.selectedPositions.includes(pos) || false;
                        return (
                          <div
                            key={pos}
                            onClick={() => handleTogglePosition(course.code, pos)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              isPosChecked
                                ? 'bg-orange-500/15 border-orange-500/50 text-orange-200 shadow-sm'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                              isPosChecked ? 'bg-orange-600 border-orange-500 text-white' : 'border-slate-700 bg-slate-900'
                            }`}>
                              {isPosChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-semibold">{pos}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Catalogue Popup Modal for Tutor Position Selection */}
      <CourseCatalogue
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        onSelectCourse={(course) => {
          handleToggleCourse(course);
          setExpandedCourseCode(course.code);
          setIsCatalogueOpen(false);
        }}
        selectedCourseCodes={selectedList.map(c => c.courseCode)}
        actionText="Select to Teach Programme"
      />
    </div>
  );
};
