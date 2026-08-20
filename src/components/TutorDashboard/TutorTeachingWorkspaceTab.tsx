import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  Code2, 
  BookOpen, 
  Share2, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Github, 
  Upload, 
  Users, 
  MessageSquare, 
  Terminal, 
  Play,
  Layers,
  ChevronRight
} from 'lucide-react';
import { TutorSession } from '../../lib/academyStorage';
import { AcademyCourse } from '../../lib/academyCoursesData';

interface TutorTeachingWorkspaceTabProps {
  session: TutorSession;
  activeCourse: AcademyCourse;
  assignedCourses: AcademyCourse[];
  onSelectCourse: (course: AcademyCourse) => void;
}

export const TutorTeachingWorkspaceTab: React.FC<TutorTeachingWorkspaceTabProps> = ({
  session,
  activeCourse,
  assignedCourses,
  onSelectCourse
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementPosted, setAnnouncementPosted] = useState(false);
  const [liveCode, setLiveCode] = useState(`// DS Tech Academy - Live Faculty Coding Terminal
// Instructor: ${session.fullName}
// Course: ${activeCourse.title}

interface EnterpriseArchitecture {
  tier: 'Frontend' | 'API' | 'Database';
  reliability: number; // SLA 99.99%
  securityPolicy: 'Strict-RBAC';
}

function verifyCohortReadiness(students: number): string {
  console.log(\`[DSTA Hub] Syncing \${students} scholars to live cloud terminal...\`);
  return 'Ready for 70/30 practical lab session!';
}

console.log(verifyCohortReadiness(${session.totalStudents || 35}));
`);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const currentModule = activeCourse.modules[activeModuleIndex] || activeCourse.modules[0];
  const currentTopic = currentModule?.topics[activeTopicIndex] || currentModule?.topics[0] || 'Interactive Hands-On Lab';

  const handleRunCode = () => {
    setTerminalOutput(`[DSTA Cloud Engine] Executing TypeScript bundle...\n[DSTA Hub] Syncing ${session.totalStudents || 35} scholars to live cloud terminal...\nResult: "Ready for 70/30 practical lab session!"\nProcess finished with exit code 0 (Execution: 24ms).`);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setAnnouncementPosted(true);
    setTimeout(() => {
      setAnnouncementPosted(false);
      setAnnouncementText('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Course Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              TEACHING ROOM
            </span>
            <span className="text-xs font-bold text-slate-500">
              {activeCourse.code}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
            {activeCourse.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeCourse.code}
            onChange={(e) => {
              const found = assignedCourses.find(c => c.code === e.target.value);
              if (found) {
                onSelectCourse(found);
                setActiveModuleIndex(0);
                setActiveTopicIndex(0);
              }
            }}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          >
            {assignedCourses.map(c => (
              <option key={c.code} value={c.code}>{c.code} - {c.title.substring(0, 24)}...</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ${
              isStreaming
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
            }`}
          >
            <Video size={15} />
            <span>{isStreaming ? 'End Live Broadcast' : 'Start Live Broadcast'}</span>
          </button>
        </div>
      </div>

      {isStreaming && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold">LIVE ON-AIR: Broadcast streaming to {session.totalStudents || 35} enrolled scholars across Abuja Campus & Virtual Hub.</span>
          </div>
          <span className="font-mono text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">00:14:22</span>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Syllabus Module Outline */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <BookOpen size={16} className="text-purple-500" />
              <span>Course Syllabus & Modules</span>
            </h3>

            <div className="space-y-2">
              {activeCourse.modules.map((mod, mIdx) => {
                const isSelectedModule = activeModuleIndex === mIdx;

                return (
                  <div
                    key={mod.title}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModuleIndex(mIdx);
                        setActiveTopicIndex(0);
                      }}
                      className={`w-full p-3 text-left font-bold text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelectedModule
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                          : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">Module {mIdx + 1}: {mod.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{mod.topics.length} topics</span>
                    </button>

                    {isSelectedModule && (
                      <div className="p-2 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60">
                        {mod.topics.map((top, tIdx) => (
                          <button
                            key={typeof top === 'string' ? top : tIdx}
                            type="button"
                            onClick={() => setActiveTopicIndex(tIdx)}
                            className={`w-full p-2 text-left rounded-xl text-[11px] font-medium transition-all flex items-center justify-between cursor-pointer ${
                              activeTopicIndex === tIdx
                                ? 'bg-purple-600 text-white font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">{typeof top === 'string' ? top : `Topic ${tIdx + 1}`}</span>
                            <ChevronRight size={12} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Broadcast Announcement */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-500" />
              <span>Broadcast Notice to Class</span>
            </h3>

            {announcementPosted && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Notice broadcasted to all {session.totalStudents || 35} student portals!</span>
              </div>
            )}

            <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
              <textarea
                rows={3}
                required
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Share assignment repo URL, lab meeting link, or deadline update..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send size={13} />
                <span>Publish Notice to Cohort</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Code Sandbox & Curriculum Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Topic Detail Header */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Module {activeModuleIndex + 1}</span>
              <span>•</span>
              <span>Topic {activeTopicIndex + 1}</span>
              <span>•</span>
              <span className="text-purple-500 font-bold">70% Practical Standard</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              {typeof currentTopic === 'string' ? currentTopic : 'Interactive Implementation Lab'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Demonstrate hands-on coding paradigms, verify student terminal connections, and lead the practical lab session with 70% live exercises and 30% architectural theory.
            </p>
          </div>

          {/* Interactive Live Faculty Terminal */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl text-xs">
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-purple-400" />
                <span className="font-bold text-white font-mono">live-demo-workspace.ts</span>
              </div>
              <button
                type="button"
                onClick={handleRunCode}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-md"
              >
                <Play size={12} />
                <span>Run TS Terminal</span>
              </button>
            </div>

            <div className="p-4">
              <textarea
                rows={10}
                value={liveCode}
                onChange={(e) => setLiveCode(e.target.value)}
                className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {terminalOutput && (
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Console Output:</span>
                <pre className="whitespace-pre-wrap text-emerald-400">{terminalOutput}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
