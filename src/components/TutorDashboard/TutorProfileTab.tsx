import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  UserCheck, 
  Mail, 
  Phone, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  Save, 
  Key, 
  Github, 
  Linkedin, 
  Globe,
  ShieldCheck
} from 'lucide-react';
import { TutorSession, saveActiveTutorSession } from '../../lib/academyStorage';

interface TutorProfileTabProps {
  session: TutorSession;
  onSessionUpdated: (session: TutorSession) => void;
}

export const TutorProfileTab: React.FC<TutorProfileTabProps> = ({
  session,
  onSessionUpdated
}) => {
  const [fullName, setFullName] = useState(session.fullName);
  const [phone, setPhone] = useState(session.phone);
  const [specialization, setSpecialization] = useState(session.specialization || session.expertise || 'Software Engineering & Cloud');
  const [bio, setBio] = useState('Senior Enterprise Cloud Architect & Lead Faculty at DS Tech Academy. 10+ years engineering scalable cloud systems, microservices, and AI-driven platforms.');
  const [githubUrl, setGithubUrl] = useState('https://github.com/dstech-faculty');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/dstech-lead');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TutorSession = {
      ...session,
      fullName: fullName.trim(),
      phone: phone.trim(),
      specialization: specialization.trim(),
      expertise: specialization.trim()
    };
    saveActiveTutorSession(updated);
    onSessionUpdated(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
          Faculty Profile & Specialization Dossier
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Maintain your institutional instructor credentials, mentorship specialization, and contact profiles.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span className="font-bold">Faculty dossier records updated successfully!</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          {session.photoUrl ? (
            <img
              src={session.photoUrl}
              alt={session.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border-2 border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-xl">
              {session.fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                {session.tutorId}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                VERIFIED SENIOR FACULTY
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {session.fullName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {session.specialization || session.expertise || 'Software Engineering'} • Rating: ★ {session.rating || 4.9} / 5.0
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Instructor Name & Title
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty Email (Institutional)
              </label>
              <input
                type="email"
                disabled
                value={session.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Phone / WhatsApp Hotline
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Core Specialization & Track
              </label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Professional Biography & Teaching Philosophy
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GitHub Organization Profile
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn Professional URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              <span>Save Faculty Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
