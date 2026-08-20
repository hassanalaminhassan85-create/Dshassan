import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Calendar, 
  Video, 
  Award, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Layers, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TutorSession } from '../../lib/academyStorage';
import { AcademyCourse } from '../../lib/academyCoursesData';
import { TutorTabType } from './TutorSidebar';

interface TutorCoursesTabProps {
  session: TutorSession;
  assignedCourses: AcademyCourse[];
  onSelectTab: (tab: TutorTabType) => void;
  onLaunchTeachingWorkspace: (course: AcademyCourse) => void;
}

export const TutorCoursesTab: React.FC<TutorCoursesTabProps> = ({
  session,
  assignedCourses,
  onSelectTab,
  onLaunchTeachingWorkspace
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = assignedCourses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            My Assigned Teaching Tracks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official curriculum delivery, 70/30 practical project labs, and cohort milestones.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter courses by title/code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((course) => {
          const totalTopics = course.modules.reduce((a, m) => a + m.topics.length, 0);

          return (
            <div
              key={course.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-purple-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    {course.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Cohort 2026 Alpha
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Metadata Row */}
                <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Duration</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{course.duration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Modules</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{course.modules.length} ({totalTopics} topics)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Class Size</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{session.totalStudents || 32} Scholars</span>
                  </div>
                </div>

                {/* 70/30 Practical Training Indicator */}
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs space-y-1.5 mb-4">
                  <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-300 text-[11px]">
                    <span>Curriculum Structure</span>
                    <span>70% Practical • 30% Theory</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden flex">
                    <div className="w-[70%] bg-purple-600" />
                    <div className="w-[30%] bg-blue-500" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectTab('students')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Users size={14} />
                  <span>Roster</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLaunchTeachingWorkspace(course)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Video size={14} />
                  <span>Teaching Workspace</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
