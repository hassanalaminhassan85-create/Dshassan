import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Edit2, User, BookOpen, GraduationCap, HeartHandshake, ShieldCheck, ArrowRight, Layers, Clock, AlertCircle } from 'lucide-react';
import { StudentRegistrationApplication } from '../../types/studentRegistration';

interface Step9ReviewSubmitProps {
  formData: Partial<StudentRegistrationApplication>;
  onJumpToStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const Step9ReviewSubmit: React.FC<Step9ReviewSubmitProps> = ({
  formData,
  onJumpToStep,
  onSubmit,
  isSubmitting
}) => {
  const allCourses = [
    formData.primaryCourse,
    ...(formData.additionalCourses || [])
  ].filter(Boolean);

  const totalFee = allCourses.reduce((sum, c) => sum + (c?.calculatedPrice || 0), 0);
  const deposit70 = Math.round(totalFee * 0.7);
  const balance30 = Math.round(totalFee * 0.3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
          Step 9 of 10
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Comprehensive Application Review
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Double-check all entered records before submitting for admissions committee evaluation.
        </p>
      </div>

      {/* 1. Courses Breakdown Summary Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-orange-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Enrolled Programmes ({allCourses.length})
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(3)}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Courses</span>
          </button>
        </div>

        <div className="space-y-3">
          {allCourses.map((c, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-mono font-bold">
                    {c?.courseCode}
                  </span>
                  <span className="text-xs font-bold text-white">{c?.courseTitle}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-2">
                  <span>⏱ {c?.duration}</span>
                  <span>• 💻 {c?.mode}</span>
                  <span>• 📅 {c?.lectureDays}</span>
                  <span>• 🗣 {c?.language}</span>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs font-black text-orange-400 font-mono">₦{c?.calculatedPrice?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Tuition Fee Breakdown */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Total Program Tuition:</span>
            <span className="text-white font-mono text-sm font-black">₦{totalFee.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-orange-400">
            <span>70% Due Before Commencement:</span>
            <span className="font-mono font-black">₦{deposit70.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>30% Balance Prior to Completion:</span>
            <span className="font-mono">₦{balance30.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 2. Personal Information Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-orange-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Personal Bio</h4>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(4)}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Bio</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
            <span className="text-white font-bold">{formData.fullName || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth / Gender</span>
            <span className="text-white font-bold">{formData.dateOfBirth || 'N/A'} • {formData.gender || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone / WhatsApp</span>
            <span className="text-white font-mono">{formData.phoneNumber || 'N/A'} / {formData.whatsappNumber || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
            <span className="text-white font-medium">{formData.emailAddress || 'N/A'}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Residential Address</span>
            <span className="text-slate-200">{formData.residentialAddress || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Identification Document</span>
            <span className="text-white font-bold">{formData.idType}: {formData.idNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* 3. Educational & Motivation Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-orange-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Education & Motivation</h4>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(5)}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Highest Qualification</span>
            <span className="text-white font-bold">{formData.highestQualification} ({formData.institution || 'N/A'})</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Occupation / Experience</span>
            <span className="text-white font-bold">{formData.currentOccupation || 'N/A'} • {formData.yearsOfExperience || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Computer Literacy</span>
            <span className="text-white font-bold">{formData.computerLiteracy || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Device Availability</span>
            <span className="text-white font-bold">Laptop: {formData.ownsLaptop ? 'Yes' : 'No'} | Smartphone: {formData.ownsSmartphoneWithInternet ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* 4. Emergency Contact & Declaration Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 text-orange-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Next of Kin & Signing</h4>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(7)}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Contact</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Contact</span>
            <span className="text-white font-bold">{formData.primaryEmergencyContact?.fullName} ({formData.primaryEmergencyContact?.relationship})</span>
            <span className="text-slate-400 block text-[11px] font-mono mt-0.5">{formData.primaryEmergencyContact?.phoneNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Signed Legal Declaration</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Signed by {formData.declarationApplicantName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={isSubmitting}
          type="button"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-base font-extrabold shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting Official Application...
            </span>
          ) : (
            <>
              <span>Submit Student Application</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
