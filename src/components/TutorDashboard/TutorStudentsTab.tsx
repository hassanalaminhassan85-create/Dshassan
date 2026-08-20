import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Filter, 
  X, 
  ShieldCheck, 
  GraduationCap,
  CalendarCheck
} from 'lucide-react';
import { TutorSession } from '../../lib/academyStorage';
import { AcademyCourse } from '../../lib/academyCoursesData';

interface TutorStudentsTabProps {
  session: TutorSession;
  assignedCourses: AcademyCourse[];
}

interface StudentRosterItem {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  courseCode: string;
  courseTitle: string;
  cohort: string;
  mode: 'Physical Classroom' | 'Virtual Online' | 'Hybrid';
  attendanceRate: number;
  progressPercentage: number;
  tuitionStatus: 'fully_cleared' | 'deposit_paid' | 'pending';
  lastActive: string;
}

export const TutorStudentsTab: React.FC<TutorStudentsTabProps> = ({
  session,
  assignedCourses
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<StudentRosterItem | null>(null);
  const [tutorNoteText, setTutorNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Mock Student Roster for the Tutor's assigned courses
  const [students, setStudents] = useState<StudentRosterItem[]>([
    {
      id: 'stu_1',
      studentId: 'DSTA-2026-0842',
      fullName: 'Aisha Bello',
      email: 'aisha.bello@student.dstech.agency',
      phone: '+234 803 111 2233',
      courseCode: 'DSTA-SWE01',
      courseTitle: 'Full-Stack Software Engineering Masterclass',
      cohort: 'Cohort 2026 Alpha',
      mode: 'Physical Classroom',
      attendanceRate: 94,
      progressPercentage: 42,
      tuitionStatus: 'fully_cleared',
      lastActive: 'Today, 2 hours ago'
    },
    {
      id: 'stu_2',
      studentId: 'DSTA-2026-0915',
      fullName: 'Ibrahim Danladi',
      email: 'ibrahim.danladi@student.dstech.agency',
      phone: '+234 809 444 5566',
      courseCode: 'DSTA-SWE01',
      courseTitle: 'Full-Stack Software Engineering Masterclass',
      cohort: 'Cohort 2026 Alpha',
      mode: 'Virtual Online',
      attendanceRate: 88,
      progressPercentage: 68,
      tuitionStatus: 'fully_cleared',
      lastActive: 'Yesterday'
    },
    {
      id: 'stu_3',
      studentId: 'DSTA-2026-1044',
      fullName: 'Chidinma Eze',
      email: 'chidinma.eze@student.dstech.agency',
      phone: '+234 812 333 9988',
      courseCode: 'DSTA-SWE01',
      courseTitle: 'Full-Stack Software Engineering Masterclass',
      cohort: 'Cohort 2026 Alpha',
      mode: 'Hybrid',
      attendanceRate: 82,
      progressPercentage: 35,
      tuitionStatus: 'deposit_paid',
      lastActive: '3 days ago'
    },
    {
      id: 'stu_4',
      studentId: 'DSTA-2026-1189',
      fullName: 'Tunde Bakare',
      email: 'tunde.bakare@student.dstech.agency',
      phone: '+234 808 777 6655',
      courseCode: 'DSTA-AI101',
      courseTitle: 'Artificial Intelligence & Machine Learning Architectures',
      cohort: 'Cohort 2026 Alpha',
      mode: 'Physical Classroom',
      attendanceRate: 96,
      progressPercentage: 55,
      tuitionStatus: 'fully_cleared',
      lastActive: 'Today, 1 hour ago'
    },
    {
      id: 'stu_5',
      studentId: 'DSTA-2026-1203',
      fullName: 'Fatima Mohammed',
      email: 'fatima.mohammed@student.dstech.agency',
      phone: '+234 814 222 1100',
      courseCode: 'DSTA-AI101',
      courseTitle: 'Artificial Intelligence & Machine Learning Architectures',
      cohort: 'Cohort 2026 Alpha',
      mode: 'Virtual Online',
      attendanceRate: 90,
      progressPercentage: 48,
      tuitionStatus: 'deposit_paid',
      lastActive: 'Today, 4 hours ago'
    }
  ]);

  const filtered = students.filter(s => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourseFilter === 'all' || s.courseCode === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorNoteText.trim()) return;
    setNoteSaved(true);
    setTimeout(() => {
      setNoteSaved(false);
      setSelectedStudentForNote(null);
      setTutorNoteText('');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Assigned Student Roster & Performance
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor scholar attendance rates, 70/30 practical project pacing, and mentor logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Assigned Courses</option>
            {assignedCourses.map(c => (
              <option key={c.code} value={c.code}>{c.code} - {c.title.substring(0, 24)}...</option>
            ))}
          </select>

          <div className="relative w-full sm:w-60">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholar by name/ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Roster Table Container */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Student & ID</th>
                <th className="p-4">Course & Mode</th>
                <th className="p-4">Attendance</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Tuition Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No student records matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student.fullName}
                      </div>
                      <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                        {student.studentId}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {student.email}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
                        {student.courseTitle}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 inline-block mt-0.5 font-medium">
                        {student.mode}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900 dark:text-white">
                        <CalendarCheck size={14} className={student.attendanceRate >= 80 ? 'text-emerald-500' : 'text-amber-500'} />
                        <span>{student.attendanceRate}%</span>
                      </div>
                      <span className="text-[9px] text-slate-400">
                        {student.attendanceRate >= 80 ? 'Exam Eligible' : 'Below 80% Min'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${student.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {student.progressPercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {student.tuitionStatus === 'fully_cleared' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          100% Cleared
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Deposit Settled
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForNote(student)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <MessageSquare size={13} />
                        <span>Log Note</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Student Note Modal */}
      <AnimatePresence>
        {selectedStudentForNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentForNote(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tutor Mentorship Log
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    For {selectedStudentForNote.fullName} ({selectedStudentForNote.studentId})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForNote(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {noteSaved && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>Mentorship feedback dispatched to student file!</span>
                </div>
              )}

              <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Guidance & Recommendations
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={tutorNoteText}
                    onChange={(e) => setTutorNoteText(e.target.value)}
                    placeholder="Provide specific coaching recommendations, project guidance, or commendations..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForNote(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                  >
                    Save to Student Dossier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
