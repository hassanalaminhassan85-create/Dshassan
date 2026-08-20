import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Search, 
  Filter, 
  GraduationCap, 
  FileCheck2, 
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { AcademyCourse, ACADEMY_COURSES } from '../../lib/academyCoursesData';
import { CourseProgressRecord, StudentSession } from '../../lib/academyStorage';

interface StudentCoursesTabProps {
  session: StudentSession;
  enrolledCourses: AcademyCourse[];
  progressRecord: CourseProgressRecord;
  onLaunchCourse: (course: AcademyCourse) => void;
  onEnrollNewCourse: (course: AcademyCourse) => void;
}

export const StudentCoursesTab: React.FC<StudentCoursesTabProps> = ({
  session,
  enrolledCourses,
  progressRecord,
  onLaunchCourse,
  onEnrollNewCourse
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter enrolled courses
  const filteredEnrolled = enrolledCourses.filter((course) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Recommended other courses
  const enrolledCodes = new Set(enrolledCourses.map(c => c.code));
  const recommendedCourses = ACADEMY_COURSES.filter(c => !enrolledCodes.has(c.code)).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            My Enrolled Programs & Courses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access curricula, active modules, lecture schedules, and self-paced code repositories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or code..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEnrolled.map((course) => {
          const isPrimary = course.code === session.courseCode;
          const progressPct = isPrimary ? progressRecord.progressPercentage : 45;
          const totalTopics = course.modules.reduce((acc, m) => acc + m.topics.length, 0);

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Course Header Banner */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 dark:from-slate-950 to-white dark:to-slate-900">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {course.code}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      ACTIVE ENROLLMENT
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Course Metadata Details */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Category & Track
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                        {course.industry}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Program Duration
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                        {course.duration}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Learning Mode
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                        {session.mode} Delivery
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Modules & Topics
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                        {course.modules.length} Modules ({totalTopics} Topics)
                      </span>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700 dark:text-slate-300">
                        Course Progress
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono">
                        {progressPct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => onLaunchCourse(course)}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <PlayCircle size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Launch Learning Workspace</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recommended Upskilling Courses from 115+ Catalog */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span>Recommended Complementary Tech Tracks (115+ Catalog)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-enroll in specialized certifications or executive diplomas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedCourses.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {rec.code}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {rec.duration}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {rec.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {rec.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ₦{(rec.price || 75000).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => onEnrollNewCourse(rec)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Enroll</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
