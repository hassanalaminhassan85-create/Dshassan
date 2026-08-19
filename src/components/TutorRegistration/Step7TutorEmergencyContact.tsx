import React from 'react';
import { 
  Users, 
  UserCheck, 
  Phone, 
  MapPin, 
  Globe, 
  ShieldAlert, 
  Check 
} from 'lucide-react';
import { 
  TutorApplication, 
  TutorEmergencyContact, 
  NATIONALITIES, 
  NIGERIAN_STATES 
} from '../../types/tutorRegistration';

interface Step7TutorEmergencyContactProps {
  data: TutorApplication;
  onChange: (updated: Partial<TutorApplication>) => void;
}

const RELATIONSHIPS = [
  'Parent',
  'Spouse',
  'Sibling',
  'Professional Colleague',
  'Mentor / Industry Reference',
  'Friend',
  'Other'
];

export const Step7TutorEmergencyContact: React.FC<Step7TutorEmergencyContactProps> = ({
  data,
  onChange
}) => {
  const contact = data.emergencyContact || {
    fullName: '',
    relationship: 'Spouse',
    nationality: 'Nigeria',
    stateOfOrigin: 'Kano',
    residentialOfficeLocation: '',
    phoneWhatsappNumber: ''
  };

  const handleContactChange = (field: keyof TutorEmergencyContact, value: string) => {
    onChange({
      emergencyContact: {
        ...contact,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
          <ShieldAlert className="w-4 h-4" />
          <span>Step 7 of 9 • Emergency Contact & Next of Kin</span>
        </div>
        <h3 className="text-2xl font-extrabold text-white mt-1">Emergency Contact & Official Reference</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide contact information for a next of kin or professional referee who can be contacted in case of institutional emergency.
        </p>
      </div>

      {/* Emergency Contact Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Designated Emergency Contact</h4>
            <p className="text-xs text-slate-400">Primary referee / Next of kin details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Contact Full Name <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              value={contact.fullName}
              onChange={(e) => handleContactChange('fullName', e.target.value)}
              placeholder="e.g. Maryam Ibrahim Bello"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Relationship to Applicant <span className="text-orange-400">*</span>
            </label>
            <select
              value={contact.relationship || 'Spouse'}
              onChange={(e) => handleContactChange('relationship', e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            >
              {RELATIONSHIPS.map((rel) => (
                <option key={rel} value={rel} className="bg-slate-900 text-white">
                  {rel}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Contact Nationality <span className="text-orange-400">*</span>
            </label>
            <select
              value={contact.nationality || 'Nigeria'}
              onChange={(e) => handleContactChange('nationality', e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
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
              Contact State of Origin <span className="text-orange-400">*</span>
            </label>
            <select
              value={contact.stateOfOrigin || 'Kano'}
              onChange={(e) => handleContactChange('stateOfOrigin', e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            >
              {NIGERIAN_STATES.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Phone / WhatsApp Number <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={contact.phoneWhatsappNumber}
              onChange={(e) => handleContactChange('phoneWhatsappNumber', e.target.value)}
              placeholder="e.g. +234 801 234 5678"
              className="w-full px-4 py-3 pl-11 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
            <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Residential or Office Physical Location <span className="text-orange-400">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={contact.residentialOfficeLocation}
            onChange={(e) => handleContactChange('residentialOfficeLocation', e.target.value)}
            placeholder="Full physical street address, city, state and landmark"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
          />
        </div>
      </div>
    </div>
  );
};
