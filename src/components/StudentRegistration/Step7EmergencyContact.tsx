import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, Phone, Mail, MapPin, HeartHandshake, Plus, Trash2, Check } from 'lucide-react';
import { EmergencyContact, RelationshipOption } from '../../types/studentRegistration';

interface Step7EmergencyContactProps {
  primaryEmergencyContact: EmergencyContact;
  secondaryEmergencyContact?: EmergencyContact;
  onChangePrimary: (contact: EmergencyContact) => void;
  onChangeSecondary: (contact: EmergencyContact | undefined) => void;
}

const RELATIONSHIPS: RelationshipOption[] = ['Parent', 'Sibling', 'Spouse', 'Friend', 'Other'];

export const Step7EmergencyContact: React.FC<Step7EmergencyContactProps> = ({
  primaryEmergencyContact,
  secondaryEmergencyContact,
  onChangePrimary,
  onChangeSecondary
}) => {
  const [showSecondary, setShowSecondary] = useState<boolean>(!!secondaryEmergencyContact?.fullName);

  const handleAddSecondary = () => {
    setShowSecondary(true);
    onChangeSecondary({
      fullName: '',
      relationship: 'Sibling',
      phoneNumber: '',
      emailAddress: '',
      address: ''
    });
  };

  const handleRemoveSecondary = () => {
    setShowSecondary(false);
    onChangeSecondary(undefined);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
          Step 7 of 10
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Emergency Contact & Next of Kin
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide contact details for an individual who can be reached in case of health emergencies or urgent student communications.
        </p>
      </div>

      {/* Primary Emergency Contact Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Primary Emergency Contact</h4>
            <span className="text-[10px] text-slate-400 font-medium">Mandatory next of kin / guardian</span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Contact Full Name <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={primaryEmergencyContact.fullName}
              onChange={(e) => onChangePrimary({ ...primaryEmergencyContact, fullName: e.target.value })}
              placeholder="e.g. ALHAJI, Usman Danladi"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium"
            />
            <UserCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Relationship Pills */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Relationship to Student <span className="text-orange-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {RELATIONSHIPS.map((rel) => {
              const isSelected = primaryEmergencyContact.relationship === rel;
              return (
                <button
                  key={rel}
                  type="button"
                  onClick={() => onChangePrimary({ ...primaryEmergencyContact, relationship: rel })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {rel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
              Phone Number <span className="text-orange-400">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={primaryEmergencyContact.phoneNumber}
                onChange={(e) => onChangePrimary({ ...primaryEmergencyContact, phoneNumber: e.target.value })}
                placeholder="e.g. +234 803 999 8888"
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-mono"
              />
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={primaryEmergencyContact.emailAddress}
                onChange={(e) => onChangePrimary({ ...primaryEmergencyContact, emailAddress: e.target.value })}
                placeholder="e.g. guardian@gmail.com"
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium"
              />
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Residential Address <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <textarea
              rows={2}
              value={primaryEmergencyContact.address}
              onChange={(e) => onChangePrimary({ ...primaryEmergencyContact, address: e.target.value })}
              placeholder="Address of next of kin / emergency contact"
              className="w-full px-4 py-3 pl-11 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium resize-none"
            />
            <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      {/* Optional Secondary Emergency Contact */}
      {showSecondary && secondaryEmergencyContact ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl space-y-5 relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Secondary Emergency Contact</h4>
                <span className="text-[10px] text-slate-400 font-medium">Alternative contact person</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveSecondary}
              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
              title="Remove secondary contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary Full Name */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={secondaryEmergencyContact.fullName}
              onChange={(e) => onChangeSecondary({ ...secondaryEmergencyContact, fullName: e.target.value })}
              placeholder="e.g. BELLO, Maryam"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Secondary Relationship */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Relationship
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {RELATIONSHIPS.map((rel) => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => onChangeSecondary({ ...secondaryEmergencyContact, relationship: rel })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    secondaryEmergencyContact.relationship === rel
                      ? 'bg-amber-500 text-white border-amber-400 shadow-md'
                      : 'bg-slate-950 border-slate-700 text-slate-300'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Phone & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={secondaryEmergencyContact.phoneNumber}
                onChange={(e) => onChangeSecondary({ ...secondaryEmergencyContact, phoneNumber: e.target.value })}
                placeholder="e.g. +234 802 000 1111"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                Residential Address
              </label>
              <input
                type="text"
                value={secondaryEmergencyContact.address}
                onChange={(e) => onChangeSecondary({ ...secondaryEmergencyContact, address: e.target.value })}
                placeholder="Address"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={handleAddSecondary}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-orange-500/50 bg-slate-900/40 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <Plus className="w-4 h-4 text-orange-400 group-hover:scale-125 transition-transform" />
          <span>+ Add Another Emergency Contact (Optional)</span>
        </button>
      )}
    </div>
  );
};
