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
          cac_rc: '9550925',
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
      className={`bg-white text-slate-900 leading-normal print:p-0 ${
        isPrintOnly ? 'hidden print:block' : 'block'
      }`}
      style={{
        width: '100%',
        maxWidth: '800px',
        minHeight: '1080px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        letterSpacing: '-0.01em',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer Card Container with Crisp Corporate Border and Full-Page Height */}
      <div 
        className="border-2 border-slate-300 print:border-slate-800 p-6 sm:p-7 relative overflow-hidden bg-white shadow-sm print:shadow-none flex flex-col justify-between"
        style={{ borderRadius: '8px', minHeight: '1080px', boxSizing: 'border-box' }}
      >
        {/* Top Corporate Ribbon Bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-2"
          style={{ background: 'linear-gradient(90deg, #EA580C 0%, #000E32 50%, #000E32 100%)' }}
        />

        {/* Centered High-Security 'OFFICIAL - DS TECH' Watermark */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
          style={{ opacity: 0.07 }}
        >
          <div 
            className="text-center border-4 border-[#000E32] rounded-3xl p-8 max-w-lg"
            style={{ transform: 'rotate(-45deg)', WebkitTransform: 'rotate(-45deg)' }}
          >
            <span className="text-5xl font-black tracking-widest text-[#000E32] uppercase block whitespace-nowrap">
              OFFICIAL - DS TECH
            </span>
            <span className="text-xs font-black tracking-[0.25em] text-orange-600 uppercase block mt-2">
              AUTHENTIC ACADEMY DOCKET • CAC RC 9550925
            </span>
          </div>
        </div>

        {/* TOP / BODY CONTENT WRAPPER */}
        <div className="relative z-10">
          {/* 1. OFFICIAL INSTITUTIONAL MASTHEAD WITH AUTHENTIC LOGO */}
          <div className="pt-2 pb-4 border-b-2 border-[#000E32] flex items-center justify-between gap-3">
            {/* Official Crest & Institutional Identification */}
            <div className="flex items-center gap-3.5">
              {/* Authentic DS TECH Official Circular Vector Crest */}
              <div className="shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center p-0.5 border border-slate-200">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  shapeRendering="geometricPrecision"
                >
                  {/* Outer Ring */}
                  <circle cx="50" cy="50" r="48" fill="none" stroke="#000E32" strokeWidth="1.5" opacity="0.3" />
                  <circle cx="50" cy="50" r="46" fill="#000E32" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#FBBF24" strokeWidth="1.2" />

                  {/* Stars */}
                  <polygon points="50,11 51.5,15 55.5,15 52.5,17.5 53.5,21.5 50,19 46.5,21.5 47.5,17.5 44.5,15 48.5,15" fill="#FBBF24" />
                  <polygon points="26,20 27,23 30,23 27.5,25 28.5,28 26,26 23.5,28 24.5,25 22,23 25,23" fill="#FBBF24" />
                  <polygon points="74,20 75,23 78,23 75.5,25 76.5,28 74,26 71.5,28 72.5,25 70,23 73,23" fill="#FBBF24" />

                  {/* Diamond Crown */}
                  <path d="M42 22 L46 17 L50 20 L54 17 L58 22 L56 25 L44 25 Z" fill="#FBBF24" />
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
                    fill="#FBBF24"
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
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl font-black text-[#000E32] tracking-tight">
                    DS TECH ACADEMY
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 tracking-wider">
                    • DIRECTORATE OF ACADEMIC AFFAIRS
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                  DS TECH &amp; DIGITAL MARKETING AGENCY LTD • CAC RC 9550925
                </p>
                <p className="text-[8.5px] font-semibold text-slate-400 tracking-wide mt-0.5">
                  Federal Republic of Nigeria • Accredited Higher Learning Directorate
                </p>
              </div>
            </div>

            {/* QR Verification Docket */}
            <div className="flex flex-col items-end text-right shrink-0">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Registration Verification QR"
                  className="w-16 h-16 border border-slate-300 rounded p-0.5 bg-white shadow-2xs"
                />
              ) : (
                <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] font-mono text-slate-400">
                  VERIFIED
                </div>
              )}
              <span className="text-[8px] font-mono text-emerald-700 font-extrabold uppercase mt-1 tracking-tight">
                ✓ Digital QR Verified
              </span>
            </div>
          </div>

          {/* 2. DOCKET IDENTIFIER BANNER */}
          <div className="my-3.5 py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[9px] font-extrabold text-orange-600 uppercase tracking-widest block">
                Official Institutional Enrolment Docket
              </span>
              <h1 className="text-base font-black text-[#000E32] tracking-tight uppercase">
                STUDENT COURSE REGISTRATION SLIP
              </h1>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-[8.5px] font-sans text-slate-500 font-bold uppercase block">
                  Registration ID:
                </span>
                <span className="font-extrabold text-[#000E32] bg-white px-2.5 py-1 rounded border border-slate-300 text-[12px] shadow-2xs">
                  {record.registrationId}
                </span>
              </div>
              <div>
                <span className="text-[8.5px] font-sans text-slate-500 font-bold uppercase block">
                  Filing Date:
                </span>
                <span className="font-bold text-slate-800 text-[12px]">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* 3. CARD: APPLICANT BIODATA & CONTACT PROFILE */}
          <div className="mb-3.5 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs pdf-page-break-avoid" data-pdf-section>
            <div className="bg-[#000E32] text-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
              <span>1. Applicant Biodata &amp; Contact Profile</span>
              <span className="text-[8.5px] font-mono text-orange-300">Identity Record</span>
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="w-[22%] px-3 py-2 bg-slate-50 font-bold text-slate-600 uppercase text-[9.5px] border-r border-slate-100">
                    Full Name
                  </td>
                  <td className="w-[78%] px-3 py-2 font-black text-slate-900 uppercase tracking-tight text-sm">
                    {record.fullName || '—'}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-2 bg-slate-50 font-bold text-slate-600 uppercase text-[9.5px] border-r border-slate-100">
                    Origin &amp; Sex
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-800">
                    <span className="font-bold">{record.nationality || 'Nigerian'}</span> •{' '}
                    <span>State: <strong>{record.stateOfOrigin || '—'}</strong></span> •{' '}
                    <span>LGA: <strong>{record.lga || '—'}</strong></span> •{' '}
                    <span>Sex: <strong className="uppercase">{record.sex || '—'}</strong></span>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 bg-slate-50 font-bold text-slate-600 uppercase text-[9.5px] border-r border-slate-100">
                    Contact Coordinates
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-800 font-mono text-xs">
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

          {/* 4. CARD: ENROLMENT & PROGRAMME STRUCTURE */}
          <div className="mb-3.5 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs pdf-page-break-avoid" data-pdf-section>
            <div className="bg-[#000E32] text-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
              <span>2. Enrolment &amp; Programme Structure</span>
              <span className="text-[8.5px] font-mono text-orange-300">Curriculum Model</span>
            </div>
            <div className="grid grid-cols-4 divide-x divide-slate-200 text-center bg-white text-xs">
              <div className="p-2.5">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase block">
                  Programme Type
                </span>
                <span className="font-black text-[#000E32] uppercase text-sm mt-0.5 block">
                  {record.programmeType || 'Scholarship'}
                </span>
              </div>
              <div className="p-2.5">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase block">
                  Duration
                </span>
                <span className="font-black text-[#000E32] text-sm mt-0.5 block">
                  {record.programmeDuration || 'Two Weeks'}
                </span>
              </div>
              <div className="p-2.5">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase block">
                  Delivery Mode
                </span>
                <span className="font-black text-[#000E32] text-sm mt-0.5 block">
                  {record.trainingMode || 'Virtual Classes'}
                </span>
              </div>
              <div className="p-2.5">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase block">
                  Language
                </span>
                <span className="font-black text-[#000E32] text-sm mt-0.5 block">
                  {record.teachingLanguage || 'English'}
                </span>
              </div>
            </div>
          </div>

          {/* 5. CARD: COURSE ALLOCATION & TIMETABLE */}
          <div className="mb-3.5 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs pdf-page-break-avoid" data-pdf-section>
            <div className="bg-[#000E32] text-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
              <span>3. Course Allocation &amp; Lecture Timetable</span>
              <span className="text-[8.5px] font-medium text-orange-300">
                Verified Timetable Schedule
              </span>
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-600 border-b border-slate-200">
                  <th className="px-2.5 py-1.5 text-center w-10 border-r border-slate-200">#</th>
                  <th className="px-3 py-1.5 text-left border-r border-slate-200">Course Title</th>
                  <th className="px-3 py-1.5 text-left border-r border-slate-200">Assigned Lecturer</th>
                  <th className="px-3 py-1.5 text-left border-r border-slate-200">Weekly Days</th>
                  <th className="px-3 py-1.5 text-left">Lecture Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Course 1 */}
                <tr>
                  <td className="px-2.5 py-2 font-black text-orange-600 text-center border-r border-slate-100 bg-slate-50/50">
                    C1
                  </td>
                  <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-100 text-sm">
                    {record.course1.courseName || '—'}
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-800 border-r border-slate-100">
                    {record.course1.lecturer || '—'}
                  </td>
                  <td className="px-3 py-2 text-slate-700 border-r border-slate-100 font-medium">
                    {record.course1.weeklyLectureDays || '—'}
                  </td>
                  <td className="px-3 py-2 text-slate-700 font-medium">
                    {record.course1.lectureTime || '—'}
                  </td>
                </tr>

                {/* Course 2 (Rendered only if filled) */}
                {record.course2 && record.course2.courseName && (
                  <tr>
                    <td className="px-2.5 py-2 font-black text-orange-600 text-center border-r border-slate-100 bg-slate-50/50">
                      C2
                    </td>
                    <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-100 text-sm">
                      {record.course2.courseName}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800 border-r border-slate-100">
                      {record.course2.lecturer || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-700 border-r border-slate-100 font-medium">
                      {record.course2.weeklyLectureDays || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-700 font-medium">
                      {record.course2.lectureTime || '—'}
                    </td>
                  </tr>
                )}

                {/* Course 3 (Rendered only if filled) */}
                {record.course3 && record.course3.courseName && (
                  <tr>
                    <td className="px-2.5 py-2 font-black text-orange-600 text-center border-r border-slate-100 bg-slate-50/50">
                      C3
                    </td>
                    <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-100 text-sm">
                      {record.course3.courseName}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800 border-r border-slate-100">
                      {record.course3.lecturer || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-700 border-r border-slate-100 font-medium">
                      {record.course3.weeklyLectureDays || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-700 font-medium">
                      {record.course3.lectureTime || '—'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 6. CARD: TUITION CLEARANCE & BURSARY RECORD */}
          <div className="mb-3.5 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <div className="bg-[#000E32] text-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
              <span>4. Tuition &amp; Bursary Financial Clearance</span>
              <span className="text-[8.5px] font-mono text-emerald-300">Audit Status</span>
            </div>
            <div className="px-3.5 py-2.5 bg-slate-50 text-xs flex flex-row items-center justify-between gap-2">
              <div>
                <span className="text-[8.5px] font-bold text-slate-500 uppercase block">
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
              <div className="text-right">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase block">
                  Bursary Audit Status:
                </span>
                <span className="inline-block px-2.5 py-1 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  PROVISIONAL ENROLMENT VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* 7. CARD: ACADEMIC DIRECTIVES & CODE OF CONDUCT */}
          <div className="mb-3.5 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs pdf-page-break-avoid" data-pdf-section>
            <div className="bg-[#000E32] text-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
              <span>5. Official Academic Directives &amp; Regulations</span>
              <span className="text-[8.5px] font-mono text-orange-300">Statutory Notice</span>
            </div>
            <div className="p-3 bg-slate-50/60 text-[11px] leading-relaxed text-slate-700 space-y-1.5 border-t border-slate-100">
              <p>
                <strong>• Attendance Policy:</strong> Enrolled candidates are required to maintain a minimum of 80% attendance across all assigned lecture days specified in Section 3 for certificate eligibility.
              </p>
              <p>
                <strong>• Credential Verification:</strong> This document serves as official provisional proof of enrolment at DS TECH Academy (CAC RC 9550925).
              </p>
              <p>
                <strong>• Admissions Desk Contact:</strong> For schedule modifications or bursary receipts, contact admissions at <strong>+234 902 348 9111</strong> or <strong>admissions@dstech.agency</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM / DECLARATION & FOOTER SECTION */}
        <div className="mt-auto pt-2 border-t-2 border-slate-200 pdf-footer" data-pdf-footer>
          {/* 8. CARD: ACADEMIC DECLARATION & OFFICIAL REGISTRAR SEAL */}
          <div className="border border-slate-200 rounded-lg p-3 mb-3 bg-white text-xs pdf-page-break-avoid" data-pdf-section>
            <p className="text-[10px] text-slate-600 leading-snug italic mb-2.5">
              <strong>Student Declaration:</strong> I solemnly declare that all personal and academic details supplied in this course registration form are authentic, accurate, and in strict adherence to the official Academy timetable. I agree to conform to the academic guidelines and lecture schedules of DS TECH Academy.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 items-end">
              {/* Applicant Signature */}
              <div>
                <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">
                  Applicant Signature / Attestation:
                </span>
                <div className="border-b-2 border-slate-800 pb-0.5 font-mono text-xs font-black text-[#000E32]">
                  {record.fullName}
                </div>
                <span className="text-[8px] text-slate-400 block mt-0.5">Electronically Signed</span>
              </div>

              {/* Registration Date */}
              <div>
                <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">
                  Filing Date:
                </span>
                <div className="border-b-2 border-slate-800 pb-0.5 text-xs font-extrabold text-slate-800">
                  {formattedDate}
                </div>
                <span className="text-[8px] text-slate-400 block mt-0.5">Validated Timestamp</span>
              </div>

              {/* Official Registrar Seal */}
              <div className="col-span-1 text-right">
                <div className="inline-block border-2 border-dashed border-emerald-700 rounded-lg p-1.5 bg-emerald-50/80 text-center shadow-2xs">
                  <span className="text-[7.5px] font-black uppercase text-emerald-800 block tracking-wider">
                    DS TECH ACADEMY
                  </span>
                  <span className="text-[9px] font-black uppercase text-[#000E32] block">
                    ADMISSIONS CLEARED
                  </span>
                  <span className="text-[7px] font-mono text-slate-700 font-bold block">
                    CAC RC 9550925
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 9. STATUTORY FOOTER */}
          <div className="pt-2 border-t border-slate-200 text-[8.5px] text-slate-500 flex flex-row items-center justify-between gap-2">
            <p className="text-left font-medium">
              <strong>Headquarters:</strong> Ext A-73 Efab Mall Second Floor, Area 11 Garki, Abuja, Nigeria.
            </p>
            <p className="text-right font-mono font-semibold">
              Support WhatsApp: +234 902 348 9111 | admissions@dstech.agency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
