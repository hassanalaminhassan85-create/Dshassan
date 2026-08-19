import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, User, Calendar, Phone, MessageSquare, Mail, MapPin, Shield, Check, Copy, AlertCircle, Camera } from 'lucide-react';
import { GenderOption, IdTypeOption } from '../../types/studentRegistration';

interface Step4PersonalInfoProps {
  passportPhoto?: string;
  fullName: string;
  dateOfBirth: string;
  gender: GenderOption;
  countryCode: string;
  phoneNumber: string;
  whatsappNumber: string;
  emailAddress: string;
  residentialAddress: string;
  idType: IdTypeOption;
  idNumber: string;
  onChange: (fields: Partial<Step4PersonalInfoProps>) => void;
}

const GENDERS: GenderOption[] = ['Male', 'Female', 'Other', 'Prefer not to say'];
const ID_TYPES: IdTypeOption[] = ['NIN', 'Birth Cert', "Voter's ID", "Driver's license", 'Passport'];

export const Step4PersonalInfo: React.FC<Step4PersonalInfoProps> = ({
  passportPhoto,
  fullName,
  dateOfBirth,
  gender,
  countryCode = '+234',
  phoneNumber,
  whatsappNumber,
  emailAddress,
  residentialAddress,
  idType,
  idNumber,
  onChange
}) => {
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setPhotoError('Image size exceeds 4MB. Please upload a smaller image.');
      return;
    }

    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ passportPhoto: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleCopyPhoneToWhatsApp = () => {
    onChange({ whatsappNumber: phoneNumber });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
          Step 4 of 10
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Personal Information
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide accurate personal details for student identification, academic records, and verifiable student badge generation.
        </p>
      </div>

      {/* Passport Photograph Upload Area */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-xl space-y-4">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Passport Photograph <span className="text-orange-400">*</span>
          <span className="ml-2 text-[10px] text-slate-400 font-normal">(White or plain background recommended, max 4MB)</span>
        </label>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Preview Box */}
          <div className="relative w-32 h-36 rounded-2xl border-2 border-dashed border-orange-500/40 bg-slate-950 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-inner group">
            {passportPhoto ? (
              <>
                <img src={passportPhoto} alt="Passport preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  Change
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500">
                <User className="w-10 h-10 mb-1 text-slate-600" />
                <span className="text-[10px] font-medium">No Photo</span>
              </div>
            )}
          </div>

          {/* Upload Actions */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{passportPhoto ? 'Replace Passport Photo' : 'Upload Passport Photo'}</span>
            </button>
            <p className="text-[11px] text-slate-400">
              Accepted formats: JPG, PNG, WEBP. Used on official DSTA student portal, attendance biometric profile, and graduation transcripts.
            </p>
            {photoError && (
              <p className="text-xs text-red-400 font-medium">{photoError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Full Name & Date of Birth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Full Name (Surname First) <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="e.g. MOHAMMED, Ibrahim Danladi"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium"
            />
            <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Date of Birth <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => onChange({ dateOfBirth: e.target.value })}
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500 font-medium"
            />
            <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      {/* Gender Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Gender <span className="text-orange-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {GENDERS.map((g) => {
            const isSelected = gender === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ gender: g })}
                className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>{g}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone Number & WhatsApp Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Phone Number <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => onChange({ phoneNumber: e.target.value })}
              placeholder="e.g. +234 803 123 4567"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-mono"
            />
            <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
              WhatsApp Number <span className="text-orange-400">*</span>
            </label>
            {phoneNumber && (
              <button
                type="button"
                onClick={handleCopyPhoneToWhatsApp}
                className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Same as phone</span>
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => onChange({ whatsappNumber: e.target.value })}
              placeholder="e.g. +234 803 123 4567"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-mono"
            />
            <MessageSquare className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
          Email Address <span className="text-orange-400">*</span>
        </label>
        <div className="relative">
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => onChange({ emailAddress: e.target.value })}
            placeholder="e.g. student@gmail.com"
            className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium"
          />
          <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Admission offer letters, classroom invitations, and LMS credentials will be sent here.</p>
      </div>

      {/* Residential Address */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
          Residential Address <span className="text-orange-400">*</span>
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={residentialAddress}
            onChange={(e) => onChange({ residentialAddress: e.target.value })}
            placeholder="House/Plot number, Street name, District/LGA, City/State (e.g. Flat 4, Efab Estate, Area 11, Garki, Abuja)"
            className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium resize-none"
          />
          <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* ID Type & ID Number */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-950/60 border border-slate-800">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Official Identification Document <span className="text-orange-400">*</span>
        </label>
        
        {/* ID Type Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ID_TYPES.map((t) => {
            const isSelected = idType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ idType: t })}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
            {idType || 'ID'} Number <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={idNumber}
              onChange={(e) => onChange({ idNumber: e.target.value })}
              placeholder={`Enter your ${idType || 'NIN'} number`}
              className="w-full px-4 py-3 pl-10 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-mono"
            />
            <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
