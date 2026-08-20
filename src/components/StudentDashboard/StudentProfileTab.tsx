import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Key, 
  Check, 
  Save, 
  GraduationCap, 
  Lock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { StudentSession, saveActiveStudentSession } from '../../lib/academyStorage';

interface StudentProfileTabProps {
  session: StudentSession;
  onSessionUpdated: (session: StudentSession) => void;
}

export const StudentProfileTab: React.FC<StudentProfileTabProps> = ({
  session,
  onSessionUpdated
}) => {
  const [fullName, setFullName] = useState(session.fullName);
  const [phone, setPhone] = useState(session.phone);
  const [address, setAddress] = useState('Plot 1428 Ahmadu Bello Way, Garki, Abuja, FCT');
  const [emergencyContact, setEmergencyContact] = useState('+234 802 333 4455 (Guardian)');
  const [isSaved, setIsSaved] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentSession = {
      ...session,
      fullName: fullName.trim(),
      phone: phone.trim()
    };
    saveActiveStudentSession(updated);
    onSessionUpdated(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setIsPasswordModalOpen(false);
      setNewPassword('');
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
          Student Profile & Academic Dossier
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review and maintain your official enrollment credentials, attendance rating, and contact channels.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span className="font-bold">Student Profile details updated successfully in the registry.</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          {session.photoUrl ? (
            <img
              src={session.photoUrl}
              alt={session.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/40 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-500 font-bold text-xl">
              {session.fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                {session.studentId}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ACTIVE SCHOLAR
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {session.fullName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {session.program} • {session.cohort}
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address (Institutional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  disabled
                  value={session.email}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Phone / WhatsApp Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone size={14} />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Residential Campus City / State
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={14} />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Key size={14} />
              <span>Change Portal Password</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Academic Standing Dossier Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award size={16} className="text-indigo-500" />
          <span>Official Academic & Compliance Standing</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Cumulative Attendance
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5 block">
              {session.attendanceRate}%
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
              Eligible for Final Assessment
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Training Mode
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5 block">
              {session.mode}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
              Campus Hub & Cloud Lab
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Certificate Eligibility
            </span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-display mt-0.5 block">
              In Good Standing
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
              70/30 Practical Met
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
