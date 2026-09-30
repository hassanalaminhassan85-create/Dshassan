import React, { useState, useEffect } from 'react';
import { EmploymentCertificate } from '../../types';
import { buildCertificateVerificationUrl, generateQrDataUrl } from '../../lib/certificateQrUtility';

interface CertificateDocumentProps {
  certificate: Partial<EmploymentCertificate>;
  qrCodeDataUrl?: string;
  id?: string;
  className?: string;
  onSignClick?: () => void;
  interactive?: boolean;
}

export const CertificateOfEmploymentDocument: React.FC<CertificateDocumentProps> = ({
  certificate,
  qrCodeDataUrl,
  id = 'ds-certificate-of-employment-document',
  className = '',
  onSignClick,
  interactive = false,
}) => {
  // Format dynamic values or fallback to uppercase placeholders if empty
  const appRefNo = certificate.appointmentRefNo || certificate.certificateNumber || 'DST/COE/2026/0001';
  const employeeId = certificate.employeeId || '[EMPLOYEE ID]';
  const employeeName = certificate.employeeName || '[FULL NAME]';
  const position = certificate.position || '[POSITION]';
  const department = certificate.department || '[DEPARTMENT]';
  const dateOfAppointment = certificate.dateOfAppointment || '[DATE]';
  const dateOfConfirmation = certificate.dateOfConfirmation || certificate.issueDate || certificate.dateOfAppointment || '[DATE]';
  const issueDate = certificate.issueDate || '[DATE]';
  const verificationCode = certificate.verificationCode || 'DST-VRF-000000-XX';

  // CEO Signatory Details
  const ceoName = certificate.ceoSignatoryName || certificate.authorizedOfficerName || 'Dr. Donald S.';
  const ceoTitle = certificate.ceoSignatureTitle || certificate.authorizedOfficerPosition || 'Company Director/CEO';

  const [activeQr, setActiveQr] = useState<string>(qrCodeDataUrl || '');

  useEffect(() => {
    if (qrCodeDataUrl) {
      setActiveQr(qrCodeDataUrl);
    } else {
      const targetUrl = certificate.qrVerificationUrl || buildCertificateVerificationUrl(verificationCode);
      generateQrDataUrl(targetUrl, {
        size: 320,
        margin: 1,
        errorCorrectionLevel: 'M',
        darkColor: '#000E32',
        lightColor: '#FFFFFF',
      })
        .then(setActiveQr)
        .catch((err) => console.warn('[Certificate Document] QR fallback notice:', err));
    }
  }, [qrCodeDataUrl, verificationCode, certificate.qrVerificationUrl]);

  return (
    <div
      id={id}
      className={`relative bg-white text-slate-900 overflow-hidden font-sans select-none box-border ${className}`}
      style={{
        width: '794px',
        minWidth: '794px',
        maxWidth: '794px',
        height: '1123px',
        minHeight: '1123px',
        maxHeight: '1123px',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ========================================================= */}
      {/* 1. OUTER ELEGANT GOLDEN FRAMING BORDER & CORNER ACCENTS   */}
      {/* ========================================================= */}
      <div
        className="absolute inset-[11px] pointer-events-none z-10"
        style={{
          border: '3.5px solid #C89B3C',
          borderRadius: '2px',
        }}
      >
        {/* Inner delicate hairline border */}
        <div
          className="absolute inset-[3.5px]"
          style={{
            border: '1px solid #D4AF37',
            opacity: 0.75,
          }}
        />
      </div>

      {/* Top-Left Corner Geometric Wing Accent */}
      <div className="absolute top-[11px] left-[11px] z-20 pointer-events-none">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <polygon points="0,0 72,0 0,72" fill="url(#goldCornerGrad)" opacity="0.95" />
          <polygon points="0,0 52,0 0,52" fill="#0A2558" />
          <line x1="0" y1="58" x2="58" y2="0" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.85" />
          <line x1="0" y1="64" x2="64" y2="0" stroke="#FFA000" strokeWidth="1.6" />
        </svg>
      </div>

      {/* Top-Right Corner Geometric Wing Accent */}
      <div className="absolute top-[11px] right-[11px] z-20 pointer-events-none">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <polygon points="72,0 0,0 72,72" fill="url(#goldCornerGrad)" opacity="0.95" />
          <polygon points="72,0 20,0 72,52" fill="#0A2558" />
          <line x1="72" y1="58" x2="14" y2="0" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.85" />
          <line x1="72" y1="64" x2="8" y2="0" stroke="#FFA000" strokeWidth="1.6" />
        </svg>
      </div>

      {/* SVG Definitions for Gradients used across the Certificate */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="goldCornerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#C89B3C" />
          </linearGradient>

          <linearGradient id="sealMetallicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="25%" stopColor="#FFB300" />
            <stop offset="50%" stopColor="#FFC107" />
            <stop offset="75%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>
        </defs>
      </svg>

      {/* ========================================================= */}
      {/* MAIN CONTENT CONTAINER (Inset from outer border)          */}
      {/* Fully populated balanced vertical flow filling the A4     */}
      {/* ========================================================= */}
      <div className="relative z-20 flex flex-col justify-between h-full pt-[26px] px-[42px] pb-[72px] box-border">

        {/* TOP SECTION: Header + Title Banner */}
        <div>
          {/* ========================================================= */}
          {/* 2. TOP HEADER: LOGO & CORPORATE CONTACT INFOS            */}
          {/* ========================================================= */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
            
            {/* Header Left: Official DS Tech Vector Logo & Brand Title */}
            <div className="flex items-center gap-3.5">
              {/* Circular DS Tech Emblem with bursting pixels */}
              <div className="relative w-[92px] h-[92px] shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
                  {/* Digital Pixel / Block cluster exploding from top right */}
                  <rect x="58" y="16" width="7.5" height="7.5" fill="#F25C05" rx="1" />
                  <rect x="68" y="9" width="8.5" height="8.5" fill="#F25C05" rx="1" />
                  <rect x="78" y="4" width="9.5" height="9.5" fill="#F25C05" rx="1.5" />
                  <rect x="68" y="20" width="7.5" height="7.5" fill="#FFA000" rx="1" />
                  <rect x="78" y="15" width="8.5" height="8.5" fill="#FF8000" rx="1" />
                  <rect x="87" y="11" width="7.5" height="7.5" fill="#F25C05" rx="1" />
                  <rect x="78" y="26" width="6.5" height="6.5" fill="#FFA000" rx="1" />
                  <rect x="86" y="21" width="7.5" height="7.5" fill="#F25C05" rx="1" />

                  {/* Outer Main Blue Ring Shield */}
                  <circle cx="44" cy="52" r="39" stroke="#002D62" strokeWidth="5.5" fill="none" />
                  <circle cx="44" cy="52" r="35" fill="#002D62" />

                  {/* Inner Stylized Cursive White 'DS' Monogram */}
                  <text
                    x="44"
                    y="64"
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="900"
                    fontSize="33"
                    fontStyle="italic"
                    letterSpacing="-1.5"
                    fill="#FFFFFF"
                  >
                    DS
                  </text>
                </svg>
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col text-left">
                <h1
                  className="font-black text-[#002D62] text-[32px] leading-none tracking-[0.03em] uppercase"
                  style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  DS TECH
                </h1>
                
                <p
                  className="text-[12px] font-black text-[#002D62] tracking-[0.16em] uppercase mt-1"
                  style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  AND DIGITAL MARKETING
                </p>

                {/* Orange Divider with AGENCY LIMITED */}
                <div className="flex items-center gap-2 my-1">
                  <div className="h-[1.8px] w-8 bg-[#E8590C]" />
                  <span className="text-[11px] font-black text-[#E8590C] tracking-[0.16em] uppercase">
                    AGENCY LIMITED
                  </span>
                  <div className="h-[1.8px] w-8 bg-[#E8590C]" />
                </div>

                <p className="text-[10px] font-medium text-slate-600 tracking-normal italic">
                  Empowering Brands &amp; Talents with Tech &amp; Digital Excellence
                </p>
              </div>
            </div>

            {/* Header Right: Official Headquarters & Contact Details */}
            <div className="text-left text-[10.5px] text-slate-700 space-y-1 pr-1 font-medium leading-tight">
              <div className="flex items-start gap-1.5">
                <span className="text-[#E8590C] text-[11px] shrink-0 mt-[1px]">📍</span>
                <div className="leading-tight">
                  <span className="font-semibold text-slate-800">Ext A-73 Efab Mall</span><br />
                  <span>Second Floor Area 10</span><br />
                  <span>Garki, Abuja, Nigeria</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#E8590C] text-[11px] shrink-0">📞</span>
                <span className="font-semibold text-slate-800 tracking-wide">09023489111</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#E8590C] text-[11px] shrink-0">✉️</span>
                <span className="font-medium text-slate-700">dstechanddigitalmarketingltd@gmail.com</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#E8590C] text-[11px] shrink-0">🌐</span>
                <span className="font-semibold text-[#002D62]">www.dstech.com.ng</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* 3. PRIMARY TITLE BANNER (Exact Match to Reference Image)   */}
          {/* ========================================================= */}
          <div className="relative mt-3.5 mb-4 flex items-center justify-center">
            {/* Chamfered Ribbon with Golden Chevrons */}
            <div className="relative w-full max-w-[700px] h-[76px] flex items-center justify-center">
              
              {/* Left Gold Chevron Tip */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[30px]"
                style={{
                  clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                }}
              />

              {/* Main Navy Body */}
              <div
                className="w-full h-full mx-[16px] flex flex-col items-center justify-center relative shadow-md px-6"
                style={{
                  backgroundColor: '#061A40',
                  clipPath: 'polygon(18px 0%, calc(100% - 18px) 0%, 100% 50%, calc(100% - 18px) 100%, 18px 100%, 0% 50%)',
                  borderTop: '2.5px solid #D4AF37',
                  borderBottom: '2.5px solid #D4AF37',
                }}
              >
                {/* Thin Inner Golden Accent Hairline */}
                <div
                  className="absolute inset-[3.5px] pointer-events-none"
                  style={{
                    clipPath: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 50%, calc(100% - 16px) 100%, 16px 100%, 0% 50%)',
                    borderTop: '1px solid rgba(255, 215, 0, 0.45)',
                    borderBottom: '1px solid rgba(255, 215, 0, 0.45)',
                  }}
                />

                <h2
                  className="text-white font-extrabold uppercase tracking-[0.16em] text-[23px] leading-tight text-center drop-shadow-sm"
                  style={{ fontFamily: "'Cinzel', 'Times New Roman', serif" }}
                >
                  CONFIRMATION CERTIFICATE
                </h2>
                <h3
                  className="text-white font-extrabold uppercase tracking-[0.20em] text-[20px] leading-tight text-center drop-shadow-sm mt-0.5"
                  style={{ fontFamily: "'Cinzel', 'Times New Roman', serif" }}
                >
                  OF EMPLOYMENT
                </h3>
              </div>

              {/* Right Gold Chevron Tip */}
              <div
                className="absolute right-0 top-0 bottom-0 w-[30px]"
                style={{
                  clipPath: 'polygon(100% 50%, 0% 0%, 0% 100%)',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                }}
              />
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Key-Value Grid + Main Paragraph + Terms */}
        <div className="flex-1 flex flex-col justify-between py-1">
          
          {/* ========================================================= */}
          {/* 4. KEY-VALUE DETAILS GRID (7 Exact Rows) + WATERMARK      */}
          {/* ========================================================= */}
          <div className="relative px-6 py-2">
            
            {/* Faint Background Monogram Watermark matching Image */}
            <div className="absolute right-8 top-[-10px] w-[270px] h-[270px] opacity-[0.065] pointer-events-none select-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="46" stroke="#002D62" strokeWidth="8" fill="none" />
                <text
                  x="50"
                  y="65"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                  fontWeight="900"
                  fontSize="44"
                  fontStyle="italic"
                  fill="#002D62"
                >
                  DS
                </text>
              </svg>
            </div>

            {/* 7 Key-Value Details Rows with Generous Legible Proportions */}
            <div className="space-y-3.5 text-[14.5px] relative z-10 text-left">
              <div className="flex items-center">
                <span className="w-[255px] font-bold text-slate-800">Appointment Reference No.</span>
                <span className="w-[22px] font-bold text-slate-700">:</span>
                <span className="font-black text-[#002D62] text-[15.5px] tracking-wide">{appRefNo}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold text-slate-800">Employee ID</span>
                <span className="w-[22px] font-bold text-slate-700">:</span>
                <span className="font-black text-[#002D62] text-[15.5px] tracking-wide">{employeeId}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold text-slate-800">Employee Name</span>
                <span className="w-[22px] font-bold text-slate-700">:</span>
                <span className="font-black text-[#002D62] text-[15.5px] uppercase tracking-wide">{employeeName}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold text-slate-800">Position/Designation</span>
                <span className="w-[22px] font-bold text-slate-700">:</span>
                <span className="font-black text-[#002D62] text-[15px]">{position}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold text-slate-800">Department</span>
                <span className="w-[22px] font-bold text-slate-700">:</span>
                <span className="font-black text-[#002D62] text-[15px] uppercase">{department}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold text-slate-800">Date of Initial Appointment</span>
                <span className="w-[22px] font-bold text-slate-700">:</span>
                <span className="font-black text-[#002D62] text-[15px]">{dateOfAppointment}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold text-slate-800">Date of Confirmation</span>
                <span className="w-[22px] font-bold text-slate-700">:</span>
                <span className="font-black text-[#002D62] text-[15px]">{dateOfConfirmation}</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 5. MAIN CONFIRMATION PARAGRAPH (Exact Text from Image)    */}
            {/* ========================================================= */}
            <div className="mt-4 pt-1 text-left text-[14.5px] leading-[1.75] text-slate-800 font-normal">
              This is to formally certify that{' '}
              <strong className="font-black text-[#002D62] uppercase">{employeeName}</strong>{' '}
              is hereby confirmed in employment as{' '}
              <strong className="font-black text-[#002D62] uppercase">{position}</strong>{' '}
              with{' '}
              <strong className="font-black text-[#002D62]">DS Tech and Digital Marketing Agency Limited</strong>, effective{' '}
              <strong className="font-black text-[#002D62]">{dateOfConfirmation}</strong>.
            </div>

          </div>

          {/* ========================================================= */}
          {/* 6. CONFIRMATION TERMS & CONDITIONS SECTION (Exact Image)  */}
          {/* ========================================================= */}
          <div className="px-2 mt-1">
            
            {/* Section Chamfered Mini-Banner */}
            <div className="relative inline-flex items-center h-[36px] mb-3">
              <div
                className="h-full px-5 flex items-center justify-center relative shadow-sm"
                style={{
                  backgroundColor: '#061A40',
                  clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%)',
                  borderTop: '1.5px solid #D4AF37',
                  borderBottom: '1.5px solid #D4AF37',
                }}
              >
                <span className="text-white text-[12.5px] font-extrabold uppercase tracking-[0.12em]">
                  CONFIRMATION TERMS &amp; CONDITIONS
                </span>
              </div>

              {/* Right Mini Chevron Tip */}
              <div
                className="w-[18px] h-full"
                style={{
                  clipPath: 'polygon(100% 50%, 0% 0%, 0% 100%)',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  marginLeft: '-2px',
                }}
              />
            </div>

            {/* 3 Terms with Orange Number Badges */}
            <div className="space-y-3 text-left text-[12.8px] leading-[1.58] text-slate-700 font-medium pl-1">
              
              {/* Term 1 */}
              <div className="flex items-start gap-2.5">
                <div className="w-[22px] h-[22px] rounded-full bg-[#E8590C] text-white shrink-0 flex items-center justify-center font-black text-[11px] mt-[1.5px] shadow-sm">
                  1
                </div>
                <p>
                  The confirmation is subject to the employee's continued compliance with the policies, procedures, professional standards, confidentiality requirements, and terms of engagement of DS Tech and Digital Marketing Agency Limited.
                </p>
              </div>

              {/* Term 2 */}
              <div className="flex items-start gap-2.5">
                <div className="w-[22px] h-[22px] rounded-full bg-[#E8590C] text-white shrink-0 flex items-center justify-center font-black text-[11px] mt-[1.5px] shadow-sm">
                  2
                </div>
                <p>
                  The employment remains subject to satisfactory performance and the applicable conditions of service of the organization.
                </p>
              </div>

              {/* Term 3 */}
              <div className="flex items-start gap-2.5">
                <div className="w-[22px] h-[22px] rounded-full bg-[#E8590C] text-white shrink-0 flex items-center justify-center font-black text-[11px] mt-[1.5px] shadow-sm">
                  3
                </div>
                <p>
                  This certificate is issued as an official record and confirmation of the employee's continued employment and appointment with DS Tech and Digital Marketing Agency Limited.
                </p>
              </div>

            </div>

            {/* Issuance Date Line */}
            <div className="mt-3.5 text-left text-[14px] font-bold text-slate-800">
              Issued this <span className="font-black text-[#002D62]">{issueDate}</span>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: Official Authorization (Signature, Seal, Verification) */}
        <div className="mt-2 px-2">
          
          <h3
            className="text-left font-black text-[14px] uppercase tracking-[0.12em] text-[#002D62] mb-2"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            OFFICIAL AUTHORIZATION
          </h3>

          <div className="grid grid-cols-12 gap-3.5 items-end">
            
            {/* Left Column: Official Executive Signature & Title */}
            <div className="col-span-5 text-left">
              <div
                className={`h-[68px] flex items-end mb-2 ${interactive || onSignClick ? 'cursor-pointer group relative' : ''}`}
                onClick={onSignClick}
                title={interactive || onSignClick ? 'Click to open CEO Signature Suite' : undefined}
              >
                {certificate.signatureDataUrl ? (
                  <img
                    src={certificate.signatureDataUrl}
                    alt="CEO Executive Signature"
                    crossOrigin="anonymous"
                    className="max-h-[66px] max-w-[210px] object-contain object-bottom drop-shadow-xs"
                  />
                ) : (
                  /* Director's Authentic Executive Blue Ink Signature (Vector Reproduction) */
                  <svg width="200" height="66" viewBox="0 0 200 66" fill="none" className="overflow-visible">
                    {/* Capital Initial Loop Flourish */}
                    <path
                      d="M 22 52 C 16 40, 18 18, 28 14 C 38 10, 48 16, 42 32 C 36 46, 26 52, 22 46 C 18 40, 20 26, 34 20 C 48 14, 62 20, 64 32 C 66 42, 60 50, 50 50"
                      stroke="#002D62"
                      strokeWidth="3.0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Flowing Cursive Letterforms */}
                    <path
                      d="M 50 48 C 55 40, 60 30, 68 32 C 76 34, 72 44, 80 42 C 88 40, 90 32, 98 30 C 106 28, 104 40, 112 38 C 120 36, 122 24, 128 22 C 134 20, 130 40, 138 38 C 146 36, 154 30, 164 28"
                      stroke="#002D62"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Dot on the letter i */}
                    <circle cx="128" cy="14" r="2.6" fill="#002D62" />
                    {/* Dynamic Underline Flourish with Hook */}
                    <path
                      d="M 18 56 C 48 60, 102 58, 172 48 C 184 46, 194 42, 198 40"
                      stroke="#002D62"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 188 42 L 198 40 L 192 49"
                      stroke="#002D62"
                      strokeWidth="2.0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {(interactive || onSignClick) && (
                  <span className="absolute -top-3 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[#000E32] text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider pointer-events-none shadow-sm z-30">
                    ✍️ Change Signature
                  </span>
                )}
              </div>

              {/* Signatory Details Hierarchy */}
              <div className="text-left text-slate-800 leading-tight">
                <p className="font-black text-[#002D62] text-[13px] tracking-wide">
                  {ceoName}
                </p>
                <p className="font-extrabold text-[#002D62] text-[11.5px] mt-0.5">
                  {ceoTitle}
                </p>
                <p className="font-semibold text-slate-700 mt-0.5 text-[10.5px]">
                  DS Tech and Digital Marketing Agency Limited
                </p>
                <p className="text-slate-600 font-medium text-[10px]">
                  Abuja, Nigeria
                </p>
              </div>
            </div>

            {/* Middle Column: Scalloped Golden Embossed Official Seal (Exact Match) */}
            <div className="col-span-3 flex justify-center">
              <div className="relative w-[130px] h-[130px]">
                <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md overflow-visible">
                  {/* Sunburst Scalloped Outer Teeth (32 teeth) */}
                  <g fill="url(#sealMetallicGrad)">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <polygon
                        key={i}
                        points="60,3 63,12 57,12"
                        transform={`rotate(${i * 11.25} 60 60)`}
                      />
                    ))}
                  </g>

                  {/* Concentric Golden Discs */}
                  <circle cx="60" cy="60" r="52" fill="url(#sealMetallicGrad)" stroke="#B45309" strokeWidth="1" />
                  <circle cx="60" cy="60" r="48" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
                  <circle cx="60" cy="60" r="44" fill="none" stroke="#D97706" strokeWidth="0.8" strokeDasharray="2 2" />

                  {/* Inner Blue Shield */}
                  <circle cx="60" cy="46" r="17" fill="#002D62" stroke="#F59E0B" strokeWidth="1.2" />
                  <text
                    x="60"
                    y="52"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="sans-serif"
                    fontWeight="900"
                    fontSize="13"
                    fontStyle="italic"
                  >
                    DS
                  </text>

                  {/* Text: DS TECH */}
                  <text
                    x="60"
                    y="70"
                    textAnchor="middle"
                    fill="#92400E"
                    fontFamily="sans-serif"
                    fontWeight="900"
                    fontSize="8.5"
                    letterSpacing="0.8"
                  >
                    DS TECH
                  </text>

                  <text
                    x="60"
                    y="76"
                    textAnchor="middle"
                    fill="#B45309"
                    fontFamily="sans-serif"
                    fontWeight="700"
                    fontSize="4"
                    letterSpacing="0.3"
                  >
                    AND DIGITAL MARKETING AGENCY LIMITED
                  </text>

                  {/* 5 Golden Stars */}
                  <g fill="#D97706">
                    {[-14, -7, 0, 7, 14].map((offset, idx) => (
                      <text
                        key={idx}
                        x={60 + offset}
                        y="82"
                        textAnchor="middle"
                        fontSize="6"
                        fontWeight="bold"
                      >
                        ★
                      </text>
                    ))}
                  </g>

                  {/* Curved / Boxed Banner: OFFICIAL SEAL */}
                  <rect x="22" y="86" width="76" height="12" rx="3" fill="#D97706" />
                  <text
                    x="60"
                    y="94.5"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="sans-serif"
                    fontWeight="900"
                    fontSize="7"
                    letterSpacing="1"
                  >
                    OFFICIAL SEAL
                  </text>
                </svg>
              </div>
            </div>

            {/* Right Column: Verification Box with QR Code & Brand Slogan */}
            <div className="col-span-4 flex flex-col items-end">
              
              {/* Verification Box */}
              <div className="w-full border-[1.5px] border-[#061A40] rounded-lg p-2.5 bg-white flex items-center justify-between gap-2 shadow-xs">
                
                {/* Left side info */}
                <div className="text-left space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1 text-[#002D62]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#002D62">
                      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 16L6.5 12.5L7.91 11.09L10 13.17L16.09 7.08L17.5 8.5L10 16Z" fill="#002D62"/>
                    </svg>
                    <span className="text-[8px] font-black uppercase text-[#002D62] tracking-wider">
                      Certificate Verification:
                    </span>
                  </div>

                  <p className="text-[9.5px] font-black text-[#002D62] truncate tracking-tight">
                    [{verificationCode}]
                  </p>

                  <p className="text-[7.5px] text-slate-500 leading-tight">
                    Scan QR or visit our website to verify this certificate.
                  </p>
                </div>

                {/* Right side QR Code */}
                <div className="w-[58px] h-[58px] shrink-0 border border-slate-200 rounded p-[1px] bg-white flex items-center justify-center overflow-hidden">
                  {(activeQr || qrCodeDataUrl) ? (
                    <img
                      src={activeQr || qrCodeDataUrl}
                      alt="Verification QR"
                      crossOrigin="anonymous"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[7px] text-slate-400">
                      QR
                    </div>
                  )}
                </div>

              </div>

              {/* Brand Motto underneath matching Image */}
              <div className="mt-2 text-right text-[10px] italic text-[#002D62] font-semibold leading-tight pr-1">
                <p>Building Brands | Growing Talents</p>
                <p>Creating Impact</p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 8. DYNAMIC GOLDEN SWOOP ACCENT & SOLID NAVY FOOTER BAR     */}
      {/* ========================================================= */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
        {/* Dynamic Curved Ribbon Swoop */}
        <div className="relative w-full h-[22px]">
          <svg
            viewBox="0 0 794 22"
            preserveAspectRatio="none"
            className="w-full h-full block"
          >
            {/* Golden flowing ribbon highlight */}
            <path
              d="M 0 14 Q 220 0, 500 12 T 794 4 L 794 22 L 0 22 Z"
              fill="#D4AF37"
            />
            {/* Orange gradient accent strip */}
            <path
              d="M 0 17 Q 240 4, 530 16 T 794 8 L 794 22 L 0 22 Z"
              fill="#E8590C"
            />
          </svg>
        </div>

        {/* Solid Navy Blue Bottom Bar */}
        <div
          className="w-full py-2.5 px-6 flex items-center justify-center gap-6 text-[10px] text-white font-medium tracking-wide shadow-md"
          style={{ backgroundColor: '#061A40' }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[#FFA000] text-[10.5px]">🌐</span>
            <span>www.dstech.com.ng</span>
          </div>

          <span className="text-slate-400 font-bold opacity-60">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#FFA000] text-[10.5px]">📞</span>
            <span>09023489111</span>
          </div>

          <span className="text-slate-400 font-bold opacity-60">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#FFA000] text-[10.5px]">✉️</span>
            <span>dstechanddigitalmarketingltd@gmail.com</span>
          </div>
        </div>
      </div>

    </div>
  );
};
