import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CalendarCheck2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Save, 
  Calendar, 
  Search, 
  Sparkles, 
  Users, 
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { TutorSession } from '../../lib/academyStorage';
import { AcademyCourse } from '../../lib/academyCoursesData';

interface TutorAttendanceTabProps {
  session: TutorSession;
  assignedCourses: AcademyCourse[];
}

type AttendanceStatus = 'present' | 'late' | 'absent';

interface AttendanceEntry {
  studentId: string;
  studentName: string;
  email: string;
  status: AttendanceStatus;
  notes?: string;
}

export const TutorAttendanceTab: React.FC<TutorAttendanceTabProps> = ({
  session,
  assignedCourses
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState(assignedCourses[0]?.code || 'DSTA-SWE01');
  const [lectureDate, setLectureDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTopic, setSessionTopic] = useState('Full-Stack Architectural Patterns & API Optimization');
  const [isSaved, setIsSaved] = useState(false);

  const [roster, setRoster] = useState<AttendanceEntry[]>([
    { studentId: 'DSTA-2026-0842', studentName: 'Aisha Bello', email: 'aisha.bello@student.dstech.agency', status: 'present' },
    { studentId: 'DSTA-2026-0915', studentName: 'Ibrahim Danladi', email: 'ibrahim.danladi@student.dstech.agency', status: 'present' },
    { studentId: 'DSTA-2026-1044', studentName: 'Chidinma Eze', email: 'chidinma.eze@student.dstech.agency', status: 'late' },
    { studentId: 'DSTA-2026-1189', studentName: 'Tunde Bakare', email: 'tunde.bakare@student.dstech.agency', status: 'present' },
    { studentId: 'DSTA-2026-1203', studentName: 'Fatima Mohammed', email: 'fatima.mohammed@student.dstech.agency', status: 'absent' },
  ]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRoster(prev => prev.map(item => item.studentId === studentId ? { ...item, status } : item));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setRoster(prev => prev.map(item => ({ ...item, status })));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const presentCount = roster.filter(r => r.status === 'present').length;
  const lateCount = roster.filter(r => r.status === 'late').length;
  const absentCount = roster.filter(r => r.status === 'absent').length;
  const attendanceRate = Math.round(((presentCount + (lateCount * 0.7)) / roster.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Interactive Attendance & Class Register
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log official lecture attendance. Students require ≥80% attendance for graduation examination clearance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleMarkAll('present')}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <CheckCheck size={14} />
          <span>Mark All Present</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span className="font-bold">
            Attendance register for {lectureDate} saved and synced to the DS Tech Academy Registry.
          </span>
        </div>
      )}

      {/* Configuration Strip */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Course Track
          </label>
          <select
            value={selectedCourseCode}
            onChange={(e) => setSelectedCourseCode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          >
            {assignedCourses.map(c => (
              <option key={c.code} value={c.code}>{c.code} - {c.title.substring(0, 28)}...</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Lecture Session Date
          </label>
          <input
            type="date"
            value={lectureDate}
            onChange={(e) => setLectureDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Session Topic
          </label>
          <input
            type="text"
            value={sessionTopic}
            onChange={(e) => setSessionTopic(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Class Rate</span>
          <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 font-display mt-0.5">
            {attendanceRate}%
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-emerald-500">Present</span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
            {presentCount}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-amber-500">Late</span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
            {lateCount}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-rose-500">Absent</span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
            {absentCount}
          </p>
        </div>
      </div>

      {/* Student List Register */}
      <form onSubmit={handleSaveAttendance} className="space-y-4">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {roster.map((student) => (
              <div
                key={student.studentId}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {student.studentName}
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded">
                      {student.studentId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {student.email}
                  </p>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.studentId, 'present')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      student.status === 'present'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.studentId, 'late')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      student.status === 'late'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Clock size={13} />
                    <span>Late</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.studentId, 'absent')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      student.status === 'absent'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <XCircle size={13} />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} />
            <span>Commit & Sync Attendance Register</span>
          </button>
        </div>
      </form>
    </div>
  );
};
