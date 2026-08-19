import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  User, 
  Search, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Printer, 
  Copy, 
  Home, 
  AlertCircle, 
  Loader2, 
  PenTool, 
  Type, 
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Clock,
  Briefcase,
  GraduationCap,
  Target
} from 'lucide-react';
import { ACADEMY_COURSES } from '../../lib/academyCoursesData';
import { 
  MentorshipApplication, 
  AcademicQualification, 
  DeliveryMode 
} from '../../types/academyPathways';
import { 
  generateMentorshipId, 
  apiSaveMentorshipApplication, 
  apiGetMentorshipApplication 
} from '../../lib/pathwayStorage';

interface MentorshipFormProps {
  onNavigateHome?: () => void;
  onNavigateCourses?: () => void;
}

const QUALIFICATIONS: AcademicQualification[] = [
  'High School / SSCE',
  'ND / OND / HND',
  'Diploma',
  'B.Sc / B.A / B.Tech',
  'M.Sc / MBA',
  'PhD',
  'Professional Certification',
  'Other'
];

export const MentorshipApplicationForm: React.FC<MentorshipFormProps> = ({
  onNavigateHome,
  onNavigateCourses
}) => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'type' | 'draw'>('type');
  const [isDrawing, setIsDrawing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Status lookup
  const [lookupId, setLookupId] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<MentorshipApplication | null>(null);
  const [showLookupModal, setShowLookupModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<MentorshipApplication>({
    id: generateMentorshipId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'submitted',

    fullName: '',
    phoneCountryCode: '+234',
    phoneWhatsapp: '',
    emailAddress: '',
    currentOccupation: '',
    highestAcademicQualification: 'B.Sc / B.A / B.Tech',

    mentorshipArea: '',
    selectedCourseCode: '',
    specificGoalChallenge: '',
    proposedEstimatedBudget: '',
    preferredMode: 'Virtual',
    preferredDuration: '3 Months',
    preferredDaysTime: 'Weekends (Saturdays 4PM - 6PM WAT)',
    relevantExperience: '',

    signatureData: '',
    declarationDate: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    agreedToTerms: false
  });

  const filteredCourses = useMemo(() => {
    let list = ACADEMY_COURSES;
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.categoryName.toLowerCase().includes(q));
    }
    return list;
  }, [courseSearch]);

  const handleSelectCourse = (course: typeof ACADEMY_COURSES[0]) => {
    setFormData(prev => ({
      ...prev,
      mentorshipArea: course.title,
      selectedCourseCode: course.code
    }));
    setShowCoursePicker(false);
    setCourseSearch('');
  };

  // Drawing Canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setFormData(prev => ({ ...prev, signatureData: canvas.toDataURL() }));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFormData(prev => ({ ...prev, signatureData: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.fullName.trim()) {
      setValidationError('Please provide your full name.');
      return;
    }
    if (!formData.phoneWhatsapp.trim()) {
      setValidationError('Please provide your phone / WhatsApp contact.');
      return;
    }
    if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!formData.mentorshipArea.trim()) {
      setValidationError('Please specify the mentorship technical or leadership area.');
      return;
    }
    if (!formData.specificGoalChallenge.trim()) {
      setValidationError('Please outline your specific goals or challenges for this mentorship.');
      return;
    }
    if (!formData.agreedToTerms) {
      setValidationError('Please confirm the mentorship agreement declaration.');
      return;
    }
    if (!formData.signatureData.trim()) {
      setValidationError('Please provide your signature.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiSaveMentorshipApplication(formData);
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setValidationError('Failed to submit mentorship application. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setIsLookingUp(true);
    const result = await apiGetMentorshipApplication(lookupId.trim());
    setLookupResult(result);
    setIsLookingUp(false);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(formData.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" />
            <span>1-on-1 Elite Executive & Technical Advisory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            DS Tech Academy <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-400">Professional Mentorship Form</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Get matched with senior CTOs, Principal AI Researchers, Cybersecurity Directors, and Growth Leaders for bespoke 1-on-1 career scaling.
          </p>

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowLookupModal(true)}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Mentorship Booking Status</span>
            </button>
          </div>
        </div>

        {/* Mentorship Structure Highlights */}
        <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">What You Get in 1-on-1 Mentorship</h3>
              <p className="text-xs text-slate-400">Dedicated guidance engineered around your immediate career bottlenecks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { title: 'Personalized Roadmap', desc: 'Custom diagnostic review of your codebase, portfolio, and career goals.' },
              { title: 'Bi-Weekly Strategy Calls', desc: 'Direct 1-on-1 video advisory with your assigned Principal Mentor.' },
              { title: 'Code & Project Audits', desc: 'Deep architectural reviews and mock executive technical interviews.' }
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Error Alert */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-3 shadow-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Screen */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Mentorship Request Received!</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Your mentorship application has been routed to our Executive Mentor Matchmaking Committee.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Mentorship Reference Tracking ID
                </span>
                <div className="text-2xl font-extrabold font-mono text-purple-400 tracking-wider mt-0.5">
                  {formData.id}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-purple-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Next Steps */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Mentorship Match & Launch Workflow:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { step: '1', title: 'Mentor Match', desc: 'Review of technical background and mentor assignment' },
                  { step: '2', title: 'Discovery Call', desc: '15-minute alignment call with prospective mentor' },
                  { step: '3', title: 'Roadmap & Schedule', desc: 'Custom curriculum milestones and calendar booking' },
                  { step: '4', title: '1-on-1 Sessions', desc: 'Kickoff of weekly advisory & project audits' }
                ].map((s) => (
                  <div key={s.step} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-[10px] font-bold flex items-center justify-center">
                      {s.step}
                    </div>
                    <div className="text-xs font-bold text-white">{s.title}</div>
                    <p className="text-[10px] text-slate-400">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-purple-400" />
                <span>Print Application Summary</span>
              </button>
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main Application Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Mentee Profile */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  <span>Applicant & Professional Background</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Legal Name <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="e.g. Zainab Umar Farouk"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Phone / WhatsApp <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneWhatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneWhatsapp: e.target.value }))}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.emailAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                    placeholder="zainab@example.com"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Current Occupation / Professional Role
                  </label>
                  <input
                    type="text"
                    value={formData.currentOccupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentOccupation: e.target.value }))}
                    placeholder="e.g. Junior Backend Dev / Product Designer / Medical Doctor"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Highest Academic Qualification
                  </label>
                  <select
                    value={formData.highestAcademicQualification}
                    onChange={(e) => setFormData(prev => ({ ...prev, highestAcademicQualification: e.target.value as AcademicQualification }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white"
                  >
                    {QUALIFICATIONS.map(q => (
                      <option key={q} value={q} className="bg-slate-900">{q}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Mentorship Area & Technical Goals */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Mentorship Focus & Learning Milestones</span>
                </h3>
              </div>

              {/* Mentorship Area Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Target Mentorship Area / Technical Domain <span className="text-purple-400">*</span>
                </label>

                {formData.mentorshipArea ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {formData.selectedCourseCode && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 font-mono text-xs font-bold">
                            {formData.selectedCourseCode}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">Mentorship Syllabus Reference</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">{formData.mentorshipArea}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCoursePicker(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                    >
                      Change Area
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={formData.mentorshipArea}
                      onChange={(e) => setFormData(prev => ({ ...prev, mentorshipArea: e.target.value, selectedCourseCode: '' }))}
                      placeholder="Type mentorship focus (e.g. AI Large Language Model Fine-tuning, Cloud DevOps Architecture) or browse below..."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCoursePicker(true)}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-purple-500/50 bg-slate-950 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      <span>Or Select from 115+ Specialized Catalog Courses</span>
                    </button>
                  </div>
                )}

                {showCoursePicker && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-3 mt-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search 115 courses by title or code..."
                        className="w-full px-4 py-2.5 pl-10 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                      {filteredCourses.map(course => (
                        <div
                          key={course.id}
                          onClick={() => handleSelectCourse(course)}
                          className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-purple-400">{course.code}</span>
                              <span className="text-xs font-bold text-white">{course.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{course.categoryName}</span>
                          </div>
                          <span className="text-[10px] text-purple-400 font-bold">Select</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Specific Goal or Challenge You Want to Conquer <span className="text-purple-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.specificGoalChallenge}
                  onChange={(e) => setFormData(prev => ({ ...prev, specificGoalChallenge: e.target.value }))}
                  placeholder="Detail the exact technical skill, portfolio blocker, startup architecture, or career promotion hurdle you need help with..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Relevant Past Experience & Current Knowledge Level
                </label>
                <textarea
                  rows={2}
                  value={formData.relevantExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, relevantExperience: e.target.value }))}
                  placeholder="Tell us what you have already learned or built, tools you use, github links, etc..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Logistics, Duration & Budget */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span>Mentorship Logistics & Preferences</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Mentorship Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['1 Month', '3 Months', '6 Months'] as const).map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, preferredDuration: dur }))}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          formData.preferredDuration === dur
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Advisory Delivery Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Virtual', 'Physical', 'Hybrid'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, preferredMode: m }))}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          formData.preferredMode === m
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Proposed Budget (₦ Naira)
                  </label>
                  <input
                    type="text"
                    value={formData.proposedEstimatedBudget}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposedEstimatedBudget: e.target.value }))}
                    placeholder="e.g. ₦150,000 / month"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Preferred Weekly Advisory Days & Time
                </label>
                <input
                  type="text"
                  value={formData.preferredDaysTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredDaysTime: e.target.value }))}
                  placeholder="e.g. Saturdays 4:00 PM - 6:00 PM / Weekday Evenings after 7 PM"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Declaration & Signature */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span>Mentorship Commitment Affirmation</span>
                </h3>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic bg-slate-950 p-4 rounded-2xl border border-slate-800 font-serif leading-relaxed">
                "I affirm my commitment to the mentorship schedule, agreed tasks, professional integrity, and dedicated attendance for all 1-on-1 advisory sessions."
              </blockquote>

              <label 
                onClick={() => setFormData(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }))}
                className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all"
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border shrink-0 ${
                  formData.agreedToTerms ? 'bg-purple-600 border-purple-400 text-white' : 'border-slate-700 bg-slate-900'
                }`}>
                  {formData.agreedToTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs text-slate-200">
                  I accept and confirm the mentorship commitment declaration.
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Date of Application
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.declarationDate}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Signature Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Mentee Signature <span className="text-purple-400">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('type')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        signatureMode === 'type' ? 'bg-purple-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5 inline mr-1" /> Type
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureMode('draw')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        signatureMode === 'draw' ? 'bg-purple-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5 inline mr-1" /> Draw
                    </button>
                  </div>
                </div>

                {signatureMode === 'type' ? (
                  <input
                    type="text"
                    value={formData.signatureData.startsWith('data:') ? '' : formData.signatureData}
                    onChange={(e) => setFormData(prev => ({ ...prev, signatureData: e.target.value }))}
                    placeholder="Type your signature here..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-serif italic text-purple-400 focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-700 space-y-2">
                    <div className="w-full h-28 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden cursor-crosshair">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear Signature
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Mentorship Request...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Submit Mentorship Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Status Lookup Modal */}
        {showLookupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-400" />
                  <span>Check Mentorship Booking Status</span>
                </h4>
                <button type="button" onClick={() => setShowLookupModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="e.g. DSTA-MENTOR/2026/123456"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={isLookingUp}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  {isLookingUp ? 'Searching...' : 'Track'}
                </button>
              </div>

              {lookupResult ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-400 font-bold">{lookupResult.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase text-[9px]">
                      {lookupResult.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-white font-bold">{lookupResult.fullName}</div>
                  <div className="text-slate-400">{lookupResult.mentorshipArea}</div>
                  <div className="text-[10px] text-slate-500">Duration: {lookupResult.preferredDuration} ({lookupResult.preferredMode})</div>
                </div>
              ) : lookupId && !isLookingUp && (
                <p className="text-xs text-slate-400 text-center">No record found with ID: {lookupId}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
