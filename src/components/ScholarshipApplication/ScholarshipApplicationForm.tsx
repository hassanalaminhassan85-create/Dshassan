import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  GraduationCap, 
  User, 
  UploadCloud, 
  Camera, 
  Trash2, 
  Search, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
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
  HeartHandshake,
  CheckCircle
} from 'lucide-react';
import { ACADEMY_COURSES } from '../../lib/academyCoursesData';
import { 
  ScholarshipApplication, 
  AcademicQualification, 
  GovernmentIdType, 
  MaritalStatus, 
  NATIONALITIES, 
  NIGERIAN_STATES 
} from '../../types/academyPathways';
import { 
  generateScholarshipId, 
  apiSaveScholarshipApplication, 
  apiGetScholarshipApplication 
} from '../../lib/pathwayStorage';

interface ScholarshipFormProps {
  onNavigateHome?: () => void;
  onNavigateCourses?: () => void;
}

const MARITAL_STATUSES: MaritalStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];
const ID_TYPES: GovernmentIdType[] = ['NIN', 'Birth Cert', "Voter's ID", "Driver's License", 'Passport', 'Other'];
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

export const ScholarshipApplicationForm: React.FC<ScholarshipFormProps> = ({
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

  // Returning applicant lookup
  const [lookupId, setLookupId] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<ScholarshipApplication | null>(null);
  const [showLookupModal, setShowLookupModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<ScholarshipApplication>({
    id: generateScholarshipId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'submitted',

    passportPhoto: undefined,
    fullName: '',
    nationality: 'Nigeria',
    stateOfOrigin: 'Kano',
    tribe: '',
    maritalStatus: 'Single',
    dateOfBirth: '',
    idType: 'NIN',
    idNumber: '',
    phoneCountryCode: '+234',
    phoneNumber: '',
    emailAddress: '',

    programmeAppliedFor: '',
    courseCode: '',
    courseCategory: '',
    highestAcademicQualification: 'B.Sc / B.A / B.Tech',

    reasonForScholarship: '',
    relevantAchievementsSkills: '',
    currentOccupation: '',

    declarationApplicantName: '',
    signatureData: '',
    declarationDate: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    agreedToTerms: false
  });

  // Filter 6-Month eligible courses
  const eligibleCourses = useMemo(() => {
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
      programmeAppliedFor: course.title,
      courseCode: course.code,
      courseCategory: course.categoryName
    }));
    setShowCoursePicker(false);
    setCourseSearch('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Passport photo exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, passportPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
    ctx.strokeStyle = '#10b981';
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

    // Form Validations
    if (!formData.fullName.trim()) {
      setValidationError('Please provide your full legal name.');
      return;
    }
    if (!formData.dateOfBirth) {
      setValidationError('Please select your date of birth.');
      return;
    }
    if (!formData.idNumber.trim()) {
      setValidationError('Please enter your national ID / document number.');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setValidationError('Please provide your active phone / WhatsApp number.');
      return;
    }
    if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!formData.programmeAppliedFor.trim() || !formData.courseCode.trim()) {
      setValidationError('Please select the 6-month programme course you are applying to.');
      return;
    }
    if (!formData.reasonForScholarship.trim()) {
      setValidationError('Please describe your motivation and financial justification for the scholarship.');
      return;
    }
    if (!formData.agreedToTerms) {
      setValidationError('Please confirm the mandatory scholarship declaration statement.');
      return;
    }
    if (!formData.signatureData.trim()) {
      setValidationError('Please provide your signature.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiSaveScholarshipApplication(formData);
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setValidationError('Failed to submit scholarship application. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setIsLookingUp(true);
    const result = await apiGetScholarshipApplication(lookupId.trim());
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" />
            <span>CSR & Talent Development Initiative</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            DS Tech Academy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Scholarship Application</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Providing tuition-free and subsidized tech education for exceptional talent, underserved youth, and high-potential innovators across Africa.
          </p>

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowLookupModal(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Already applied? Check Scholarship Status</span>
            </button>
          </div>
        </div>

        {/* Eligibility Criteria Banner (From PDF 1) */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Scholarship Eligibility Criteria (PDF 1)</h3>
              <p className="text-xs text-slate-400">Please review before completing your application</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[
              { title: '6-Month Courses Only', desc: 'Scholarships apply exclusively to deep-dive 6-Month diploma programmes.' },
              { title: 'General Admission', desc: 'Must meet standard DSTA academic prerequisite requirements.' },
              { title: 'Demonstrated Need', desc: 'Demonstrate genuine financial need or socio-economic barrier.' },
              { title: 'Talent & Leadership', desc: 'Demonstrate academic potential, discipline, and community leadership.' }
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
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
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Scholarship Application Submitted!</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Your application has been received by the DS Tech Academy Scholarship Committee.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Scholarship Application Tracking ID
                </span>
                <div className="text-2xl font-extrabold font-mono text-emerald-400 tracking-wider mt-0.5">
                  {formData.id}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Next Steps (From PDF 1) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Official Scholarship Evaluation Workflow:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { step: '1', title: 'Review', desc: 'Verification of academic credentials & statement' },
                  { step: '2', title: 'Decision', desc: 'Committee scoring based on merit & financial need' },
                  { step: '3', title: 'Offer', desc: 'Formal Scholarship Award Letter dispatched' },
                  { step: '4', title: 'Acceptance', desc: 'Candidate countersigns and accepts cohort slot' }
                ].map((s) => (
                  <div key={s.step} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center">
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
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Application Slip</span>
              </button>
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main Application Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Details & Passport Upload */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  <span>Applicant Personal Information</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Passport Upload */}
                <div className="md:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-5 text-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                    Passport Photo
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-40 mx-auto rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/80 transition-all flex flex-col items-center justify-center p-2 cursor-pointer group relative overflow-hidden"
                  >
                    {formData.passportPhoto ? (
                      <>
                        <img src={formData.passportPhoto} alt="Passport preview" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white bg-slate-800/80 px-2 py-1 rounded-md">Change</span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1.5 text-center">
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 mx-auto transition-colors" />
                        <span className="text-[10px] font-semibold text-slate-300 block">Upload Photo</span>
                        <span className="text-[8px] text-slate-500 block">Max 5MB</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  {formData.passportPhoto && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, passportPhoto: undefined }))}
                      className="mt-2 text-[10px] text-red-400 hover:text-red-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Name, Nationality, State, Tribe */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Legal Name <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="e.g. Fatima Abubakar Musa"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Nationality
                      </label>
                      <select
                        value={formData.nationality}
                        onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                        className="w-full px-3 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white"
                      >
                        {NATIONALITIES.map(n => <option key={n} value={n} className="bg-slate-900">{n}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        State of Origin
                      </label>
                      <select
                        value={formData.stateOfOrigin}
                        onChange={(e) => setFormData(prev => ({ ...prev, stateOfOrigin: e.target.value }))}
                        className="w-full px-3 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white"
                      >
                        {NIGERIAN_STATES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Tribe / Ethnicity
                      </label>
                      <input
                        type="text"
                        value={formData.tribe}
                        onChange={(e) => setFormData(prev => ({ ...prev, tribe: e.target.value }))}
                        placeholder="e.g. Hausa / Yoruba"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Date of Birth <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Marital Status
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {MARITAL_STATUSES.map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, maritalStatus: st }))}
                            className={`py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                              formData.maritalStatus === st
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID & Contact Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Identification Document Type & Number <span className="text-emerald-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.idType}
                      onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value as GovernmentIdType }))}
                      className="w-32 px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      {ID_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                    </select>
                    <input
                      type="text"
                      required
                      value={formData.idNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                      placeholder="e.g. 11-digit NIN or document #"
                      className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Phone / WhatsApp <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="8012345678"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email Address <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.emailAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                      placeholder="applicant@example.com"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic & 6-Month Programme Course Selection */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  <span>Target 6-Month Programme & Academic Background</span>
                </h3>
              </div>

              {/* Course Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Target Course Programme (6-Month Eligible Courses Only) <span className="text-emerald-400">*</span>
                </label>

                {formData.programmeAppliedFor ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                          {formData.courseCode}
                        </span>
                        <span className="text-xs text-slate-400">{formData.courseCategory}</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">{formData.programmeAppliedFor}</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Duration: 6 Months Diploma Track</div>
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
                    className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/60 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Click to Select from 115+ Academic Catalog Courses</span>
                  </button>
                )}

                {/* Course Selection Modal */}
                {showCoursePicker && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-3 mt-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search 115 courses by title or code (e.g. DSTA-AI101)..."
                        className="w-full px-4 py-2.5 pl-10 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                      {eligibleCourses.map(course => (
                        <div
                          key={course.id}
                          onClick={() => handleSelectCourse(course)}
                          className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-emerald-400">{course.code}</span>
                              <span className="text-xs font-bold text-white">{course.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{course.categoryName}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold">Select</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Highest Academic Qualification
                  </label>
                  <select
                    value={formData.highestAcademicQualification}
                    onChange={(e) => setFormData(prev => ({ ...prev, highestAcademicQualification: e.target.value as AcademicQualification }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white"
                  >
                    {QUALIFICATIONS.map(q => <option key={q} value={q} className="bg-slate-900">{q}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Current Occupation / Student / Unemployed
                  </label>
                  <input
                    type="text"
                    value={formData.currentOccupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentOccupation: e.target.value }))}
                    placeholder="e.g. Undergraduate / Freelancer / Job Seeker"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Motivation Statement & Achievements */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-400" />
                  <span>Scholarship Statement & Achievements</span>
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Reason for Scholarship Application (Financial Need & Goals) <span className="text-emerald-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formData.reasonForScholarship.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={formData.reasonForScholarship}
                    onChange={(e) => setFormData(prev => ({ ...prev, reasonForScholarship: e.target.value }))}
                    placeholder="Explain your financial background, why you need this scholarship, and how completing this 6-month programme will transform your career..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Relevant Achievements / Technical Skills / Community Leadership
                  </label>
                  <textarea
                    rows={3}
                    value={formData.relevantAchievementsSkills}
                    onChange={(e) => setFormData(prev => ({ ...prev, relevantAchievementsSkills: e.target.value }))}
                    placeholder="List any past academic honors, digital projects, coding attempts, leadership roles, or community voluntary work..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Official Declaration & Signature */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Mandatory Scholarship Affirmation</span>
                </h3>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic bg-slate-950 p-4 rounded-2xl border border-slate-800 font-serif leading-relaxed">
                "I confirm that the information provided in this application is accurate and complete. I understand that submission of this form does not automatically guarantee a scholarship award."
              </blockquote>

              <label 
                onClick={() => setFormData(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }))}
                className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all"
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border shrink-0 ${
                  formData.agreedToTerms ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 bg-slate-900'
                }`}>
                  {formData.agreedToTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs text-slate-200">
                  I accept and confirm the scholarship declaration above.
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Applicant's Legal Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.declarationApplicantName || formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, declarationApplicantName: e.target.value }))}
                    placeholder="Full legal signature name"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white"
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
                    Applicant Signature <span className="text-emerald-400">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('type')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        signatureMode === 'type' ? 'bg-emerald-500 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5 inline mr-1" /> Type
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureMode('draw')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        signatureMode === 'draw' ? 'bg-emerald-500 text-white' : 'text-slate-400'
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
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-serif italic text-emerald-400 focus:outline-none focus:border-emerald-500"
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
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
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
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Scholarship Application...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Submit Scholarship Application</span>
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
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>Check Scholarship Application Status</span>
                </h4>
                <button type="button" onClick={() => setShowLookupModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="e.g. DSTA-SCH/2026/123456"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={isLookingUp}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  {isLookingUp ? 'Searching...' : 'Track'}
                </button>
              </div>

              {lookupResult ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-bold">{lookupResult.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[9px]">
                      {lookupResult.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-white font-bold">{lookupResult.fullName}</div>
                  <div className="text-slate-400">{lookupResult.programmeAppliedFor}</div>
                  <div className="text-[10px] text-slate-500">Submitted on {new Date(lookupResult.createdAt).toLocaleDateString()}</div>
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
