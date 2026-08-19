import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  FileText, 
  UploadCloud, 
  Briefcase, 
  Building, 
  Award, 
  Check, 
  X, 
  Link as LinkIcon, 
  FileCheck, 
  Trash2,
  Plus
} from 'lucide-react';
import { 
  TutorApplication, 
  TutorQualification, 
  StudyStatus 
} from '../../types/tutorRegistration';

interface Step3TutorAcademicInfoProps {
  data: TutorApplication;
  onChange: (updated: Partial<TutorApplication>) => void;
}

const QUALIFICATIONS: TutorQualification[] = ['Diploma', 'B.Sc', 'M.Sc', 'PhD', 'Professional Certification', 'Other'];
const STUDY_STATUSES: StudyStatus[] = ['Graduate', 'Student'];

const COMMON_INSTITUTIONS = [
  'Ahmadu Bello University (ABU), Zaria',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Bayero University Kano (BUK)',
  'University of Nigeria, Nsukka (UNN)',
  'Federal University of Technology, Minna (FUTMINNA)',
  'Covenant University',
  'Obafemi Awolowo University (OAU), Ile-Ife',
  'Federal University of Technology, Akure (FUTA)',
  'Babcock University',
  'University of Abuja',
  'Lagos State University (LASU)',
  'National Open University of Nigeria (NOUN)',
  'International University / Overseas'
];

export const Step3TutorAcademicInfo: React.FC<Step3TutorAcademicInfoProps> = ({
  data,
  onChange
}) => {
  const [newCertInput, setNewCertInput] = useState('');
  const [institutionSuggestions, setInstitutionSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cvInputRef = useRef<HTMLInputElement>(null);
  const academicCertRef = useRef<HTMLInputElement>(null);
  const professionalCertRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const handleAddCert = () => {
    if (newCertInput.trim()) {
      const current = data.relevantCertifications || [];
      if (!current.includes(newCertInput.trim())) {
        onChange({ relevantCertifications: [...current, newCertInput.trim()] });
      }
      setNewCertInput('');
    }
  };

  const handleRemoveCert = (certToRemove: string) => {
    const current = data.relevantCertifications || [];
    onChange({ relevantCertifications: current.filter(c => c !== certToRemove) });
  };

  const handleInstitutionChange = (val: string) => {
    onChange({ institution: val });
    if (val.trim().length > 1) {
      const matches = COMMON_INSTITUTIONS.filter(i => i.toLowerCase().includes(val.toLowerCase()));
      setInstitutionSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Generic File Upload Simulator
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cv' | 'academic' | 'pro' | 'portfolio'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (type === 'cv') {
          onChange({ cvResumeUrl: base64, cvResumeFileName: file.name });
        } else if (type === 'academic') {
          onChange({ highestAcademicCertUrl: base64, highestAcademicCertFileName: file.name });
        } else if (type === 'pro') {
          onChange({ professionalCertUrl: base64, professionalCertFileName: file.name });
        } else if (type === 'portfolio') {
          onChange({ portfolioUrl: base64, portfolioFileName: file.name });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
          <GraduationCap className="w-4 h-4" />
          <span>Step 3 of 9 • Academic & Professional Credentials</span>
        </div>
        <h3 className="text-2xl font-extrabold text-white mt-1">Academic Background & Document Proof</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide your degree credentials, professional certifications, current employment role, and upload supporting documents.
        </p>
      </div>

      {/* Highest Qualification */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Highest Academic Qualification <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {QUALIFICATIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onChange({ highestQualification: q })}
              className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all text-center ${
                data.highestQualification === q
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 border border-orange-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Institution & Study Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-8 relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Institution / University / Polytechnic <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              value={data.institution}
              onChange={(e) => handleInstitutionChange(e.target.value)}
              onFocus={() => {
                if (data.institution) setShowSuggestions(true);
              }}
              placeholder="e.g. Ahmadu Bello University, Zaria"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
            {showSuggestions && institutionSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto">
                {institutionSuggestions.map((inst, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange({ institution: inst });
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-slate-800 hover:text-orange-400 transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    {inst}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Current Academic Status <span className="text-orange-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STUDY_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onChange({ studyStatus: status })}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    data.studyStatus === status
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Relevant Professional Certifications */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Relevant Professional Certifications (Google, AWS, Microsoft, Cisco, PMI, etc.)
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCertInput}
            onChange={(e) => setNewCertInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCert(); } }}
            placeholder="e.g. AWS Certified Solutions Architect, Google Cloud Professional"
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
          />
          <button
            type="button"
            onClick={handleAddCert}
            className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cert</span>
          </button>
        </div>

        {/* Cert Tag Chips */}
        {data.relevantCertifications && data.relevantCertifications.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {data.relevantCertifications.map((cert, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-medium"
              >
                <Award className="w-3.5 h-3.5 text-orange-400" />
                <span>{cert}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCert(cert)}
                  className="hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Current Employment */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-orange-400" />
          <span>Current Occupation & Employer</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Current Occupation / Job Title <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              value={data.currentOccupation}
              onChange={(e) => onChange({ currentOccupation: e.target.value })}
              placeholder="e.g. Senior Software Engineer / Lead Data Analyst"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Organization / Company / Self-Employed <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              value={data.organizationCompany}
              onChange={(e) => onChange({ organizationCompany: e.target.value })}
              placeholder="e.g. DS Tech & Digital Marketing Agency / Freelance"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Mandatory Document Uploads (4 Documents) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-orange-400" />
            <span>Document Uploads & Portfolio Verification</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Document 1: CV / Resume */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-400" />
                <span>Curriculum Vitae (CV) <span className="text-orange-400">*</span></span>
              </label>
              {data.cvResumeFileName && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Uploaded</span>
              )}
            </div>

            {data.cvResumeFileName ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700">
                <div className="truncate max-w-[200px] text-xs font-mono text-slate-200">
                  {data.cvResumeFileName}
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ cvResumeUrl: undefined, cvResumeFileName: undefined })}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => cvInputRef.current?.click()}
                className="w-full py-3 px-3 rounded-xl border border-dashed border-slate-700 hover:border-orange-500/60 bg-slate-900/50 hover:bg-slate-900 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-orange-400" />
                <span>Upload CV / Resume</span>
              </button>
            )}
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e, 'cv')}
              className="hidden"
            />
          </div>

          {/* Document 2: Highest Academic Certificate */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-orange-400" />
                <span>Academic Certificate <span className="text-orange-400">*</span></span>
              </label>
              {data.highestAcademicCertFileName && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Uploaded</span>
              )}
            </div>

            {data.highestAcademicCertFileName ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700">
                <div className="truncate max-w-[200px] text-xs font-mono text-slate-200">
                  {data.highestAcademicCertFileName}
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ highestAcademicCertUrl: undefined, highestAcademicCertFileName: undefined })}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => academicCertRef.current?.click()}
                className="w-full py-3 px-3 rounded-xl border border-dashed border-slate-700 hover:border-orange-500/60 bg-slate-900/50 hover:bg-slate-900 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-orange-400" />
                <span>Upload Academic Cert</span>
              </button>
            )}
            <input
              ref={academicCertRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, 'academic')}
              className="hidden"
            />
          </div>

          {/* Document 3: Professional Certifications */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-400" />
                <span>Professional Certificate(s)</span>
              </label>
              {data.professionalCertFileName && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Uploaded</span>
              )}
            </div>

            {data.professionalCertFileName ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700">
                <div className="truncate max-w-[200px] text-xs font-mono text-slate-200">
                  {data.professionalCertFileName}
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ professionalCertUrl: undefined, professionalCertFileName: undefined })}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => professionalCertRef.current?.click()}
                className="w-full py-3 px-3 rounded-xl border border-dashed border-slate-700 hover:border-orange-500/60 bg-slate-900/50 hover:bg-slate-900 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-orange-400" />
                <span>Upload Professional Cert</span>
              </button>
            )}
            <input
              ref={professionalCertRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, 'pro')}
              className="hidden"
            />
          </div>

          {/* Document 4: Portfolio / Work Sample */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-orange-400" />
                <span>Portfolio / Work Sample (File or Link)</span>
              </label>
              {(data.portfolioFileName || data.portfolioUrl) && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Attached</span>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="url"
                value={data.portfolioUrl && !data.portfolioUrl.startsWith('data:') ? data.portfolioUrl : ''}
                onChange={(e) => onChange({ portfolioUrl: e.target.value, portfolioFileName: 'Web Link' })}
                placeholder="https://github.com/username or https://myportfolio.com"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
              />
              <div className="text-center text-[10px] text-slate-500 font-bold uppercase">or upload file</div>
              {data.portfolioFileName && data.portfolioFileName !== 'Web Link' ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-700">
                  <div className="truncate text-xs font-mono text-slate-200">{data.portfolioFileName}</div>
                  <button
                    type="button"
                    onClick={() => onChange({ portfolioUrl: undefined, portfolioFileName: undefined })}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => portfolioInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-700 hover:border-orange-500/60 bg-slate-900/50 hover:bg-slate-900 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-orange-400" />
                  <span>Upload File (PDF / ZIP)</span>
                </button>
              )}
            </div>
            <input
              ref={portfolioInputRef}
              type="file"
              accept=".pdf,.zip,.doc,.docx"
              onChange={(e) => handleFileUpload(e, 'portfolio')}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
