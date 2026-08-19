import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Building, 
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
  Users,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { ACADEMY_COURSES } from '../../lib/academyCoursesData';
import { 
  InternshipApplication, 
  DeliveryMode, 
  NATIONALITIES, 
  NIGERIAN_STATES 
} from '../../types/academyPathways';
import { 
  generateInternshipId, 
  apiSaveInternshipApplication, 
  apiGetInternshipApplication 
} from '../../lib/pathwayStorage';

interface InternshipFormProps {
  onNavigateHome?: () => void;
  onNavigateCourses?: () => void;
}

const INTERNSHIP_AREAS = [
  'Software & Full-Stack Web Engineering',
  'Artificial Intelligence & Machine Learning',
  'Cybersecurity & SOC Operations',
  'Data Science & Business Analytics',
  'Digital Marketing, SEO & Growth',
  'UI/UX Design & Product Management',
  'Cloud Architecture & DevOps',
  'FinTech & Blockchain Solutions',
  'Healthcare & AgriTech Systems',
  'Multimedia, Video & Creative Content',
  'IT Support & Enterprise Networks'
];

const REFEREE_RELATIONSHIPS = [
  'DSTA Lead Instructor / Faculty Member',
  'Academic Supervisor / Lecturer',
  'Current / Former Employer',
  'Industry Mentor',
  'Professional Colleague',
  'Community Leader',
  'Other'
];

export const InternshipApplicationForm: React.FC<InternshipFormProps> = ({
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
  const [lookupResult, setLookupResult] = useState<InternshipApplication | null>(null);
  const [showLookupModal, setShowLookupModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<InternshipApplication>({
    id: generateInternshipId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'submitted',

    fullName: '',
    phoneCountryCode: '+234',
    phoneNumber: '',
    emailAddress: '',

    programmeCourse: '',
    courseCode: '',
    institution: 'DS Tech Academy',
    programmeCompletionMonth: '2026-06',
    studentIdNumber: '',

    preferredInternshipArea: INTERNSHIP_AREAS[0],
    preferredInternshipOrganization: '',
    preferredDuration: '3 Months',
    preferredMode: 'Hybrid',

    referee: {
      fullName: '',
      relationship: REFEREE_RELATIONSHIPS[0],
      phoneWhatsapp: '',
      nationality: 'Nigeria',
      stateOfOrigin: 'Kano',
      residentialAddress: ''
    },

    studentDeclarationName: '',
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
      programmeCourse: course.title,
      courseCode: course.code
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
    ctx.strokeStyle = '#3b82f6';
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
    if (!formData.phoneNumber.trim()) {
      setValidationError('Please enter your phone/WhatsApp contact.');
      return;
    }
    if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
      setValidationError('Please provide a valid email address.');
      return;
    }
    if (!formData.programmeCourse.trim() || !formData.courseCode.trim()) {
      setValidationError('Please select the completed DSTA programme course.');
      return;
    }
    if (!formData.studentIdNumber.trim()) {
      setValidationError('Please provide your DSTA Student ID Number.');
      return;
    }
    if (!formData.referee.fullName.trim() || !formData.referee.phoneWhatsapp.trim()) {
      setValidationError('Please complete the referee contact details.');
      return;
    }
    if (!formData.agreedToTerms) {
      setValidationError('Please confirm the mandatory internship commitment declaration.');
      return;
    }
    if (!formData.signatureData.trim()) {
      setValidationError('Please provide your signature.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiSaveInternshipApplication(formData);
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setValidationError('Failed to submit internship application. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setIsLookingUp(true);
    const result = await apiGetInternshipApplication(lookupId.trim());
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career Acceleration & Industry Placement</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            DS Tech Academy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">Graduate Internship Application</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Connect directly with our 85+ corporate hiring partners, fintech startups, and enterprise tech teams for hands-on, high-impact industrial placements.
          </p>

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowLookupModal(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Existing Placement Status</span>
            </button>
          </div>
        </div>

        {/* Eligibility Criteria Banner (From PDF 1) */}
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 border border-blue-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Internship Placement Eligibility (PDF 1)</h3>
              <p className="text-xs text-slate-400">Mandatory prerequisites before industrial placement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { title: 'Curriculum Completion', desc: 'Successfully completed the academic coursework & final capstone project.' },
              { title: 'Academic Clearance', desc: 'No outstanding assessments, tests, or academic requirements.' },
              { title: 'Financial Clearance', desc: 'Zero balance on tuition or other approved Academy fees.' }
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
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
              <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Internship Application Submitted!</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Your placement request has been logged with the DS Tech Academy Career Services & Placement Directorate.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Internship Tracking ID
                </span>
                <div className="text-2xl font-extrabold font-mono text-blue-400 tracking-wider mt-0.5">
                  {formData.id}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-blue-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Placement Roadmap */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Placement Matching Roadmap:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { step: '1', title: 'Audit', desc: 'Graduation transcripts and fee audit' },
                  { step: '2', title: 'Match', desc: 'Profile matched to partner companies' },
                  { step: '3', title: 'Interview', desc: 'Virtual technical interview with host firm' },
                  { step: '4', title: 'Placement', desc: 'Formal Internship Letter & induction' }
                ].map((s) => (
                  <div key={s.step} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center">
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
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Print Internship Docket</span>
              </button>
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Student Profile & Contact */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  <span>Student Profile & Contacts</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Legal Name <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="e.g. Ibrahim Sani Bello"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Phone / WhatsApp <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="8012345678"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.emailAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                    placeholder="student@example.com"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Academic Completion & Course Details */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span>DSTA Academic Record & Completed Course</span>
                </h3>
              </div>

              {/* Course Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Completed Programme / Course <span className="text-blue-400">*</span>
                </label>

                {formData.programmeCourse ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                          {formData.courseCode}
                        </span>
                        <span className="text-xs text-slate-400">DS Tech Academy Alum</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">{formData.programmeCourse}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCoursePicker(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                    >
                      Change Course
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCoursePicker(true)}
                    className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>Click to Select Completed Course from Catalog</span>
                  </button>
                )}

                {showCoursePicker && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-3 mt-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search 115 courses by title or code..."
                        className="w-full px-4 py-2.5 pl-10 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                      {filteredCourses.map(course => (
                        <div
                          key={course.id}
                          onClick={() => handleSelectCourse(course)}
                          className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-blue-400">{course.code}</span>
                              <span className="text-xs font-bold text-white">{course.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{course.categoryName}</span>
                          </div>
                          <span className="text-[10px] text-blue-400 font-bold">Select</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Institution
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.institution}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Programme Completion Month <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.programmeCompletionMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, programmeCompletionMonth: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Student ID Number <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentIdNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentIdNumber: e.target.value }))}
                    placeholder="e.g. DSTA/2026/0492"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white font-mono placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Internship Preferences */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span>Placement Preferences</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Preferred Internship Area
                  </label>
                  <select
                    value={formData.preferredInternshipArea}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredInternshipArea: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white"
                  >
                    {INTERNSHIP_AREAS.map(area => (
                      <option key={area} value={area} className="bg-slate-900">{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Target / Preferred Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.preferredInternshipOrganization}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredInternshipOrganization: e.target.value }))}
                    placeholder="e.g. Tech Corp / Fintech Bank / Studio"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Preferred Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['1 Month', '3 Months', '6 Months'] as const).map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, preferredDuration: dur }))}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          formData.preferredDuration === dur
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
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
                    Preferred Delivery Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Physical', 'Hybrid', 'Virtual'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, preferredMode: m }))}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          formData.preferredMode === m
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Referee Details (Mandatory) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Referee Information (Required)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Referee Full Name <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referee.fullName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      referee: { ...prev.referee, fullName: e.target.value }
                    }))}
                    placeholder="e.g. Dr. Aliyu Garba"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Relationship
                  </label>
                  <select
                    value={formData.referee.relationship}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      referee: { ...prev.referee, relationship: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white"
                  >
                    {REFEREE_RELATIONSHIPS.map(rel => (
                      <option key={rel} value={rel} className="bg-slate-900">{rel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Referee Phone / WhatsApp <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.referee.phoneWhatsapp}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      referee: { ...prev.referee, phoneWhatsapp: e.target.value }
                    }))}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Referee Nationality & State
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={formData.referee.nationality}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        referee: { ...prev.referee, nationality: e.target.value }
                      }))}
                      className="px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      {NATIONALITIES.map(n => <option key={n} value={n} className="bg-slate-900">{n}</option>)}
                    </select>
                    <select
                      value={formData.referee.stateOfOrigin}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        referee: { ...prev.referee, stateOfOrigin: e.target.value }
                      }))}
                      className="px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      {NIGERIAN_STATES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Referee Residential / Office Address
                  </label>
                  <textarea
                    rows={2}
                    value={formData.referee.residentialAddress}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      referee: { ...prev.referee, residentialAddress: e.target.value }
                    }))}
                    placeholder="Physical or office address of referee..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Declaration & Signature */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span>Student Declaration & Placement Undertaking</span>
                </h3>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic bg-slate-950 p-4 rounded-2xl border border-slate-800 font-serif leading-relaxed">
                "I confirm that I have completed the required programme requirements and will comply with the rules, policies, and responsibilities of my assigned internship placement."
              </blockquote>

              <label 
                onClick={() => setFormData(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }))}
                className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all"
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border shrink-0 ${
                  formData.agreedToTerms ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-700 bg-slate-900'
                }`}>
                  {formData.agreedToTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs text-slate-200">
                  I accept and confirm the internship declaration statement above.
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Student Full Name <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentDeclarationName || formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentDeclarationName: e.target.value }))}
                    placeholder="Full legal signature name"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white"
                  />
                </div>

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
                    Student Signature <span className="text-blue-400">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('type')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        signatureMode === 'type' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5 inline mr-1" /> Type
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureMode('draw')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        signatureMode === 'draw' ? 'bg-blue-600 text-white' : 'text-slate-400'
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
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-serif italic text-blue-400 focus:outline-none focus:border-blue-500"
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
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
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
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Internship Docket...</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    <span>Submit Internship Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Lookup Modal */}
        {showLookupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <span>Check Internship Status</span>
                </h4>
                <button type="button" onClick={() => setShowLookupModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="e.g. DSTA-INT/2026/123456"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={isLookingUp}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  {isLookingUp ? 'Searching...' : 'Track'}
                </button>
              </div>

              {lookupResult ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-blue-400 font-bold">{lookupResult.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold uppercase text-[9px]">
                      {lookupResult.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-white font-bold">{lookupResult.fullName}</div>
                  <div className="text-slate-400">{lookupResult.programmeCourse} • {lookupResult.preferredInternshipArea}</div>
                  <div className="text-[10px] text-slate-500">Target Duration: {lookupResult.preferredDuration}</div>
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
