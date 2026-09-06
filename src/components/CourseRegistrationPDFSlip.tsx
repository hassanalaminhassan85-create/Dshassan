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
          docket: record.registrationId,
          name: record.fullName,
          program: record.programmeType,
          course: record.course1?.courseName || '',
          cac_rc: '1845921',
          dsta_rc: '9550925',
          verified: true,
          date: record.createdAt,
        });
        const url = await QRCode.toDataURL(payload, {
          width: 130,
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
  }, [record.registrationId, record.fullName, record.programmeType, record.course1?.courseName, record.createdAt]);

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
      className={`bg-white text-slate-900 leading-tight print:p-0 ${
        isPrintOnly ? 'hidden print:block' : 'block'
      }`}
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        letterSpacing: '-0.01em',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer Card Container with Crisp Corporate Border */}
      <div 
        className="border border-slate-300 print:border-slate-800 p-5 relative overflow-hidden bg-white shadow-sm print:shadow-none"
        style={{ borderRadius: '8px' }}
      >
        {/* Top Corporate Ribbon Bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: 'linear-gradient(90deg, #EA580C 0%, #000E32 50%, #000E32 100%)' }}
        />

        {/* 1. OFFICIAL INSTITUTIONAL MASTHEAD WITH AUTHENTIC LOGO */}
        <div className="pt-1.5 pb-3 border-b-2 border-[#000E32] flex items-center justify-between gap-3">
          {/* Official Crest & Institutional Identification */}
          <div className="flex items-center gap-3">
            {/* Authentic DS TECH Official Circular Vector Crest */}
            <div className="shrink-0 w-14 h-14 bg-white rounded-full flex items-center justify-center p-0.5 border border-slate-200 shadow-xs">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="geometricPrecision"
              >
                <defs>
                  <radialGradient id="slipBlueGloss" cx="50%" cy="40%" r="50%" fx="50%" fy="30%">
                    <stop offset="0%" stopColor="#1E40AF" />
                    <stop offset="60%" stopColor="#0B3C9B" />
                    <stop offset="100%" stopColor="#000E32" />
                  </radialGradient>
                  <linearGradient id="slipGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                  <linearGradient id="slipSilver" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#94A3B8" />
                  </linearGradient>
                </defs>

                {/* Outer Ring */}
                <circle cx="50" cy="50" r="48" fill="none" stroke="#000E32" strokeWidth="1.5" opacity="0.3" />
                <circle cx="50" cy="50" r="46" fill="url(#slipBlueGloss)" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#slipGold)" strokeWidth="1.2" />

                {/* Stars */}
                <polygon points="50,11 51.5,15 55.5,15 52.5,17.5 53.5,21.5 50,19 46.5,21.5 47.5,17.5 44.5,15 48.5,15" fill="#FBBF24" />
                <polygon points="26,20 27,23 30,23 27.5,25 28.5,28 26,26 23.5,28 24.5,25 22,23 25,23" fill="#FBBF24" />
                <polygon points="74,20 75,23 78,23 75.5,25 76.5,28 74,26 71.5,28 72.5,25 70,23 73,23" fill="#FBBF24" />

                {/* Diamond Crown */}
                <path d="M42 22 L46 17 L50 20 L54 17 L58 22 L56 25 L44 25 Z" fill="url(#slipGold)" />
                <circle cx="50" cy="20" r="1.2" fill="#FFFFFF" />

                {/* Orange Arcs */}
                <path d="M 23 50 A 27 27 0 0 1 77 50" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M 27 50 A 23 23 0 0 0 73 50" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                {/* Brand DS typography */}
                <text
                  x="50"
                  y="49"
                  fontFamily="'Segoe UI', Roboto, sans-serif"
                  fontWeight="900"
                  fontSize="24"
                  fill="#FFFFFF"
                  textAnchor="middle"
                  letterSpacing="-0.5"
                >
                  DS
                </text>

                {/* Institutional Text */}
                <text
                  x="50"
                  y="57"
                  fontFamily="'Segoe UI', Roboto, sans-serif"
                  fontWeight="900"
                  fontSize="4.2"
                  fill="#FFFFFF"
                  textAnchor="middle"
                  letterSpacing="0.4"
                >
                  TECH &amp; DIGITAL
                </text>
                <text
                  x="50"
                  y="63"
                  fontFamily="'Segoe UI', Roboto, sans-serif"
                  fontWeight="900"
                  fontSize="4.2"
                  fill="url(#slipGold)"
                  textAnchor="middle"
                  letterSpacing="0.3"
                >
                  MARKETING AGENCY LTD
                </text>
                <text
                  x="50"
                  y="72"
                  fontFamily="'Segoe UI', Roboto, sans-serif"
                  fontWeight="600"
                  fontSize="2.8"
                  fill="#CBD5E1"
                  textAnchor="middle"
                  letterSpacing="0.2"
                >
                  ACADEMY ADMISSIONS
                </text>
              </svg>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-lg font-black text-[#000E32] tracking-tight">
                  DS TECH ACADEMY
                </span>
                <span className="text-[9.5px] font-bold text-orange-600 tracking-wider">
                  • DIRECTORATE OF ACADEMIC AFFAIRS
                </span>
              </div>
              <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                DS TECH &amp; DIGITAL MARKETING AGENCY LTD • CAC RC: 1845921
              </p>
              <p className="text-[8px] font-semibold text-slate-400 tracking-wide mt-0.5">
                Federal Republic of Nigeria • Accredited Academic Directorate • RC: 9550925
              </p>
            </div>
          </div>

          {/* QR Verification Docket */}
          <div className="flex flex-col items-end text-right shrink-0">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Registration Verification QR"
                className="w-14 h-14 border border-slate-300 rounded p-0.5 bg-white shadow-2xs"
              />
            ) : (
              <div className="w-14 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] font-mono text-slate-400">
                VERIFIED
              </div>
            )}
            <span className="text-[7.5px] font-mono text-emerald-700 font-extrabold uppercase mt-0.5 tracking-tight">
              ✓ Digital QR Verified
            </span>
          </div>
        </div>

        {/* 2. DOCKET IDENTIFIER BAR (COMPACT BANNER) */}
        <div className="my-2.5 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-md flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[8.5px] font-extrabold text-orange-600 uppercase tracking-widest block">
              Official Institutional Enrolment Docket
            </span>
            <h1 className="text-sm font-black text-[#000E32] tracking-tight uppercase">
              STUDENT COURSE REGISTRATION SLIP
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-[8px] font-sans text-slate-400 font-bold uppercase block">
                Registration ID:
              </span>
              <span className="font-extrabold text-[#000E32] bg-white px-2 py-0.5 rounded border border-slate-300 text-[11px]">
                {record.registrationId}
              </span>
            </div>
            <div>
              <span className="text-[8px] font-sans text-slate-400 font-bold uppercase block">
                Filing Date:
              </span>
              <span className="font-bold text-slate-700 text-[11px]">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* 3. CARD: APPLICANT BIODATA & CONTACT PROFILE */}
        <div className="mb-2.5 border border-slate-200 rounded-md overflow-hidden bg-white">
          <div className="bg-[#000E32] text-white px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider flex items-center justify-between">
            <span>1. Applicant Biodata &amp; Contact Profile</span>
            <span className="text-[8px] font-mono text-orange-300">Identity Record</span>
          </div>
          <table className="w-full text-[10.5px] border-collapse">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="w-[22%] px-2.5 py-1.5 bg-slate-50 font-bold text-slate-600 uppercase text-[9px] border-r border-slate-100">
                  Full Name
                </td>
                <td className="w-[78%] px-2.5 py-1.5 font-black text-slate-900 uppercase tracking-tight">
                  {record.fullName || '—'}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-2.5 py-1.5 bg-slate-50 font-bold text-slate-600 uppercase text-[9px] border-r border-slate-100">
                  Origin &amp; Sex
                </td>
                <td className="px-2.5 py-1.5 font-medium text-slate-800">
                  <span className="font-bold">{record.nationality || 'Nigerian'}</span> •{' '}
                  <span>State: <strong>{record.stateOfOrigin || '—'}</strong></span> •{' '}
                  <span>LGA: <strong>{record.lga || '—'}</strong></span> •{' '}
                  <span>Sex: <strong className="uppercase">{record.sex || '—'}</strong></span>
                </td>
              </tr>
              <tr>
                <td className="px-2.5 py-1.5 bg-slate-50 font-bold text-slate-600 uppercase text-[9px] border-r border-slate-100">
                  Contact Coordinates
                </td>
                <td className="px-2.5 py-1.5 font-medium text-slate-800 font-mono text-[10px]">
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

        {/* 4. CARD: ENROLMENT & PROGRAMME STRUCTURE (COMPACT METRICS) */}
        <div className="mb-2.5 border border-slate-200 rounded-md overflow-hidden bg-white">
          <div className="bg-[#000E32] text-white px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider flex items-center justify-between">
            <span>2. Enrolment &amp; Programme Structure</span>
            <span className="text-[8px] font-mono text-orange-300">Curriculum Model</span>
          </div>
          <div className="grid grid-cols-4 divide-x divide-slate-200 text-center bg-white text-[10.5px]">
            <div className="p-1.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">
                Programme Type
              </span>
              <span className="font-black text-[#000E32] uppercase">
                {record.programmeType || 'Scholarship'}
              </span>
            </div>
            <div className="p-1.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">
                Duration
              </span>
              <span className="font-black text-[#000E32]">
                {record.programmeDuration || 'Two Weeks'}
              </span>
            </div>
            <div className="p-1.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">
                Delivery Mode
              </span>
              <span className="font-black text-[#000E32]">
                {record.trainingMode || 'Virtual Classes'}
              </span>
            </div>
            <div className="p-1.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">
                Language
              </span>
              <span className="font-black text-[#000E32]">
                {record.teachingLanguage || 'English'}
              </span>
            </div>
          </div>
        </div>

        {/* 5. CARD: COURSE ALLOCATION & TIMETABLE (MANUALLY FILLED BY USER ONLY) */}
        <div className="mb-2.5 border border-slate-200 rounded-md overflow-hidden bg-white">
          <div className="bg-[#000E32] text-white px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider flex items-center justify-between">
            <span>3. Course Allocation &amp; Lecture Timetable</span>
            <span className="text-[8px] font-medium text-orange-300">
              Verified per student timetable
            </span>
          </div>
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[8.5px] font-black uppercase text-slate-600 border-b border-slate-200">
                <th className="px-2 py-1 text-center w-8 border-r border-slate-200">#</th>
                <th className="px-2 py-1 text-left border-r border-slate-200">Course Title</th>
                <th className="px-2 py-1 text-left border-r border-slate-200">Assigned Lecturer</th>
                <th className="px-2 py-1 text-left border-r border-slate-200">Weekly Days</th>
                <th className="px-2 py-1 text-left">Lecture Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Course 1 */}
              <tr>
                <td className="px-2 py-1.5 font-black text-orange-600 text-center border-r border-slate-100 bg-slate-50/50">
                  C1
                </td>
                <td className="px-2 py-1.5 font-bold text-slate-900 border-r border-slate-100">
                  {record.course1.courseName || '—'}
                </td>
                <td className="px-2 py-1.5 font-semibold text-slate-800 border-r border-slate-100">
                  {record.course1.lecturer || '—'}
                </td>
                <td className="px-2 py-1.5 text-slate-700 border-r border-slate-100 text-[9.5px]">
                  {record.course1.weeklyLectureDays || '—'}
                </td>
                <td className="px-2 py-1.5 text-slate-700 text-[9.5px] font-medium">
                  {record.course1.lectureTime || '—'}
                </td>
              </tr>

              {/* Course 2 (Rendered only if filled) */}
              {record.course2 && record.course2.courseName && (
                <tr>
                  <td className="px-2 py-1.5 font-black text-orange-600 text-center border-r border-slate-100 bg-slate-50/50">
                    C2
                  </td>
                  <td className="px-2 py-1.5 font-bold text-slate-900 border-r border-slate-100">
                    {record.course2.courseName}
                  </td>
                  <td className="px-2 py-1.5 font-semibold text-slate-800 border-r border-slate-100">
                    {record.course2.lecturer || '—'}
                  </td>
                  <td className="px-2 py-1.5 text-slate-700 border-r border-slate-100 text-[9.5px]">
                    {record.course2.weeklyLectureDays || '—'}
                  </td>
                  <td className="px-2 py-1.5 text-slate-700 text-[9.5px] font-medium">
                    {record.course2.lectureTime || '—'}
                  </td>
                </tr>
              )}

              {/* Course 3 (Rendered only if filled) */}
              {record.course3 && record.course3.courseName && (
                <tr>
                  <td className="px-2 py-1.5 font-black text-orange-600 text-center border-r border-slate-100 bg-slate-50/50">
                    C3
                  </td>
                  <td className="px-2 py-1.5 font-bold text-slate-900 border-r border-slate-100">
                    {record.course3.courseName}
                  </td>
                  <td className="px-2 py-1.5 font-semibold text-slate-800 border-r border-slate-100">
                    {record.course3.lecturer || '—'}
                  </td>
                  <td className="px-2 py-1.5 text-slate-700 border-r border-slate-100 text-[9.5px]">
                    {record.course3.weeklyLectureDays || '—'}
                  </td>
                  <td className="px-2 py-1.5 text-slate-700 text-[9.5px] font-medium">
                    {record.course3.lectureTime || '—'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 6. CARD: TUITION CLEARANCE & BURSARY RECORD */}
        <div className="mb-2.5 border border-slate-200 rounded-md overflow-hidden bg-white">
          <div className="bg-[#000E32] text-white px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider flex items-center justify-between">
            <span>4. Tuition &amp; Bursary Financial Clearance</span>
            <span className="text-[8px] font-mono text-emerald-300">Audit Status</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 text-[10px] flex flex-row items-center justify-between gap-1.5">
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase block">
                Tuition Fee Reporting:
              </span>
              <span className="font-extrabold text-slate-900 text-xs">
                {record.paymentIsNA
                  ? 'Non-Applicable (Scholarship / Waived Enrolment)'
                  : record.amountPaid
                  ? `₦${Number(record.amountPaid).toLocaleString()} (Self-Reported Payment)`
                  : 'Pending Clearance / Desk Confirmation'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-bold text-slate-500 uppercase block">
                Bursary Audit Status:
              </span>
              <span className="inline-block px-2 py-0.5 rounded text-[8.5px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                PROVISIONAL ENROLMENT VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* 7. CARD: ACADEMIC DECLARATION & OFFICIAL REGISTRAR SEAL */}
        <div className="border border-slate-200 rounded-md p-2.5 mb-2 bg-white text-[10px]">
          <p className="text-[8.5px] text-slate-600 leading-tight italic mb-2">
            <strong>Student Declaration:</strong> I solemnly declare that all personal and academic details supplied in this course registration form are authentic, accurate, and in strict adherence to the official Academy timetable. I agree to conform to the academic guidelines and lecture schedules of DS TECH Academy.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-1.5 border-t border-slate-100 items-end">
            {/* Applicant Signature */}
            <div>
              <span className="text-[7.5px] font-bold text-slate-400 uppercase block mb-0.5">
                Applicant Signature / Attestation:
              </span>
              <div className="border-b border-slate-700 pb-0.5 font-mono text-[10px] font-bold text-[#000E32]">
                {record.fullName}
              </div>
              <span className="text-[7px] text-slate-400 block mt-0.5">Electronically Signed</span>
            </div>

            {/* Registration Date */}
            <div>
              <span className="text-[7.5px] font-bold text-slate-400 uppercase block mb-0.5">
                Filing Date:
              </span>
              <div className="border-b border-slate-700 pb-0.5 text-[10px] font-bold text-slate-800">
                {formattedDate}
              </div>
              <span className="text-[7px] text-slate-400 block mt-0.5">Validated Timestamp</span>
            </div>

            {/* Official Registrar Seal */}
            <div className="col-span-1 text-right">
              <div className="inline-block border-2 border-dashed border-emerald-700 rounded p-1 bg-emerald-50/60 text-center">
                <span className="text-[7px] font-black uppercase text-emerald-800 block tracking-wider">
                  DS TECH ACADEMY
                </span>
                <span className="text-[8px] font-black uppercase text-[#000E32] block">
                  ADMISSIONS CLEARED
                </span>
                <span className="text-[6.5px] font-mono text-slate-600 block">
                  CAC RC: 1845921 / DSTA: 9550925
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 8. STATUTORY FOOTER */}
        <div className="pt-1.5 border-t border-slate-200 text-[7.5px] text-slate-500 flex flex-row items-center justify-between gap-1">
          <p className="text-left">
            <strong>Headquarters:</strong> Ext A-73 Efab Mall Second Floor, Area 11 Garki, Abuja, Nigeria.
          </p>
          <p className="text-right font-mono">
            Support WhatsApp: +234 902 348 9111 | admissions@dstech.agency
          </p>
        </div>
      </div>
    </div>
  );
};
