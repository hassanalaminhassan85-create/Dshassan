import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Globe,
  Clock,
  BookOpen,
  Copy,
  Printer,
  FileCheck2,
  ShieldCheck,
  Send,
  UserPlus,
  RefreshCw,
  Info
} from 'lucide-react';
import { AcademyCourse } from '../lib/academyCoursesData';
import { apiGetStudentRegistration } from '../lib/studentStorage';
import { 
  apiSaveEnrollment, 
  generateEnrollmentId, 
  savePendingEnrollmentIntent 
} from '../lib/enrollmentStorage';
import { StudentRegistrationApplication, DurationOption, LearningMode, LectureDays, LanguagePreference } from '../types/studentRegistration';
import { AcademyEnrollment } from '../types/enrollment';
import { getAcademyTuition } from '../lib/pricing';

interface AcademyEnrollmentModalProps {
  course: AcademyCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRegistration: (courseId: string) => void;
  onNavigateToDashboard?: () => void;
}

type ModalViewStep = 'form' | 'verifying' | 'unregistered_notice' | 'registered_review' | 'confirmed';

export const AcademyEnrollmentModal: React.FC<AcademyEnrollmentModalProps> = ({
  course,
  isOpen,
  onClose,
  onNavigateToRegistration,
  onNavigateToDashboard
}) => {
  if (!isOpen || !course) return null;

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Abuja Hub (Area 11, Garki)');
  const [duration, setDuration] = useState<DurationOption>('1 Month');
  const [mode, setMode] = useState<LearningMode>('Physical');
  const [lectureDays, setLectureDays] = useState<LectureDays>('Mondays-Wednesdays');
  const [language, setLanguage] = useState<LanguagePreference>('English');
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'whatsapp'>('paystack');

  // Verification & Processing States
  const [currentStep, setCurrentStep] = useState<ModalViewStep>('form');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [verifiedStudent, setVerifiedStudent] = useState<StudentRegistrationApplication | null>(null);
  const [confirmedEnrollment, setConfirmedEnrollment] = useState<AcademyEnrollment | null>(null);
  const [isSubmittingEnrollment, setIsSubmittingEnrollment] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Authoritative dynamic tuition fee calculation based strictly on duration and mode
  const calculatedFee = getAcademyTuition(duration, mode);

  // Reset states when course changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('form');
      setValidationError(null);
      setVerifiedStudent(null);
      setConfirmedEnrollment(null);
    }
  }, [isOpen, course.id]);

  // Step 1: Verification Handler
  const handleVerifyStudentAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setValidationError('Please enter your full legal name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      setValidationError('Please enter a valid phone/WhatsApp contact number.');
      return;
    }

    setCurrentStep('verifying');

    try {
      // Async verification against Student Registry database
      const foundStudent = await apiGetStudentRegistration(cleanEmail);

      if (!foundStudent) {
        // Account not found -> Transition to "Student Account Required" modal
        setCurrentStep('unregistered_notice');
      } else {
        // Account exists! Transition to Review & Confirmation
        setVerifiedStudent(foundStudent);
        // Pre-fill student name if form had a placeholder
        if (!cleanName && foundStudent.fullName) {
          setFullName(foundStudent.fullName);
        }
        setCurrentStep('registered_review');
      }
    } catch (err: any) {
      console.error('Student verification error:', err);
      setValidationError('Verification failed due to a connection issue. Please retry.');
      setCurrentStep('form');
    }
  };

  // Action for Unregistered Visitor -> Proceed to Registration with preserved state
  const handleRedirectToRegistration = () => {
    // Preserve pending enrollment state so visitor doesn't re-type anything
    savePendingEnrollmentIntent({
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      categoryName: course.categoryName,
      price: calculatedFee,
      duration,
      mode,
      lectureDays,
      language,
      location,
      fullName,
      email,
      phone,
      timestamp: new Date().toISOString()
    });

    onClose();
    onNavigateToRegistration(course.id);
  };

  // Action for Final Enrollment Submission for Verified Student
  const handleFinalEnrollmentSubmission = async () => {
    if (!verifiedStudent) return;
    setIsSubmittingEnrollment(true);
    setValidationError(null);

    try {
      const enrollmentRecord: AcademyEnrollment = {
        id: generateEnrollmentId(),
        enrollmentNumber: generateEnrollmentId(),
        studentId: verifiedStudent.id,
        studentEmail: verifiedStudent.emailAddress || email.trim(),
        studentName: verifiedStudent.fullName || fullName.trim(),
        studentPhone: verifiedStudent.phoneNumber || phone.trim(),
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        categoryName: course.categoryName,
        duration,
        mode,
        lectureDays,
        language,
        location,
        amount: calculatedFee,
        paymentMethod,
        paymentStatus: paymentMethod === 'paystack' ? 'pending' : 'pending',
        status: 'enrolled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString()
      };

      // Persist to Firestore & Local Storage
      await apiSaveEnrollment(enrollmentRecord);
      setConfirmedEnrollment(enrollmentRecord);
      setCurrentStep('confirmed');

      // If Paystack is selected, trigger Paystack checkout event
      if (paymentMethod === 'paystack') {
        const payEvent = new CustomEvent('dstech_paystack_pay', {
          detail: {
            serviceId: course.id,
            serviceName: `${course.code} - ${course.title} (Student ID: ${verifiedStudent.id})`,
            amount: calculatedFee,
            category: 'Training Academy Enrollment',
            description: `Official Enrollment: ${course.title} (${duration}, ${mode})`,
            customerName: verifiedStudent.fullName || fullName,
            customerEmail: verifiedStudent.emailAddress || email,
            customerPhone: verifiedStudent.phoneNumber || phone
          }
        });
        window.dispatchEvent(payEvent);
      } else {
        // WhatsApp notification message
        const msg = `*DS TECH ACADEMY - COURSE ENROLLMENT CONFIRMATION*\n\n*Enrollment ID:* ${enrollmentRecord.id}\n*Student ID:* ${verifiedStudent.id}\n*Student Name:* ${verifiedStudent.fullName}\n*Course:* ${course.code} - ${course.title}\n*Faculty:* ${course.categoryName}\n*Duration:* ${duration}\n*Learning Mode:* ${mode}\n*Campus/Location:* ${location}\n*Tuition Amount:* ₦${calculatedFee.toLocaleString()}\n*Language:* ${language}\n\nPlease confirm desk reservation & class commencement schedule.`;
        window.open(`https://wa.me/2349023489111?text=${encodeURIComponent(msg)}`, '_blank');
      }
    } catch (err: any) {
      console.error('Final enrollment error:', err);
      setValidationError('Failed to complete enrollment. Please check your internet connection.');
    } finally {
      setIsSubmittingEnrollment(false);
    }
  };

  const handleCopyEnrollmentId = () => {
    if (confirmedEnrollment) {
      navigator.clipboard.writeText(confirmedEnrollment.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handlePrintEnrollmentSlip = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100 font-sans"
      >
        {/* Top Decorative Accent Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-mono font-extrabold border border-orange-500/30">
                  {course.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                  {course.categoryName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 leading-snug">
                {course.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================================= */}
          {/* STAGE 1: ENROLLMENT FORM & DATA COLLECTION */}
          {/* ========================================================================= */}
          {currentStep === 'form' && (
            <form onSubmit={handleVerifyStudentAccount} className="space-y-5">
              
              {/* Preserved Course Summary Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 block">
                    Preserved Course Selection
                  </span>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {course.code}: {course.title}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Faculty: {course.categoryName} • 70% Practical Build & Lab Work
                  </span>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tuition Fee</span>
                  <span className="text-xl font-black text-orange-600 dark:text-orange-400 font-display">
                    ₦{calculatedFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </motion.div>
              )}

              {/* Personal Details Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-orange-500" />
                  <span>1. Prospective Learner Credentials</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Legal Name * <span className="text-[11px] font-normal text-slate-400">(As printed on certification)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Amina Bello / David Chukwu"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Student Account Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Programme Preferences Section */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span>2. Duration, Mode & Delivery Schedule</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Program Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value as DurationOption)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="1 Month">1 Month (Intensive Fast Track)</option>
                      <option value="3 Months">3 Months (Standard Masterclass)</option>
                      <option value="6 Months">6 Months (Comprehensive Mastery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Training Mode
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as LearningMode)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="Physical">Physical Hub Classroom</option>
                      <option value="Virtual">Virtual Online (Live Zoom Cohort)</option>
                      <option value="Hybrid">Hybrid (Classroom + Online)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Campus / Learning Location
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="Abuja Hub (Area 11, Garki)">Abuja Main Campus (Area 11, Garki)</option>
                      <option value="Adamawa Hub (Numan Center)">Adamawa Regional Center (Numan)</option>
                      <option value="Live Virtual Online Hub">Live Virtual Cloud Hub</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Lecture Days & Schedule
                    </label>
                    <select
                      value={lectureDays}
                      onChange={(e) => setLectureDays(e.target.value as LectureDays)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="Mondays-Wednesdays">Mondays & Wednesdays (Morning Cohort)</option>
                      <option value="Wednesdays-Fridays">Wednesdays & Fridays (Evening Cohort)</option>
                      <option value="Saturdays & Sundays">Saturdays & Sundays (Weekend Executive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Language Preference
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as LanguagePreference)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hausa">Hausa</option>
                    <option value="Yoruba">Yoruba</option>
                    <option value="Igbo">Igbo</option>
                  </select>
                </div>
              </div>

              {/* Payment Channel Selection */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  3. Payment Channel Preference
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'paystack'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentChannel"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-xs font-extrabold block text-slate-900 dark:text-white">Paystack Instant</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Card, Bank Transfer, USSD</span>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'whatsapp'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentChannel"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-extrabold block text-slate-900 dark:text-white">Direct Advisory & Bank</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">WhatsApp Admissions Desk</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button Triggering Student Verification */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <ShieldCheck className="w-4 h-4 text-orange-200 group-hover:scale-110 transition-transform" />
                  <span>Verify Student Account & Submit Enrollment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>All applicants must possess a verified DS Tech Academy Student Account.</span>
                </p>
              </div>

            </form>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: ASYNC VERIFICATION LOADING STATE */}
          {/* ========================================================================= */}
          {currentStep === 'verifying' && (
            <div className="py-12 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                  <ShieldCheck className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Verifying Student Registry...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Querying the DS Tech Academy Registry for <strong className="text-slate-700 dark:text-slate-200">{email}</strong> to validate admissions accreditation.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
                <span>Checking Database Records</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: IF UNREGISTERED -> "STUDENT ACCOUNT REQUIRED" MODAL */}
          {/* ========================================================================= */}
          {currentStep === 'unregistered_notice' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              {/* Alert Badge Icon */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/10">
                <GraduationCap className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider inline-block border border-amber-500/30">
                  Student Account Required
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Please Register as a Student
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  No registered student profile was found for <strong className="text-orange-600 dark:text-orange-400">{email}</strong>. 
                  DS Tech Academy requires all learners to complete the official 10-step Student Registration docket before submitting course enrollments.
                </p>
              </div>

              {/* Preserved Course Summary Panel */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Preserved Enrollment Selection
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Will be Auto-Applied
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md">
                    {course.code}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {course.title}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                  <div>Duration: <strong className="text-slate-800 dark:text-slate-200">{duration}</strong></div>
                  <div>Mode: <strong className="text-slate-800 dark:text-slate-200">{mode}</strong></div>
                </div>

                <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium">
                  ✓ Your chosen course, duration, and personal info will be preserved automatically.
                </p>
              </div>

              {/* Two Clear Actions */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleRedirectToRegistration}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <UserPlus className="w-4 h-4 text-orange-200 group-hover:scale-110 transition-transform" />
                  <span>Register as Student Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('form')}
                  className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancel / Change Email Address</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: IF REGISTERED -> ENROLLMENT REVIEW & CONFIRMATION */}
          {/* ========================================================================= */}
          {currentStep === 'registered_review' && verifiedStudent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              {/* Verified Student Badge Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      Verified Student Account Confirmed
                    </h4>
                    <span className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                      {verifiedStudent.id}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 truncate text-emerald-700 dark:text-emerald-200">
                    Welcome back, <strong>{verifiedStudent.fullName}</strong> ({verifiedStudent.emailAddress})
                  </p>
                </div>
              </div>

              {/* Enrollment Summary Table */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Enrollment Docket Review
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Course Title</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{course.title}</span>
                    <span className="font-mono text-orange-500 text-[11px]">{course.code}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Faculty Track</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{course.categoryName}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration & Mode</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{duration} • {mode}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Campus / Center</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{location}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Lecture Schedule</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{lectureDays}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {paymentMethod === 'paystack' ? 'Paystack (Card/Transfer)' : 'WhatsApp Admissions'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Program Tuition</span>
                  <span className="text-2xl font-black text-orange-600 dark:text-orange-400 font-display">
                    ₦{calculatedFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingEnrollment}
                  onClick={handleFinalEnrollmentSubmission}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEnrollment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Finalizing Enrollment Record...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Confirm & Finalize Enrollment (₦{calculatedFee.toLocaleString()})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('form')}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Edit Schedule or Preferences
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 5: ENROLLMENT CONFIRMED SUCCESS */}
          {/* ========================================================================= */}
          {currentStep === 'confirmed' && confirmedEnrollment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              {/* Confirmed Icon */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider inline-block">
                  Enrollment Confirmed & Linked
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Admission Successfully Registered!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your course seat has been reserved in the DS Tech Academy Academic Ledger.
                </p>
              </div>

              {/* Enrollment Reference Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Official Enrollment Reference Code
                </span>

                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono tracking-wider">
                    {confirmedEnrollment.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEnrollmentId}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Copy Enrollment Reference"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {copiedId && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
                    Copied to clipboard!
                  </span>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                  Linked to Student ID: <strong className="text-slate-700 dark:text-slate-300 font-mono">{confirmedEnrollment.studentId}</strong>
                </div>
              </div>

              {/* Post-Enrollment Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintEnrollmentSlip}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Enrollment Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToDashboard) {
                      onNavigateToDashboard();
                    }
                  }}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Go to Student Portal</span>
                </button>
              </div>

            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
