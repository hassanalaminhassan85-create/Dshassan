import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Building2, Briefcase, Award, Upload, Laptop, Smartphone, FileText, Check, CheckCircle2 } from 'lucide-react';
import { QualificationOption, ComputerLiteracy } from '../../types/studentRegistration';

interface Step5EduProfessionalProps {
  highestQualification: QualificationOption;
  institution: string;
  certificateUploadUrl?: string;
  certificateFileName?: string;
  currentOccupation: string;
  organisationBusiness: string;
  yearsOfExperience: string;
  computerLiteracy: ComputerLiteracy;
  ownsLaptop: boolean;
  ownsSmartphoneWithInternet: boolean;
  onChange: (fields: Partial<Step5EduProfessionalProps>) => void;
}

const QUALIFICATIONS: QualificationOption[] = [
  'SSCE', 'WAEC', 'NECO', 'NABTEB', 'Diploma', 'B.Sc', 'M.Sc', 'PhD', 'Other'
];

const EXPERIENCE_OPTIONS = [
  '0-1 Year (Beginner)',
  '2-3 Years (Junior)',
  '4-5 Years (Mid-Level)',
  '6-10 Years (Senior)',
  '10+ Years (Executive / Specialist)'
];

const COMPUTER_LITERACY_LEVELS: { level: ComputerLiteracy; desc: string }[] = [
  { level: 'Basic', desc: 'Browsing, email, basic MS Word/typing' },
  { level: 'Intermediate', desc: 'Spreadsheets, Canva, CMS, basic troubleshooting' },
  { level: 'Advanced', desc: 'Coding, design suites, database, cloud tools' }
];

export const Step5EduProfessional: React.FC<Step5EduProfessionalProps> = ({
  highestQualification,
  institution,
  certificateUploadUrl,
  certificateFileName,
  currentOccupation,
  organisationBusiness,
  yearsOfExperience,
  computerLiteracy,
  ownsLaptop,
  ownsSmartphoneWithInternet,
  onChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        certificateUploadUrl: reader.result as string,
        certificateFileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
          Step 5 of 10
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Educational & Professional Background
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Help us calibrate your course cohort difficulty level, practical assignments, and faculty mentoring.
        </p>
      </div>

      {/* Highest Qualification (Pills) */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Highest Academic Qualification <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {QUALIFICATIONS.map((q) => {
            const isSelected = highestQualification === q;
            return (
              <button
                key={q}
                type="button"
                onClick={() => onChange({ highestQualification: q })}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                {q}
              </button>
            );
          })}
        </div>
      </div>

      {/* Institution Name & Certificate Upload */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            School / Institution Attended <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={institution}
              onChange={(e) => onChange({ institution: e.target.value })}
              placeholder="e.g. Ahmadu Bello University, Zaria / UNILAG / MAUTECH"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium"
            />
            <GraduationCap className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Certificate Upload */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Upload Certificate / Statement of Result
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleCertificateUpload}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-dashed border-slate-700 hover:border-orange-500/60 cursor-pointer flex items-center justify-between gap-2 transition-all group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate text-left">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {certificateFileName || 'Click to select Certificate (PDF, PNG, JPG)'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Max 10MB</span>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-400 shrink-0">
              {certificateFileName ? 'Replace' : 'Upload'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Occupation & Organisation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Current Occupation / Designation <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={currentOccupation}
              onChange={(e) => onChange({ currentOccupation: e.target.value })}
              placeholder="e.g. Student / Marketer / Nurse / Teacher / Civil Servant"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium"
            />
            <Briefcase className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Organisation / Business / Employer
          </label>
          <div className="relative">
            <input
              type="text"
              value={organisationBusiness}
              onChange={(e) => onChange({ organisationBusiness: e.target.value })}
              placeholder="e.g. Self-Employed / Ministry / Tech Hub"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium"
            />
            <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      {/* Years of Experience */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
          Total Years of Work / Industry Experience <span className="text-orange-400">*</span>
        </label>
        <select
          value={yearsOfExperience}
          onChange={(e) => onChange({ yearsOfExperience: e.target.value })}
          className="w-full px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500 font-medium"
        >
          <option value="">Select experience duration</option>
          {EXPERIENCE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Computer Literacy Level */}
      <div className="space-y-3 p-5 rounded-3xl bg-slate-950/60 border border-slate-800">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Computer Literacy Self-Assessment <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COMPUTER_LITERACY_LEVELS.map((item) => {
            const isSelected = computerLiteracy === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => onChange({ computerLiteracy: item.level })}
                className={`p-4 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{item.level}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Device Ownership Toggle Switches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Laptop Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Do you own a laptop?</span>
              <span className="text-[10px] text-slate-400">Required for hands-on labs & coding projects</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ownsLaptop: !ownsLaptop })}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
              ownsLaptop ? 'bg-orange-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                ownsLaptop ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Smartphone Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Do you own a smartphone?</span>
              <span className="text-[10px] text-slate-400">With active internet for lecture updates</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ownsSmartphoneWithInternet: !ownsSmartphoneWithInternet })}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
              ownsSmartphoneWithInternet ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                ownsSmartphoneWithInternet ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
