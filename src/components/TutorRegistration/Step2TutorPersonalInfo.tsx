import React, { useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Check, 
  Trash2,
  Copy,
  Globe,
  Sparkles
} from 'lucide-react';
import { 
  TutorApplication, 
  NATIONALITIES, 
  NIGERIAN_STATES, 
  MaritalStatus, 
  TutorIdType, 
  TeachingMode, 
  TeachingDays 
} from '../../types/tutorRegistration';

interface Step2TutorPersonalInfoProps {
  data: TutorApplication;
  onChange: (updated: Partial<TutorApplication>) => void;
}

const MARITAL_STATUSES: MaritalStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];
const ID_TYPES: TutorIdType[] = ['NIN', 'Birth Cert', "Voter's ID", "Driver's License", 'Passport', 'Other'];
const TEACHING_MODES: TeachingMode[] = ['Physical', 'Virtual', 'Hybrid'];
const TEACHING_DAYS: TeachingDays[] = ['Monday-Friday', 'Saturday-Sunday', 'Both Weekdays & Weekends'];

export const Step2TutorPersonalInfo: React.FC<Step2TutorPersonalInfoProps> = ({
  data,
  onChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ passportPhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const copyPhoneToWhatsapp = () => {
    onChange({
      whatsappCountryCode: data.phoneCountryCode || '+234',
      whatsappNumber: data.phoneNumber || ''
    });
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
          <User className="w-4 h-4" />
          <span>Step 2 of 9 • Personal Profile & Availability</span>
        </div>
        <h3 className="text-2xl font-extrabold text-white mt-1">Instructor Personal Information</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide your official identification details, biometric photograph, and preferred teaching availability modes.
        </p>
      </div>

      {/* Passport Photo Upload & Basic Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Passport Upload Area */}
        <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 text-center">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Passport Photograph <span className="text-orange-400">*</span>
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-36 h-44 mx-auto rounded-2xl border-2 border-dashed border-slate-700 hover:border-orange-500 bg-slate-950/80 hover:bg-slate-950 transition-all flex flex-col items-center justify-center p-3 cursor-pointer group relative overflow-hidden shadow-inner"
          >
            {data.passportPhoto ? (
              <>
                <img
                  src={data.passportPhoto}
                  alt="Passport preview"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-slate-800/80 px-2 py-1 rounded-md">
                    Change Photo
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:text-orange-400 group-hover:border-orange-500/40 transition-all">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-semibold text-slate-300">Upload Photo</div>
                <div className="text-[9px] text-slate-500">JPG, PNG (Max 5MB)</div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {data.passportPhoto && (
            <button
              type="button"
              onClick={() => onChange({ passportPhoto: undefined })}
              className="mt-3 text-[11px] text-red-400 hover:text-red-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove Photo</span>
            </button>
          )}

          <p className="text-[10px] text-slate-500 mt-2">
            Clear passport photograph with plain light background for your official faculty profile.
          </p>
        </div>

        {/* Name, Nationality, State, Tribe */}
        <div className="md:col-span-8 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Legal Name (Surname First) <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="e.g. BELLO Ibrahim Chinedu"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nationality <span className="text-orange-400">*</span>
              </label>
              <select
                value={data.nationality || 'Nigeria'}
                onChange={(e) => onChange({ nationality: e.target.value })}
                className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              >
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n} className="bg-slate-900 text-white">
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                State of Origin <span className="text-orange-400">*</span>
              </label>
              <select
                value={data.stateOfOrigin || 'Kano'}
                onChange={(e) => onChange({ stateOfOrigin: e.target.value })}
                className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              >
                {NIGERIAN_STATES.map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Tribe / Ethnic Group <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                value={data.tribe || ''}
                onChange={(e) => onChange({ tribe: e.target.value })}
                placeholder="e.g. Hausa / Yoruba / Igbo"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Date of Birth <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={data.dateOfBirth}
                  onChange={(e) => onChange({ dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Marital Status <span className="text-orange-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {MARITAL_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onChange({ maritalStatus: status })}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      data.maritalStatus === status
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
      </div>

      {/* Identification Details */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-orange-400" />
          <span>Government Identification Document</span>
        </h4>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Identification Type <span className="text-orange-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ID_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ idType: type })}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  data.idType === type
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            ID / NIN / Document Number <span className="text-orange-400">*</span>
          </label>
          <input
            type="text"
            required
            value={data.idNumber}
            onChange={(e) => onChange({ idNumber: e.target.value })}
            placeholder="e.g. 11-digit NIN or Passport Number"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
          />
        </div>
      </div>

      {/* Contact & Location */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Phone className="w-4 h-4 text-orange-400" />
          <span>Contact Channels & Location</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Phone Number <span className="text-orange-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.phoneCountryCode || '+234'}
                onChange={(e) => onChange({ phoneCountryCode: e.target.value })}
                className="w-20 px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono text-center"
              />
              <input
                type="tel"
                required
                value={data.phoneNumber}
                onChange={(e) => onChange({ phoneNumber: e.target.value })}
                placeholder="8012345678"
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                WhatsApp Number <span className="text-orange-400">*</span>
              </label>
              <button
                type="button"
                onClick={copyPhoneToWhatsapp}
                className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Same as Phone</span>
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.whatsappCountryCode || '+234'}
                onChange={(e) => onChange({ whatsappCountryCode: e.target.value })}
                className="w-20 px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono text-center"
              />
              <input
                type="tel"
                required
                value={data.whatsappNumber}
                onChange={(e) => onChange({ whatsappNumber: e.target.value })}
                placeholder="8012345678"
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Email Address <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={data.emailAddress}
              onChange={(e) => onChange({ emailAddress: e.target.value })}
              placeholder="instructor.name@example.com"
              className="w-full px-4 py-3 pl-11 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Residential or Office Physical Location <span className="text-orange-400">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={data.residentialOfficeLocation}
            onChange={(e) => onChange({ residentialOfficeLocation: e.target.value })}
            placeholder="Full physical street address, city, state and landmark"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
          />
        </div>
      </div>

      {/* Teaching Mode & Days Availability */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-orange-400" />
          <span>Teaching Mode & Schedule Preferences</span>
        </h4>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Preferred Teaching Mode <span className="text-orange-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEACHING_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ preferredTeachingMode: mode })}
                className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                  data.preferredTeachingMode === mode
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 border border-orange-400'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{mode}</span>
                <span className="text-[10px] opacity-75 font-normal">
                  {mode === 'Physical' ? 'On-site at DSTA Hubs' : mode === 'Virtual' ? 'Online Live Sessions' : 'Combined In-Person & Remote'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Preferred Teaching Days <span className="text-orange-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEACHING_DAYS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => onChange({ preferredTeachingDays: days })}
                className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                  data.preferredTeachingDays === days
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 border border-orange-400'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{days}</span>
                <span className="text-[10px] opacity-75 font-normal">
                  {days.includes('Monday') ? 'Weekday Cohorts' : days.includes('Saturday') ? 'Weekend Executive Classes' : 'Full Availability'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
