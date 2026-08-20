import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck2, 
  BookOpen, 
  Calendar, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Plus, 
  X, 
  Sparkles, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';
import { AcademyEnrollment } from '../../types/enrollment';
import { AcademyCourse, ACADEMY_COURSES } from '../../lib/academyCoursesData';
import { StudentSession } from '../../lib/academyStorage';
import { generateEnrollmentId, apiSaveEnrollment } from '../../lib/enrollmentStorage';

interface StudentEnrollmentsTabProps {
  session: StudentSession;
  enrollments: AcademyEnrollment[];
  onEnrollmentAdded: (enrollment: AcademyEnrollment) => void;
  onProceedToPay: (enrollment: AcademyEnrollment) => void;
}

export const StudentEnrollmentsTab: React.FC<StudentEnrollmentsTabProps> = ({
  session,
  enrollments,
  onEnrollmentAdded,
  onProceedToPay
}) => {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<'1 Month' | '3 Months' | '6 Months'>('3 Months');
  const [selectedMode, setSelectedMode] = useState<'Physical' | 'Virtual' | 'Hybrid'>('Hybrid');
  const [selectedDays, setSelectedDays] = useState<'Mondays-Wednesdays' | 'Wednesdays-Fridays' | 'Saturdays & Sundays'>('Mondays-Wednesdays');
  const [selectedLocation, setSelectedLocation] = useState<'Abuja Campus' | 'Adamawa Tech Hub' | 'Virtual Classroom'>('Abuja Campus');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter 115+ catalog for modal
  const filteredCatalog = ACADEMY_COURSES.filter(c => 
    c.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    c.industry.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  // Tuition Calculation
  const calculateTuition = (baseCourse: AcademyCourse | null) => {
    if (!baseCourse) return 75000;
    const base = baseCourse.price || 75000;
    if (selectedDuration === '1 Month') return Math.round(base * 0.6);
    if (selectedDuration === '6 Months') return Math.round(base * 1.5);
    return base;
  };

  const currentTuition = calculateTuition(selectedCourse);

  // Handle New Enrollment submission
  const handleCreateEnrollment = async () => {
    if (!selectedCourse) return;

    setIsSubmitting(true);
    const newEnrollment: AcademyEnrollment = {
      id: generateEnrollmentId(),
      enrollmentNumber: `ENR-${Date.now().toString().slice(-6)}`,
      studentId: session.studentId,
      studentEmail: session.email,
      studentName: session.fullName,
      studentPhone: session.phone,
      courseId: selectedCourse.id,
      courseCode: selectedCourse.code,
      courseTitle: selectedCourse.title,
      categoryName: selectedCourse.industry,
      duration: selectedDuration,
      mode: selectedMode,
      lectureDays: selectedDays,
      language: 'English',
      location: selectedLocation,
      amount: currentTuition,
      paymentMethod: 'paystack',
      paymentStatus: 'pending',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await apiSaveEnrollment(newEnrollment);
    onEnrollmentAdded(newEnrollment);
    setIsSubmitting(false);
    setIsEnrollModalOpen(false);
    setSelectedCourse(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Official Course Enrollments & Admissions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered admission dockets, class schedules, and tuition clearance status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEnrollModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Enroll in New Program</span>
        </button>
      </div>

      {/* Enrollments Table / Card Grid */}
      <div className="space-y-4">
        {enrollments.map((enr) => {
          const isPaid = enr.paymentStatus === 'paid' || enr.paymentStatus === 'verified';

          return (
            <div
              key={enr.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20">
                  <FileCheck2 size={24} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {enr.courseCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Ref: {enr.id}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {enr.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {enr.courseTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      {enr.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {enr.location || enr.mode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      {enr.lectureDays || 'Flexible Days'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Tuition: ₦{enr.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & CTA */}
              <div className="flex items-center justify-between lg:justify-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                    Payment Status
                  </span>
                  {isPaid ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Paid & Verified
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-500">
                      Tuition Pending
                    </span>
                  )}
                </div>

                {!isPaid ? (
                  <button
                    type="button"
                    onClick={() => onProceedToPay(enr)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard size={14} />
                    <span>Proceed to Pay</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    Cleared
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                      Enroll in Additional Academy Program
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select from our 115+ specialized technical diplomas & certifications.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Step 1: Select Course from Catalog */}
              <div className="py-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Search Course Catalog (115+ Courses)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={14} />
                    </div>
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search Software, AI, Cybersecurity, Cloud, Media..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Course Options Selection */}
                <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar p-1">
                  {filteredCatalog.slice(0, 10).map((c) => {
                    const isSelected = selectedCourse?.code === c.code;

                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setSelectedCourse(c)}
                        className={`w-full p-3 rounded-2xl text-left transition-all border text-xs flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 font-bold'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase">
                            {c.code} • {c.industry}
                          </span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                            {c.title}
                          </p>
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          ₦{(c.price || 75000).toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Configuration Options */}
                {selectedCourse && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Program Duration
                        </label>
                        <select
                          value={selectedDuration}
                          onChange={(e) => setSelectedDuration(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="1 Month">1 Month Fast-Track</option>
                          <option value="3 Months">3 Months Standard</option>
                          <option value="6 Months">6 Months Comprehensive Diploma</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Training Mode
                        </label>
                        <select
                          value={selectedMode}
                          onChange={(e) => setSelectedMode(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="Hybrid">Hybrid (Hub + Virtual)</option>
                          <option value="Physical">Physical Hub Classroom</option>
                          <option value="Virtual">100% Virtual Remote</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 font-medium">Calculated Tuition Fee:</span>
                      <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-display">
                        ₦{currentTuition.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedCourse || isSubmitting}
                  onClick={handleCreateEnrollment}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Enrollment Docket...' : 'Confirm Enrollment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
