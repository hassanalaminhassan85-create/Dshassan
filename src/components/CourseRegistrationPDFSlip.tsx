import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CourseRegistrationRecord } from '../types/courseRegistration';

interface CourseRegistrationPDFSlipProps {
  record: CourseRegistrationRecord;
  id?: string;
  isPrintOnly?: boolean;
}

export const CourseRegistrationPDFSlip: React.FC<CourseRegistrationPDFSlipProps> = ({
  record,
  id = 'dsta-course-registration-slip',
  isPrintOnly = false,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const payload = JSON.stringify({
          dsta_id: record.registrationId,
          name: record.fullName,
          prog: record.programmeType,
          course: record.course1.courseName,
          verified: true,
          date: record.createdAt,
        });
        const url = await QRCode.toDataURL(payload, {
          width: 140,
          margin: 1,
          color: {
            dark: '#000E32',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generating registration QR code', err);
      }
    };
    generateQR();
  }, [record.registrationId, record.fullName, record.programmeType, record.course1.courseName, record.createdAt]);

  const formattedDate = record.createdAt
    ? new Date(record.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div
      id={id}
      className={`bg-white text-slate-900 font-sans leading-tight print:p-0 ${
        isPrintOnly ? 'hidden print:block' : 'block'
      }`}
      style={{
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
      }}
    >
      {/* Container with sharp corporate border for world-class appearance */}
      <div className="border border-slate-300 print:border-slate-800 p-6 sm:p-7 relative overflow-hidden bg-white shadow-sm print:shadow-none">
        {/* Top corporate ribbon bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-[#000E32] to-[#000E32]" />

        {/* 1. OFFICIAL INSTITUTIONAL HEADER */}
        <div className="pt-2 pb-4 border-b-2 border-[#000E32] flex items-center justify-between gap-4">
          {/* Logo & Agency identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-[#000E32] p-1 shrink-0 shadow-xs">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="46" stroke="#000E32" strokeWidth="6" fill="none" />
                <path
                  d="M25,50 C25,35 35,25 50,25 C65,25 75,35 75,50 C75,65 65,75 50,75"
                  stroke="#EA580C"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
                <text
                  x="50"
                  y="58"
                  fontSize="26"
                  fontWeight="900"
                  fontFamily="sans-serif"
                  fill="#000E32"
                  textAnchor="middle"
                >
                  DS
                </text>
                <rect x="70" y="30" width="8" height="8" fill="#EA580C" />
                <rect x="78" y="38" width="8" height="8" fill="#000E32" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-[#000E32] tracking-tight">DS TECH</span>
                <span className="text-[10px] font-bold text-orange-600 tracking-wider">
                  & DIGITAL MARKETING AGENCY LTD
                </span>
              </div>
              <p className="text-[9px] font-extrabold text-slate-500 tracking-wider uppercase">
                Incorporated by CAC Nigeria • RC: 7356230
              </p>
              <p className="text-[11px] font-black tracking-widest text-[#000E32] uppercase mt-0.5">
                DS TECH ACADEMY • DIRECTORATE OF ACADEMIC AFFAIRS
              </p>
            </div>
          </div>

          {/* QR Verification badge */}
          <div className="flex flex-col items-end text-right shrink-0">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Registration Verification QR"
                className="w-16 h-16 border border-slate-200 rounded p-0.5"
              />
            ) : (
              <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] font-mono text-slate-400">
                VERIFIED
              </div>
            )}
            <span className="text-[8px] font-mono text-slate-500 font-bold uppercase mt-1">
              Official QR Docket
            </span>
          </div>
        </div>

        {/* 2. DOCUMENT TITLE & IDENTIFIER BAR */}
        <div className="my-3 py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-md flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block">
              Official Enrolment Record
            </span>
            <h1 className="text-sm sm:text-base font-black text-[#000E32] tracking-wide uppercase">
              COURSE REGISTRATION SLIP
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[9px] font-sans text-slate-500 font-bold uppercase block">
                Registration ID:
              </span>
              <span className="font-extrabold text-[#000E32] bg-white px-2 py-0.5 rounded border border-slate-300">
                {record.registrationId}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-sans text-slate-500 font-bold uppercase block">
                Session / Date:
              </span>
              <span className="font-bold text-slate-700">
                2026/2027 • {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* 3. SECTION: APPLICANT BIODATA TABLE */}
        <div className="mb-3.5">
          <div className="bg-[#000E32] text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-t">
            1. Applicant Biodata & Contact Profile
          </div>
          <table className="w-full text-xs border border-slate-300 border-t-0 border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/4 p-2 bg-slate-50 font-bold text-slate-600 uppercase text-[10px] border-r border-slate-200">
                  Full Name
                </td>
                <td className="w-3/4 p-2 font-black text-slate-900 uppercase tracking-wide">
                  {record.fullName || '—'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 bg-slate-50 font-bold text-slate-600 uppercase text-[10px] border-r border-slate-200">
                  Nationality & State of Origin
                </td>
                <td className="p-2 font-medium text-slate-800">
                  <span className="font-bold">{record.nationality || 'Nigerian'}</span> •{' '}
                  <span>State: {record.stateOfOrigin || '—'}</span> •{' '}
                  <span>LGA: {record.lga || '—'}</span>
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 bg-slate-50 font-bold text-slate-600 uppercase text-[10px] border-r border-slate-200">
                  Tribe / Ethnic Group & Sex
                </td>
                <td className="p-2 font-medium text-slate-800">
                  <span className="font-bold">{record.ethnicGroup || '—'}</span> •{' '}
                  <span className="uppercase font-semibold">Sex: {record.sex || '—'}</span>
                </td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 font-bold text-slate-600 uppercase text-[10px] border-r border-slate-200">
                  Contact Coordinates
                </td>
                <td className="p-2 font-medium text-slate-800 font-mono text-[11px]">
                  <span className="font-bold text-[#000E32]">WhatsApp:</span> {record.whatsappNumber || '—'} |{' '}
                  <span className="font-bold text-[#000E32]">Email:</span> {record.emailAddress || '—'}
                  {record.alternativePhone && (
                    <span> | <span className="font-bold text-[#000E32]">Alt:</span> {record.alternativePhone}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. SECTION: PROGRAMME INFORMATION */}
        <div className="mb-3.5">
          <div className="bg-[#000E32] text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-t">
            2. Enrolment & Programme Structure
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-300 border-t-0 divide-x divide-slate-200 text-xs text-center bg-white">
            <div className="p-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">
                Programme Type
              </span>
              <span className="font-extrabold text-[#000E32] uppercase">
                {record.programmeType || 'Scholarship'}
              </span>
            </div>
            <div className="p-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">
                Programme Duration
              </span>
              <span className="font-extrabold text-[#000E32]">
                {record.programmeDuration || 'Two Weeks'}
              </span>
            </div>
            <div className="p-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">
                Training Mode
              </span>
              <span className="font-extrabold text-[#000E32]">
                {record.trainingMode || 'Virtual Classes'}
              </span>
            </div>
            <div className="p-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">
                Teaching Language
              </span>
              <span className="font-extrabold text-[#000E32]">
                {record.teachingLanguage || 'English'}
              </span>
            </div>
          </div>
        </div>

        {/* 5. SECTION: COURSE ALLOCATION & LECTURE SCHEDULE (USER FILLED MANUALLY) */}
        <div className="mb-3.5">
          <div className="bg-[#000E32] text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-t flex items-center justify-between">
            <span>3. Course Allocation & Lecture Timetable (Official Schedule Alignment)</span>
            <span className="text-[8px] font-medium text-orange-300">
              Verified per student timetable
            </span>
          </div>
          <table className="w-full text-xs border border-slate-300 border-t-0 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[10px] font-black uppercase text-slate-700 border-b border-slate-300">
                <th className="p-2 text-left w-12 border-r border-slate-200">#</th>
                <th className="p-2 text-left border-r border-slate-200">Course Title</th>
                <th className="p-2 text-left border-r border-slate-200">Assigned Course Lecturer</th>
                <th className="p-2 text-left border-r border-slate-200">Weekly Days</th>
                <th className="p-2 text-left">Lecture Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Course 1 */}
              <tr>
                <td className="p-2 font-black text-orange-600 text-center border-r border-slate-200 bg-slate-50">
                  C1
                </td>
                <td className="p-2 font-extrabold text-slate-900 border-r border-slate-200">
                  {record.course1.courseName || '—'}
                </td>
                <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                  {record.course1.lecturer || '—'}
                </td>
                <td className="p-2 text-slate-700 border-r border-slate-200 text-[11px]">
                  {record.course1.weeklyLectureDays || '—'}
                </td>
                <td className="p-2 text-slate-700 text-[11px] font-medium">
                  {record.course1.lectureTime || '—'}
                </td>
              </tr>

              {/* Course 2 (Optional) */}
              {record.course2 && record.course2.courseName && (
                <tr>
                  <td className="p-2 font-black text-orange-600 text-center border-r border-slate-200 bg-slate-50">
                    C2
                  </td>
                  <td className="p-2 font-extrabold text-slate-900 border-r border-slate-200">
                    {record.course2.courseName}
                  </td>
                  <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                    {record.course2.lecturer || '—'}
                  </td>
                  <td className="p-2 text-slate-700 border-r border-slate-200 text-[11px]">
                    {record.course2.weeklyLectureDays || '—'}
                  </td>
                  <td className="p-2 text-slate-700 text-[11px] font-medium">
                    {record.course2.lectureTime || '—'}
                  </td>
                </tr>
              )}

              {/* Course 3 (Optional) */}
              {record.course3 && record.course3.courseName && (
                <tr>
                  <td className="p-2 font-black text-orange-600 text-center border-r border-slate-200 bg-slate-50">
                    C3
                  </td>
                  <td className="p-2 font-extrabold text-slate-900 border-r border-slate-200">
                    {record.course3.courseName}
                  </td>
                  <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                    {record.course3.lecturer || '—'}
                  </td>
                  <td className="p-2 text-slate-700 border-r border-slate-200 text-[11px]">
                    {record.course3.weeklyLectureDays || '—'}
                  </td>
                  <td className="p-2 text-slate-700 text-[11px] font-medium">
                    {record.course3.lectureTime || '—'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 6. SECTION: PAYMENT RECORD & BURSARY CLEARANCE */}
        <div className="mb-3.5">
          <div className="bg-[#000E32] text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-t">
            4. Tuition & Bursary Financial Clearance Record
          </div>
          <div className="border border-slate-300 border-t-0 p-2.5 bg-slate-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Tuition Fee Reporting:
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                {record.paymentIsNA
                  ? 'Non-Applicable (Scholarship / Waived Enrolment)'
                  : record.amountPaid
                  ? `₦${Number(record.amountPaid).toLocaleString()} (Self-Reported Payment)`
                  : 'Pending Clearance / Desk Confirmation'}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Bursary Audit Status:
              </span>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                PROVISIONAL ENROLMENT VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* 7. SECTION: ACADEMIC DECLARATION & SIGNATURE ATTESTATION */}
        <div className="border border-slate-300 rounded p-3 mb-3 bg-white text-xs">
          <p className="text-[9.5px] text-slate-600 leading-tight italic mb-3">
            <strong>Student Declaration:</strong> I solemnly declare that all personal and academic details supplied in this course registration form are authentic, accurate, and in strict adherence to the official Academy timetable. I agree to conform to the rules, academic conduct guidelines, and lecture schedules of DS TECH Academy.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 items-end">
            {/* Applicant Signature */}
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">
                Applicant Signature / Attestation:
              </span>
              <div className="border-b border-slate-700 pb-1 font-mono text-[11px] font-bold text-[#000E32]">
                {record.fullName}
              </div>
              <span className="text-[7.5px] text-slate-400 block mt-0.5">Electronically Signed</span>
            </div>

            {/* Registration Date */}
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">
                Filing Date:
              </span>
              <div className="border-b border-slate-700 pb-1 text-[11px] font-bold text-slate-800">
                {formattedDate}
              </div>
              <span className="text-[7.5px] text-slate-400 block mt-0.5">Validated Timestamp</span>
            </div>

            {/* Official Registrar Seal & Signature */}
            <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
              <div className="inline-block border-2 border-dashed border-emerald-700 rounded p-1.5 bg-emerald-50/60 text-center">
                <span className="text-[7.5px] font-black uppercase text-emerald-800 block tracking-wider">
                  DS TECH ACADEMY
                </span>
                <span className="text-[9px] font-black uppercase text-[#000E32] block">
                  ADMISSIONS CLEARED
                </span>
                <span className="text-[7px] font-mono text-slate-500 block">
                  RC: 7356230 / REGISTRAR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 8. OFFICIAL FOOTER WITH STATUTORY DETAILS */}
        <div className="pt-2 border-t border-slate-300 text-[8.5px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-center sm:text-left">
            <strong>Head Office:</strong> Ext A-73 Efab Mall Second Floor, Area 11 Garki, Abuja, Nigeria.
          </p>
          <p className="text-center sm:text-right font-mono">
            Support WhatsApp: +234 902 348 9111 | admissions@dstech.agency
          </p>
        </div>
      </div>
    </div>
  );
};
