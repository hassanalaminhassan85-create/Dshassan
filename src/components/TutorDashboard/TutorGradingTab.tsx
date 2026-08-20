import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck, 
  Search, 
  ExternalLink, 
  Github, 
  Award, 
  CheckCircle2, 
  Clock, 
  X, 
  Send, 
  BookOpen, 
  AlertCircle, 
  Sparkles, 
  Star,
  MessageSquare
} from 'lucide-react';
import { TutorSession, StudentSubmission, apiGradeSubmission } from '../../lib/academyStorage';
import { AcademyCourse } from '../../lib/academyCoursesData';

interface TutorGradingTabProps {
  session: TutorSession;
  assignedCourses: AcademyCourse[];
  submissions: StudentSubmission[];
  onSubmissionGraded: (updatedSub: StudentSubmission) => void;
}

export const TutorGradingTab: React.FC<TutorGradingTabProps> = ({
  session,
  assignedCourses,
  submissions,
  onSubmissionGraded
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubForGrading, setSelectedSubForGrading] = useState<StudentSubmission | null>(null);

  // Form states for grading modal
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [letterGrade, setLetterGrade] = useState<string>('A');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState(false);

  const filtered = submissions.filter(sub => {
    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'pending' ? (sub.status === 'submitted' || !sub.grade) :
      (sub.status === 'graded' && sub.grade !== undefined);

    const matchesSearch = 
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleOpenGradingModal = (sub: StudentSubmission) => {
    setSelectedSubForGrading(sub);
    setScoreInput(sub.score || 88);
    setLetterGrade((sub.grade as any) || 'A');
    setFeedbackText(sub.feedback || sub.tutorFeedback || 'Excellent implementation! Clean TypeScript type declarations and great adherence to 70/30 practical requirements.');
  };

  const handleScoreChange = (val: number) => {
    setScoreInput(val);
    if (val >= 90) setLetterGrade('A+');
    else if (val >= 80) setLetterGrade('A');
    else if (val >= 70) setLetterGrade('B');
    else if (val >= 60) setLetterGrade('C');
    else setLetterGrade('Resubmit');
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForGrading) return;

    setIsSubmittingGrade(true);
    const updated = await apiGradeSubmission(
      selectedSubForGrading.id,
      letterGrade as any,
      scoreInput,
      feedbackText.trim(),
      session.fullName
    );

    setIsSubmittingGrade(false);
    setGradeSuccess(true);
    if (updated) {
      onSubmissionGraded(updated);
    }

    setTimeout(() => {
      setGradeSuccess(false);
      setSelectedSubForGrading(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Submissions & 70/30 Practical Evaluation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review student code repositories, test functional live deployments, and issue official grades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'pending' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              Pending ({submissions.filter(s => s.status === 'submitted').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('graded')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'graded' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              Graded ({submissions.filter(s => s.status === 'graded').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              All ({submissions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-52">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search submissions..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No student project submissions found matching the criteria.
          </div>
        ) : (
          filtered.map((sub) => (
            <div
              key={sub.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  sub.status === 'graded' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  <FileCheck size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {sub.studentName}
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded">
                      {sub.studentId}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {sub.courseCode}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sub.status === 'graded'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {sub.status === 'graded' ? `GRADED (${sub.grade} - ${sub.score}%)` : 'PENDING EVALUATION'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {sub.assignmentTitle}
                  </h3>

                  {(sub.studentNotes || sub.submissionText) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      <strong className="text-slate-700 dark:text-slate-300 font-medium">Submission Note:</strong> {sub.studentNotes || sub.submissionText}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                    {(sub.gitHubUrl || sub.githubRepoUrl) && (
                      <a
                        href={sub.gitHubUrl || sub.githubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-purple-600 font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Github size={13} />
                        <span>Source Code</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                    {(sub.deploymentUrl || sub.fileUrl) && (
                      <a
                        href={sub.deploymentUrl || sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-semibold bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg"
                      >
                        <span>Live Demo / File</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenGradingModal(sub)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    sub.status === 'graded'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-600 hover:text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                  }`}
                >
                  <Award size={14} />
                  <span>{sub.status === 'graded' ? 'Update Grade' : 'Grade Submission'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Grading Modal */}
      <AnimatePresence>
        {selectedSubForGrading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSubForGrading(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                    FACULTY CODE REVIEW & EVALUATION
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {selectedSubForGrading.assignmentTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Candidate: {selectedSubForGrading.studentName} ({selectedSubForGrading.studentId})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubForGrading(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {gradeSuccess && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span className="font-bold">Official Grade & Tutor feedback published successfully to student portal!</span>
                </div>
              )}

              {/* Student Project Links */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Deliverable Repositories:</span>
                  <div className="flex items-center gap-2">
                    {(selectedSubForGrading.gitHubUrl || selectedSubForGrading.githubRepoUrl) && (
                      <a
                        href={selectedSubForGrading.gitHubUrl || selectedSubForGrading.githubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 dark:text-purple-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <Github size={13} />
                        <span>GitHub</span>
                      </a>
                    )}
                    {(selectedSubForGrading.deploymentUrl || selectedSubForGrading.fileUrl) && (
                      <a
                        href={selectedSubForGrading.deploymentUrl || selectedSubForGrading.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink size={13} />
                        <span>Live Site / Asset</span>
                      </a>
                    )}
                  </div>
                </div>
                {(selectedSubForGrading.studentNotes || selectedSubForGrading.submissionText) && (
                  <p className="text-slate-500 italic text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    "{selectedSubForGrading.studentNotes || selectedSubForGrading.submissionText}"
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmitGrade} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Numerical Score (0 - 100%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={scoreInput}
                      onChange={(e) => handleScoreChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-base text-purple-600 dark:text-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Calculated Letter Grade
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono font-black text-base text-slate-900 dark:text-white">
                      {letterGrade}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tutor Code Review & 70/30 Practical Recommendations
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide constructive feedback on architecture, code quality, test coverage, and presentation..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedSubForGrading(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingGrade}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Award size={14} />
                    <span>{isSubmittingGrade ? 'Publishing...' : 'Commit Grade to Registry'}</span>
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
