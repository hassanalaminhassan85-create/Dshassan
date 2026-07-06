import React from 'react';
import { JobApplication } from '../types';
import { Mail, Phone, MapPin, CheckSquare, Square, Globe, Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';

const TiktokIcon = ({ size = 12, className = '' }: { size?: number; className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    style={{ width: size, height: size }} 
    className={className}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.19 1.15 1.34 2.8 2.15 4.54 2.3v3.74c-1.84-.04-3.64-.67-5.08-1.82a8.21 8.21 0 01-.67-.62v7.14a7.99 7.99 0 01-13.62 5.62 7.99 7.99 0 015.68-13.62c.28 0 .56.02.84.05v3.83a4.13 4.13 0 00-.84-.09 4.14 4.14 0 00-4.14 4.14 4.14 4.14 0 006.14 3.59c1.29-.75 2.13-2.15 2.13-3.67V.02z" />
  </svg>
);

interface CareersFormPDFViewProps {
  application: JobApplication;
}

export const CareersFormPDFView: React.FC<CareersFormPDFViewProps> = ({ application }) => {
  const {
    personalInfo = {
      fullName: '', maritalStatus: '', gender: '', dateOfBirth: '',
      nationality: 'Nigerian', stateOfOrigin: '', lgaTownOfOrigin: '',
      stateOfResidence: '', residentialAddress: '', emailAddress: '',
      phoneNumbers: '', passportPhoto: ''
    },
    guarantorInfo = { fullName: '', hometown: '', currentAddress: '', phoneNumber: '', relationship: '' },
    educationalBg = { highestQualification: '', schoolInstitution: '', fieldOfStudy: '', isStudentOrGraduate: '' },
    experiences = { exp1: '', exp2: '', exp3: '' },
    positionSkills = { majorRole: '', skillRole1: '', skillRole2: '', skillRole3: '' },
    specialization = { interests: [], otherDetails: '' },
    workMode = { monthlySalaryJob: '', contractFreelanceJob: '', availableForAnyOpportunity: true },
    languageProficiency = '',
    personalStatement = '',
    applicantSignature = '',
    declarationDate = '',
    approvedBy,
    status
  } = application;

  // Formatting date of birth or other dates if needed
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isApproved = status === 'approved' || approvedBy?.approved;

  return (
    <div className="space-y-8 no-print:bg-white p-0 sm:p-2" id="careers-pdf-document">
      
      {/* ==================== PAGE 1 ==================== */}
      <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-xl border border-slate-200 text-left font-sans max-w-[900px] mx-auto text-slate-800 leading-normal relative overflow-hidden print:shadow-none print:border-none print:p-0 print:m-0 break-after-page page-break-after-always" style={{ pageBreakAfter: 'always', breakAfter: 'page' }}>
        {/* Curved orange/blue top border pattern exactly like the PDF */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-orange-500 via-[#000E32] to-[#000E32]" />
        
        {/* Curvy visual pattern headers */}
        <div className="absolute top-4 left-0 right-0 h-1.5 bg-orange-500" />

        {/* 1. Header Section */}
        <div className="pt-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-slate-200 p-1 shadow-sm">
              {/* Custom SVG logo representing DS TECH circular mark */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="46" stroke="#000E32" strokeWidth="6" fill="none" />
                <path d="M25,50 C25,35 35,25 50,25 C65,25 75,35 75,50 C75,65 65,75 50,75" stroke="#EA580C" strokeWidth="6" fill="none" strokeLinecap="round" />
                <text x="50" y="58" fontSize="26" fontWeight="bold" fontFamily="sans-serif" fill="#000E32" textAnchor="middle">DS</text>
                <rect x="70" y="30" width="8" height="8" fill="#EA580C" />
                <rect x="78" y="38" width="8" height="8" fill="#000E32" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-[#000E32] tracking-tight">DS TECH</span>
                <span className="text-[9px] font-bold text-orange-600 tracking-wider">AND DIGITAL MARKETING</span>
              </div>
              <div className="text-[8px] font-black tracking-[0.2em] text-[#000E32] uppercase -mt-1">
                — AGENCY LIMITED —
              </div>
            </div>
          </div>

          {/* Right: Contact details */}
          <div className="text-[10px] space-y-1.5 text-slate-600 md:text-right font-medium">
            <div className="flex items-start md:justify-end gap-1.5">
              <MapPin size={11} className="text-orange-500 shrink-0 mt-0.5" />
              <div className="text-left md:text-right">
                <span className="font-bold text-[#000E32]">Head Office Address:</span>
                <p className="text-slate-500">Ext A-73 Efab Mall Second Floor<br />Area 11 Garki Abuja</p>
              </div>
            </div>
            <div className="flex items-center md:justify-end gap-1.5">
              <Mail size={11} className="text-[#000E32] shrink-0" />
              <div>
                <span className="font-bold text-[#000E32]">Email: </span>
                <span className="text-slate-500">dstechanddigitalmarketingltd@gmail.com</span>
              </div>
            </div>
            <div className="flex items-center md:justify-end gap-1.5">
              <Phone size={11} className="text-[#000E32] shrink-0" />
              <div>
                <span className="font-bold text-[#000E32]">Contact: </span>
                <span className="text-slate-500">+2349023489111</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Handles Section */}
        <div className="mt-4 bg-[#000E32] text-white rounded-xl py-2 px-4 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-md border border-slate-850">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 shrink-0 select-none">
            OUR ACTIVE HANDLES
          </span>
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-3 gap-y-1.5 text-[8.5px] font-bold text-slate-200 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-900/40 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
              <Facebook size={12} className="text-[#1877F2] fill-[#1877F2]/10" />
              <span className="text-white font-extrabold">Facebook:</span>
              <span className="text-slate-300 font-semibold select-all">dstechanddigitaltd</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/40 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
              <Instagram size={12} className="text-[#E4405F]" />
              <span className="text-white font-extrabold">Instagram:</span>
              <span className="text-slate-300 font-semibold select-all">dstechanddigitalg</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/40 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
              <TiktokIcon size={12} className="text-[#00f2fe]" />
              <span className="text-white font-extrabold">TikTok:</span>
              <span className="text-slate-300 font-semibold select-all">dstechanddigitalg</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/40 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
              <Twitter size={12} className="text-[#1DA1F2] fill-[#1DA1F2]/10" />
              <span className="text-white font-extrabold">X (Twitter):</span>
              <span className="text-slate-300 font-semibold select-all">@DigitalDs18246</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/40 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
              <Youtube size={12} className="text-[#FF0000] fill-[#FF0000]/10" />
              <span className="text-white font-extrabold">YouTube:</span>
              <span className="text-slate-300 font-semibold select-all">@dstechanddigitalmarketingltd</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/40 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
              <Linkedin size={12} className="text-[#0A66C2] fill-[#0A66C2]/10" />
              <span className="text-white font-extrabold">LinkedIn:</span>
              <span className="text-slate-300 font-semibold select-all">dstechanddigitaltd</span>
            </div>
          </div>
        </div>

        {/* 3. Title Section */}
        <div className="my-5 text-center relative py-1">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white -z-10" />
          <h1 className="inline-block bg-white px-6 text-xl sm:text-2xl font-black text-[#000E32] tracking-wider uppercase">
            ✦ <span className="text-orange-500">CAREERS</span> APPLICATION FORM ✦
          </h1>
        </div>

        {/* 4. Bento Grid (Columns 1, 2, 3 as in PDF) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch text-[10px]">
          
          {/* ================= COLUMN 1 ================= */}
          <div className="md:col-span-1 flex flex-col gap-5">
            {/* Section 1. Personal Information */}
            <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7 flex-1 flex flex-col justify-between">
              <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                1. Personal Information
              </div>
              
              {/* Passport Photo if present in Section 1 */}
              {personalInfo.passportPhoto && (
                <div className="w-16 h-20 border border-[#000E32] bg-white rounded mx-auto mb-3 overflow-hidden p-0.5 shadow-sm shrink-0">
                  <img src={personalInfo.passportPhoto} className="w-full h-full object-cover rounded" alt="passport-photo" />
                </div>
              )}

              <div className="space-y-2 flex-1">
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Full Name:</span>
                  <span className="text-[11px] font-bold text-slate-800 break-words">{personalInfo.fullName || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Marital Status:</span>
                  <span className="text-slate-800 font-semibold">{personalInfo.maritalStatus || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Gender:</span>
                  <span className="text-slate-800 font-semibold">{personalInfo.gender || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Date of Birth:</span>
                  <span className="text-slate-800 font-semibold">{formatDate(personalInfo.dateOfBirth) || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Nationality:</span>
                  <span className="text-slate-800 font-semibold">{personalInfo.nationality || 'Nigerian'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">State of Origin:</span>
                  <span className="text-slate-800 font-semibold">{personalInfo.stateOfOrigin || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">LGA/Town of Origin:</span>
                  <span className="text-slate-800 font-semibold">{personalInfo.lgaTownOfOrigin || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">State of Residence:</span>
                  <span className="text-slate-800 font-semibold">{personalInfo.stateOfResidence || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Residential Address:</span>
                  <span className="text-slate-800 font-medium text-[9.5px] leading-tight block">{personalInfo.residentialAddress || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Email Address:</span>
                  <span className="text-[#000E32] font-semibold break-all text-[9.5px] font-mono block">{personalInfo.emailAddress || '—'}</span>
                </div>
                <div className="pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Phone Number(s):</span>
                  <span className="text-slate-800 font-bold font-mono text-[10px] block">{personalInfo.phoneNumbers || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2 ================= */}
          <div className="md:col-span-1 flex flex-col gap-5">
            {/* Section 2. Guarantor Information */}
            <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7 flex-1">
              <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                2. Guarantor Information
              </div>
              <div className="space-y-2.5">
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Full Name:</span>
                  <span className="text-[10px] font-bold text-slate-800">{guarantorInfo.fullName || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Hometown:</span>
                  <span className="text-slate-800 font-semibold">{guarantorInfo.hometown || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Current Address:</span>
                  <span className="text-slate-800 font-medium leading-tight block">{guarantorInfo.currentAddress || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Phone Number:</span>
                  <span className="text-slate-800 font-bold font-mono">{guarantorInfo.phoneNumber || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Relationship:</span>
                  <span className="text-slate-800 font-semibold">{guarantorInfo.relationship || '—'}</span>
                </div>
                <p className="text-[7.5px] text-slate-400 leading-snug italic font-medium pt-1.5 border-t border-slate-100">
                  Note: Your guarantor must be fully aware of this application for identification and emergency purposes.
                </p>
              </div>
            </div>

            {/* Section 4. Relevant Experience(s) */}
            <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7 h-max">
              <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                4. Relevant Experience(s)
              </div>
              <div className="space-y-2 text-[9.5px]">
                <div className="border-b border-slate-100 pb-1.5 flex items-start gap-1.5">
                  <span className="font-black text-orange-500">1.</span>
                  <p className="text-slate-700 font-medium leading-tight">{experiences.exp1 || '—'}</p>
                </div>
                <div className="border-b border-slate-100 pb-1.5 flex items-start gap-1.5">
                  <span className="font-black text-orange-500">2.</span>
                  <p className="text-slate-700 font-medium leading-tight">{experiences.exp2 || '—'}</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-black text-orange-500">3.</span>
                  <p className="text-slate-700 font-medium leading-tight">{experiences.exp3 || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 3 ================= */}
          <div className="md:col-span-1 flex flex-col gap-5">
            {/* Section 3. Educational Background */}
            <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7 flex-1">
              <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                3. Educational Background
              </div>
              <div className="space-y-2.5">
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Highest Educational Qualification:</span>
                  <span className="text-[10px] font-bold text-slate-800">{educationalBg.highestQualification || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">School/Institution:</span>
                  <span className="text-slate-800 font-semibold">{educationalBg.schoolInstitution || '—'}</span>
                </div>
                <div className="border-b border-slate-150 pb-0.5">
                  <span className="font-bold text-slate-500 uppercase block text-[8px]">Field of Study:</span>
                  <span className="text-slate-800 font-semibold">{educationalBg.fieldOfStudy || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase block text-[8px] mb-1">Are You a Student or Graduate?</span>
                  <div className="flex gap-4 font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      {educationalBg.isStudentOrGraduate === 'student' ? (
                        <CheckSquare size={13} className="text-orange-500 shrink-0" />
                      ) : (
                        <Square size={13} className="text-slate-300 shrink-0" />
                      )}
                      Student
                    </span>
                    <span className="flex items-center gap-1">
                      {educationalBg.isStudentOrGraduate === 'graduate' ? (
                        <CheckSquare size={13} className="text-orange-500 shrink-0" />
                      ) : (
                        <Square size={13} className="text-slate-300 shrink-0" />
                      )}
                      Graduate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Row 2: Sections 5, 6, 7 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch text-[10px] mt-5">
          
          {/* Section 5. Position & Skills */}
          <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7">
            <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              5. Position & Skills
            </div>
            <div className="space-y-3">
              <div className="border-b border-slate-150 pb-0.5">
                <span className="font-bold text-slate-500 uppercase block text-[8px]">Major Role Applying For:</span>
                <span className="text-[10px] font-extrabold text-[#000E32] uppercase tracking-wide block">{positionSkills.majorRole || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[8px] mb-1">Relevant Skill-Based Role(s) / Tools:</span>
                <ul className="space-y-1.5 font-semibold text-slate-700 pl-0.5">
                  <li className="flex items-start gap-1"><span className="text-orange-500 font-bold">•</span> <span className="leading-tight">{positionSkills.skillRole1 || '—'}</span></li>
                  <li className="flex items-start gap-1"><span className="text-orange-500 font-bold">•</span> <span className="leading-tight">{positionSkills.skillRole2 || '—'}</span></li>
                  <li className="flex items-start gap-1"><span className="text-orange-500 font-bold">•</span> <span className="leading-tight">{positionSkills.skillRole3 || '—'}</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 6. Specialization / Area of Interest */}
          <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7">
            <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              6. Specialization / Area of Interest
            </div>
            <div className="space-y-2.5">
              <span className="text-[7.5px] text-slate-400 block leading-tight font-medium">
                State categories of Website Design, App Development, Services, Content Creation, or Content Presentation you specialize in:
              </span>
              <div className="space-y-1 font-bold text-slate-700">
                {['Website Design', 'App Development', 'Services', 'Content Creation', 'Content Presentation'].map((opt) => {
                  const isSelected = specialization.interests?.includes(opt);
                  return (
                    <div key={opt} className="flex items-center gap-1.5">
                      {isSelected ? (
                        <CheckSquare size={11} className="text-[#000E32]" />
                      ) : (
                        <Square size={11} className="text-slate-300" />
                      )}
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
              {specialization.otherDetails && (
                <div className="border-t border-slate-100 pt-1.5">
                  <span className="font-bold text-slate-400 uppercase block text-[7px]">Additional details:</span>
                  <p className="text-[8.5px] leading-tight text-slate-600 font-medium italic">{specialization.otherDetails}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 7. Preferred Work Mode */}
          <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7">
            <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              7. Preferred Work Mode
            </div>
            <div className="space-y-3 font-semibold text-slate-700">
              <div>
                <span className="text-slate-400 font-bold text-[8px] uppercase block mb-1">1. Monthly Salary-Based Job:</span>
                <div className="flex gap-2">
                  {['on-site', 'remote', 'hybrid'].map((mode) => (
                    <span key={mode} className="flex items-center gap-1 capitalize">
                      {workMode.monthlySalaryJob === mode ? (
                        <CheckSquare size={11} className="text-orange-500" />
                      ) : (
                        <Square size={11} className="text-slate-300" />
                      )}
                      {mode}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold text-[8px] uppercase block mb-1">2. Contract/Freelancing Jobs:</span>
                <div className="flex gap-2">
                  {['on-site', 'remote', 'hybrid'].map((mode) => (
                    <span key={mode} className="flex items-center gap-1 capitalize">
                      {workMode.contractFreelanceJob === mode ? (
                        <CheckSquare size={11} className="text-[#000E32]" />
                      ) : (
                        <Square size={11} className="text-slate-300" />
                      )}
                      {mode}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100">
                <span className="text-slate-400 font-bold text-[8px] uppercase block mb-1">3. Available for Alternative Roles:</span>
                <span className="flex items-center gap-1">
                  {workMode.availableForAnyOpportunity ? (
                    <CheckSquare size={11} className="text-orange-500" />
                  ) : (
                    <Square size={11} className="text-slate-300" />
                  )}
                  <span>Suitable Alternative opportunity</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 1 Footer indicator */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-semibold">
          <span>DS Tech & Digital Marketing Agency Limited — RC: 1845921</span>
          <span>Page 1 of 2</span>
        </div>
      </div>

      {/* ==================== PAGE 2 ==================== */}
      <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-xl border border-slate-200 text-left font-sans max-w-[900px] mx-auto text-slate-800 leading-normal relative overflow-hidden print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Curved orange/blue top border pattern */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-orange-500 via-[#000E32] to-[#000E32]" />
        
        {/* Curvy visual pattern headers */}
        <div className="absolute top-4 left-0 right-0 h-1.5 bg-orange-500" />

        {/* Standard Page 2 Header matching style but compact */}
        <div className="pt-6 pb-4 flex justify-between items-center border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 p-0.5 shadow-sm">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="46" stroke="#000E32" strokeWidth="6" fill="none" />
                <path d="M25,50 C25,35 35,25 50,25 C65,25 75,35 75,50 C75,65 65,75 50,75" stroke="#EA580C" strokeWidth="6" fill="none" strokeLinecap="round" />
                <text x="50" y="58" fontSize="26" fontWeight="bold" fontFamily="sans-serif" fill="#000E32" textAnchor="middle">DS</text>
              </svg>
            </div>
            <div>
              <span className="text-sm font-black text-[#000E32] tracking-tight uppercase">DS Tech & Digital Marketing</span>
              <p className="text-[7.5px] text-slate-400 uppercase tracking-widest leading-none">Accreditation Document</p>
            </div>
          </div>
          <div className="text-[9px] font-bold text-[#000E32] tracking-wider uppercase bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Page 2: Endorsement & Declaration
          </div>
        </div>

        {/* Bento Grid Row 3: Sections 8, 9, 10 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch text-[10px] mt-6">
          {/* Section 8. Language Proficiency */}
          <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7">
            <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              8. Language Proficiency
            </div>
            <p className="text-[9px] text-slate-600 font-medium italic leading-relaxed">
              Apart from English, which other language(s) can you effectively use for communication, service delivery, content creation, or presentation?
            </p>
            <div className="mt-2 p-2 bg-white rounded border border-slate-100 min-h-[50px] font-mono text-[9px] text-[#000E32] font-bold leading-tight">
              {languageProficiency || 'English Only'}
            </div>
          </div>

          {/* Section 9. Personal Statement */}
          <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7">
            <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              9. Personal Statement
            </div>
            <p className="text-[9.5px] text-slate-600 font-medium italic leading-relaxed">
              Why would you like to join DS Tech and Digital Marketing Agency Limited?
            </p>
            <div className="mt-2 p-2 bg-white rounded border border-slate-100 min-h-[60px] text-[9px] font-semibold text-slate-700 leading-normal">
              "{personalStatement || 'No personal statement provided.'}"
            </div>
          </div>

          {/* Section 10. Important Note */}
          <div className="border border-[#000E32] rounded-xl bg-white p-3.5 relative pt-7 flex flex-col justify-between text-left">
            <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              10. Important Note
            </div>
            <div className="space-y-3 flex-1 flex flex-col justify-between pt-1">
              <p className="text-[8.5px] font-medium leading-relaxed text-slate-500">
                A passport photograph will be required later for the processing of the Official Staff ID Card.
              </p>
              
              {/* Show passport photo placeholder or actual upload */}
              <div className="w-20 h-24 border border-dashed border-slate-300 rounded-lg mx-auto flex items-center justify-center p-1 bg-white">
                {personalInfo.passportPhoto ? (
                  <img src={personalInfo.passportPhoto} className="w-full h-full object-cover rounded" alt="passport-photo-staff" />
                ) : (
                  <div className="text-center text-slate-350 flex flex-col items-center">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-40 fill-none stroke-current" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="text-[7px] block mt-1 font-bold uppercase">Passport Photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Row 4: Section 11 & 12 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch text-[10px] mt-6">
          {/* Section 11. Declaration */}
          <div className="border border-[#000E32] rounded-xl bg-white p-4 relative pt-7 flex flex-col justify-between">
            <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              11. Declaration
            </div>
            <p className="text-[9.5px] text-slate-600 font-medium leading-relaxed italic">
              I hereby confirm that the information provided above is accurate and true to the best of my knowledge.
            </p>
            
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 items-end">
              <div>
                <span className="text-slate-400 font-bold block text-[7.5px] uppercase">Applicant Signature:</span>
                <div className="mt-1 min-h-[45px] border-b border-dashed border-slate-300 flex items-center justify-center bg-white rounded p-1">
                  {applicantSignature ? (
                    <img src={applicantSignature} className="max-h-[35px] object-contain" alt="signature" />
                  ) : (
                    <span className="text-[8px] text-slate-400 italic">Unsigned</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[7.5px] uppercase">Date:</span>
                <div className="mt-1 text-[10px] font-bold text-slate-800 border-b border-dashed border-slate-300 pb-1 pl-1">
                  {declarationDate ? formatDate(declarationDate) : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 12. Approved By */}
          <div className="border border-[#000E32] rounded-xl bg-white p-4 relative pt-7 flex flex-col justify-between">
            <div className="absolute -top-2.5 left-3 bg-[#000E32] text-white text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              12. Approved By
            </div>
            
            <div className="text-center text-slate-500 font-semibold text-[8.5px] uppercase tracking-wide leading-normal">
              CEO/Admin<br />
              DS Tech and Digital Marketing Agency Limited<br />
              Garki, Abuja, Nigeria
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 items-end">
              <div>
                <span className="text-slate-400 font-bold block text-[7.5px] uppercase">Official Signature:</span>
                <div className="mt-1 min-h-[45px] border-b border-dashed border-slate-300 flex items-center justify-center bg-emerald-50/20 rounded p-1">
                  {isApproved ? (
                    <div className="text-center relative">
                      <span className="text-[7px] text-emerald-600 font-black tracking-widest block uppercase px-1 border border-emerald-500/30 rounded bg-emerald-50 leading-none py-0.5">APPROVED</span>
                      <span className="text-[6px] font-mono text-slate-400 block mt-0.5">{approvedBy?.signature || 'DS_STAMP_APPROVED'}</span>
                    </div>
                  ) : (
                    <span className="text-[8px] text-slate-400 italic">Pending Review</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[7.5px] uppercase">Date Approved:</span>
                <div className="mt-1 text-[10px] font-bold text-slate-800 border-b border-dashed border-slate-300 pb-1 pl-1">
                  {isApproved && approvedBy?.date ? formatDate(approvedBy.date) : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 Footer indicator */}
        <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-semibold">
          <span>DS Tech & Digital Marketing Agency Limited — RC: 1845921</span>
          <span>Page 2 of 2</span>
        </div>
      </div>
    </div>
  );
};
