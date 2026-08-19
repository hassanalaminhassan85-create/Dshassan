import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  Calendar, 
  Search, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Printer, 
  Copy, 
  Home, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  Briefcase
} from 'lucide-react';
import { ACADEMY_COURSES } from '../../lib/academyCoursesData';
import { 
  CorporateTrainingRequest, 
  OrganizationType, 
  CorporateTrainingDuration, 
  DeliveryMode 
} from '../../types/academyPathways';
import { 
  generateCorporateId, 
  apiSaveCorporateRequest, 
  apiGetCorporateRequest 
} from '../../lib/pathwayStorage';

interface CorporateFormProps {
  onNavigateHome?: () => void;
  onNavigateCourses?: () => void;
}

const ORG_TYPES: OrganizationType[] = [
  'Private Enterprise / Corporate',
  'Public Sector / Government Agency',
  'NGO / Non-profit Organization',
  'Educational Institution / University',
  'Startup / Tech Venture',
  'Multilateral / International Body',
  'Other'
];

const DURATIONS: CorporateTrainingDuration[] = [
  '1 Day Intensive',
  '3 Days Workshop',
  '1 Week Bootcamp',
  '2 Weeks Executive',
  '1 Month Masterclass',
  'Custom Duration'
];

export const CorporateTrainingForm: React.FC<CorporateFormProps> = ({
  onNavigateHome,
  onNavigateCourses
}) => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [copied, setCopied] = useState(false);

  // Status lookup
  const [lookupId, setLookupId] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<CorporateTrainingRequest | null>(null);
  const [showLookupModal, setShowLookupModal] = useState(false);

  const [formData, setFormData] = useState<CorporateTrainingRequest>({
    id: generateCorporateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'submitted',

    organizationName: '',
    companyAddress: '',
    contactPerson: '',
    phoneCountryCode: '+234',
    phoneWhatsappNumber: '',
    emailAddress: '',
    organizationType: 'Private Enterprise / Corporate',

    trainingWorkshopRequired: '',
    selectedCourseCode: '',
    proposedEstimatedBudget: '',
    preferredDate: '',
    trainingDuration: '1 Week Bootcamp',
    numberOfParticipants: '15',
    preferredMode: 'Physical',
    trainingLocation: '',
    additionalRequirements: ''
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
      trainingWorkshopRequired: course.title,
      selectedCourseCode: course.code
    }));
    setShowCoursePicker(false);
    setCourseSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.organizationName.trim()) {
      setValidationError('Please provide the organization or company name.');
      return;
    }
    if (!formData.contactPerson.trim()) {
      setValidationError('Please provide the primary contact person name.');
      return;
    }
    if (!formData.phoneWhatsappNumber.trim()) {
      setValidationError('Please provide a contact phone or WhatsApp number.');
      return;
    }
    if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
      setValidationError('Please provide a valid corporate email address.');
      return;
    }
    if (!formData.trainingWorkshopRequired.trim()) {
      setValidationError('Please specify the training course or workshop needed.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiSaveCorporateRequest(formData);
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setValidationError('Failed to submit corporate training request. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setIsLookingUp(true);
    const result = await apiGetCorporateRequest(lookupId.trim());
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" />
            <span>Enterprise Upskilling & Executive Masterclasses</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            DS Tech Academy <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400">Corporate Training Request Form</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Equip your workforce with tailored enterprise curricula across Artificial Intelligence, Cybersecurity, Data Science, and Modern Digital Operations.
          </p>

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowLookupModal(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Corporate Proposal Status</span>
            </button>
          </div>
        </div>

        {/* Enterprise Capability Highlights */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Customized Enterprise Delivery Options</h3>
              <p className="text-xs text-slate-400">Tailored schedules, on-premise or cloud-hosted dedicated learning portals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { title: 'On-Site / At Your Office', desc: 'Our lead instructors deliver hands-on workshops directly at your corporate headquarters.' },
              { title: 'Executive Virtual Portal', desc: 'Live interactive labs, breakout sessions, and LMS recordings for remote teams.' },
              { title: 'Hybrid Bootcamp', desc: 'Combines asynchronous self-paced mastery with intense weekend executive masterclasses.' }
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
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
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Corporate Training Request Logged!</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Your organizational training request has been assigned to our Corporate Solutions Executive team.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Corporate Request Reference ID
                </span>
                <div className="text-2xl font-extrabold font-mono text-amber-400 tracking-wider mt-0.5">
                  {formData.id}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Next Steps */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Corporate Onboarding & Proposal Workflow:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { step: '1', title: 'Consultation', desc: 'Discovery call with lead enterprise architect' },
                  { step: '2', title: 'Curriculum', desc: 'Customized training syllabus tailored to your team' },
                  { step: '3', title: 'Quotation', desc: 'Formal invoice & corporate SLA proposal' },
                  { step: '4', title: 'Execution', desc: 'Live training rollout and post-training reporting' }
                ].map((s) => (
                  <div key={s.step} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center">
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
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Request Summary</span>
              </button>
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main Corporate Request Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Organization Profile */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>Organization & Primary Representative</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Organization / Company Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                    placeholder="e.g. Acme Financial Group Ltd"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Type of Organization
                  </label>
                  <select
                    value={formData.organizationType}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizationType: e.target.value as OrganizationType }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white"
                  >
                    {ORG_TYPES.map(type => (
                      <option key={type} value={type} className="bg-slate-900">{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Company / Organization Head Office Address
                </label>
                <textarea
                  rows={2}
                  value={formData.companyAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                  placeholder="Plot 123, Central Business District, Abuja / Lagos / Kano..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Contact Person Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="e.g. Engr. Mustapha Lawal"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Phone / WhatsApp <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneWhatsappNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneWhatsappNumber: e.target.value }))}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Corporate Email Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.emailAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                    placeholder="hr@acmegroup.ng"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Training Scope & Course Selection */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Training Scope & Custom Curriculum Requirements</span>
                </h3>
              </div>

              {/* Course Selection or Custom Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Training / Workshop Required <span className="text-amber-400">*</span>
                </label>

                {formData.trainingWorkshopRequired ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {formData.selectedCourseCode && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                            {formData.selectedCourseCode}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">Curriculum Benchmark</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">{formData.trainingWorkshopRequired}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCoursePicker(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={formData.trainingWorkshopRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, trainingWorkshopRequired: e.target.value, selectedCourseCode: '' }))}
                      placeholder="Type custom training topic (e.g. AI Workflow Automation for Internal Audits) or select from catalog below..."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCoursePicker(true)}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-amber-500/50 bg-slate-950 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Or Pick from 115+ Pre-Built Industry Courses</span>
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
                        className="w-full px-4 py-2.5 pl-10 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                      {filteredCourses.map(course => (
                        <div
                          key={course.id}
                          onClick={() => handleSelectCourse(course)}
                          className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-amber-400">{course.code}</span>
                              <span className="text-xs font-bold text-white">{course.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{course.categoryName}</span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold">Select</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Budget, Dates, Duration & Participants */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Proposed Budget (₦ Naira)
                  </label>
                  <input
                    type="text"
                    value={formData.proposedEstimatedBudget}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposedEstimatedBudget: e.target.value }))}
                    placeholder="e.g. ₦1,500,000"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Preferred Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Estimated Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfParticipants}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfParticipants: e.target.value }))}
                    placeholder="e.g. 20"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white font-mono"
                  />
                </div>
              </div>

              {/* Duration Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Training / Workshop Duration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {DURATIONS.map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, trainingDuration: dur }))}
                      className={`py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center ${
                        formData.trainingDuration === dur
                          ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Mode Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Preferred Delivery Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Physical', 'Virtual', 'Hybrid'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, preferredMode: m }))}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          formData.preferredMode === m
                            ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
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
                    Proposed Physical Training Venue / Location
                  </label>
                  <input
                    type="text"
                    value={formData.trainingLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, trainingLocation: e.target.value }))}
                    placeholder="e.g. Company Auditorium or DSTA Training Lab"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Additional Organizational Goals or Specific Requirements
                </label>
                <textarea
                  rows={3}
                  value={formData.additionalRequirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalRequirements: e.target.value }))}
                  placeholder="Detail any software versions, industry compliance mandates, assessment exams, or post-training mentorship requirements..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 leading-relaxed"
                />
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
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing Corporate Request...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Submit Corporate Training RFP</span>
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
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Track Corporate Training RFP</span>
                </h4>
                <button type="button" onClick={() => setShowLookupModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="e.g. DSTA-CORP/2026/123456"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={isLookingUp}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  {isLookingUp ? 'Searching...' : 'Track'}
                </button>
              </div>

              {lookupResult ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-amber-400 font-bold">{lookupResult.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase text-[9px]">
                      {lookupResult.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-white font-bold">{lookupResult.organizationName}</div>
                  <div className="text-slate-400">{lookupResult.trainingWorkshopRequired}</div>
                  <div className="text-[10px] text-slate-500">Contact: {lookupResult.contactPerson} ({lookupResult.emailAddress})</div>
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
