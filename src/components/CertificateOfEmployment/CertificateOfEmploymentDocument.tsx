import React, { useState, useEffect } from 'react';
import { EmploymentCertificate } from '../../types';
import { buildCertificateVerificationUrl, generateQrDataUrl } from '../../lib/certificateQrUtility';
import officialLogoImg from '../../assets/images/exact_ds_tech_logo_1788790934101.jpg';
import { Logo } from '../Logo';

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
  const appRefNo =
    certificate.appointmentRefNo ||
    certificate.certificateNumber ||
    (certificate.employeeName ? `DST/COE/${new Date().getFullYear()}/` : 'DST/COE/2026/----');
  const employeeId = certificate.employeeId || '[EMPLOYEE ID]';
  const employeeName = certificate.employeeName || '[FULL NAME]';
  const position = certificate.position || '[POSITION]';
  const department = certificate.department || '[DEPARTMENT]';
  const dateOfAppointment = certificate.dateOfAppointment || '[DATE]';
  const dateOfConfirmation = certificate.dateOfConfirmation || certificate.issueDate || certificate.dateOfAppointment || '[DATE]';
  const issueDate = certificate.issueDate || '[DATE]';
  const verificationCode = certificate.verificationCode || 'DST-VRF-000000-XX';

  // CEO Signatory Details
  const ceoName = certificate.ceoSignatoryName || certificate.authorizedOfficerName || '';
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
      className={`relative overflow-hidden font-sans select-none box-border ${className}`}
      style={{
        width: '794px',
        minWidth: '794px',
        maxWidth: '794px',
        height: '1123px',
        minHeight: '1123px',
        maxHeight: '1123px',
        backgroundColor: '#FFFFFF',
        color: '#1E293B',
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
          <defs>
            <linearGradient id="goldCornerGradTL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA000" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#C89B3C" />
            </linearGradient>
          </defs>
          <polygon points="0,0 72,0 0,72" fill="url(#goldCornerGradTL)" opacity="0.95" />
          <polygon points="0,0 52,0 0,52" fill="#0A2558" />
          <line x1="0" y1="58" x2="58" y2="0" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.85" />
          <line x1="0" y1="64" x2="64" y2="0" stroke="#FFA000" strokeWidth="1.6" />
        </svg>
      </div>

      {/* Top-Right Corner Geometric Wing Accent */}
      <div className="absolute top-[11px] right-[11px] z-20 pointer-events-none">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <defs>
            <linearGradient id="goldCornerGradTR" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA000" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#C89B3C" />
            </linearGradient>
          </defs>
          <polygon points="72,0 0,0 72,72" fill="url(#goldCornerGradTR)" opacity="0.95" />
          <polygon points="72,0 20,0 72,52" fill="#0A2558" />
          <line x1="72" y1="58" x2="14" y2="0" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.85" />
          <line x1="72" y1="64" x2="8" y2="0" stroke="#FFA000" strokeWidth="1.6" />
        </svg>
      </div>

      {/* Global Fallback Gradients */}
      <svg width="0" height="0" className="absolute" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="goldCornerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#C89B3C" />
          </linearGradient>

          <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
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
      <div
        className="relative z-20 flex flex-col justify-between h-full pt-[26px] px-[42px] pb-[72px] box-border"
        style={{
          width: '794px',
          boxSizing: 'border-box',
        }}
      >
        {/* ========================================================= */}
        {/* OFFICIAL WATERMARK IN THE MIDDLE (Centered on A4 Canvas)   */}
        {/* Uses Official DS Tech Logo maintaining exact size         */}
        {/* ========================================================= */}
        <div
          className="pointer-events-none select-none flex items-center justify-center"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '380px',
            minWidth: '380px',
            maxWidth: '380px',
            height: '380px',
            minHeight: '380px',
            maxHeight: '380px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          aria-hidden="true"
        >
          {/* Authentic DS Tech Official Logo Watermark */}
          <img
            src={officialLogoImg || '/official-logo.jpg'}
            alt="Official Watermark"
            crossOrigin="anonymous"
            style={{
              width: '380px',
              height: '380px',
              objectFit: 'contain',
              borderRadius: '50%',
              opacity: 0.07,
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* TOP SECTION: Header + Title Banner */}
        <div>
          {/* ========================================================= */}
          {/* 2. TOP HEADER: LOGO & CORPORATE CONTACT INFOS            */}
          {/* ========================================================= */}
          <div
            className="pb-3"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderBottom: '1px solid #E2E8F0',
              boxSizing: 'border-box',
            }}
          >
            
            {/* Header Left: Official DS Tech Logo & Brand Title */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '14px',
                flexShrink: 0,
                width: '450px',
              }}
            >
              {/* Circular Official DS Tech Emblem */}
              <div style={{ width: '90px', height: '90px', flexShrink: 0, position: 'relative' }}>
                <img
                  src={officialLogoImg || '/official-logo.jpg'}
                  alt="DS Tech Official Logo"
                  crossOrigin="anonymous"
                  style={{
                    width: '90px',
                    height: '90px',
                    objectFit: 'contain',
                    borderRadius: '50%',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.getElementById('ds-cert-header-fallback-logo');
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div id="ds-cert-header-fallback-logo" style={{ display: 'none', width: '90px', height: '90px' }}>
                  <Logo size="lg" showText={false} />
                </div>
              </div>

              {/* Brand Typography */}
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <h1
                  style={{
                    margin: 0,
                    padding: 0,
                    color: '#002D62',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 900,
                    fontSize: '32px',
                    lineHeight: 1,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  DS TECH
                </h1>
                
                <p
                  style={{
                    margin: '3px 0 0 0',
                    padding: 0,
                    color: '#002D62',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 900,
                    fontSize: '12px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  AND DIGITAL MARKETING
                </p>

                {/* Orange Divider with AGENCY LIMITED */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', margin: '3px 0' }}>
                  <div style={{ height: '1.8px', width: '32px', backgroundColor: '#E8590C' }} />
                  <span
                    style={{
                      color: '#E8590C',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontWeight: 900,
                      fontSize: '10.5px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                    }}
                  >
                    AGENCY LIMITED
                  </span>
                  <div style={{ height: '1.8px', width: '32px', backgroundColor: '#E8590C' }} />
                </div>

                <p
                  style={{
                    margin: 0,
                    padding: 0,
                    color: '#64748B',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: '9.2px',
                    fontStyle: 'italic',
                  }}
                >
                  Empowering Brands &amp; Talents with Tech &amp; Digital Excellence
                </p>
              </div>
            </div>

            {/* Header Right: Official Headquarters & Contact Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '240px',
                flexShrink: 0,
                color: '#334155',
                fontSize: '10.5px',
                lineHeight: 1.25,
                fontWeight: 500,
                textAlign: 'left',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: '#E8590C', fontSize: '11px', flexShrink: 0, marginTop: '1px' }}>📍</span>
                <div style={{ lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>Ext A-73 Efab Mall</span><br />
                  <span>Second Floor Area 10</span><br />
                  <span>Garki, Abuja, Nigeria</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#E8590C', fontSize: '11px', flexShrink: 0 }}>📞</span>
                <span style={{ fontWeight: 600, color: '#1E293B', letterSpacing: '0.02em' }}>09023489111</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#E8590C', fontSize: '11px', flexShrink: 0 }}>✉️</span>
                <span style={{ fontWeight: 500, color: '#334155' }}>dstechanddigitalmarketingltd@gmail.com</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#E8590C', fontSize: '11px', flexShrink: 0 }}>🌐</span>
                <span style={{ fontWeight: 600, color: '#002D62' }}>www.dstech.com.ng</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* 3. PRIMARY TITLE BANNER (100% Native SVG Vector Ribbon)   */}
          {/* ========================================================= */}
          <div className="relative mt-3.5 mb-4 flex items-center justify-center w-full" style={{ width: '100%' }}>
            {/* Pure SVG Ribbon Vector with Gold Chevrons and Golden Borders - Zero clipPath */}
            <div className="relative w-full max-w-[710px] h-[76px] flex items-center justify-center">
              
              <svg
                viewBox="0 0 710 76"
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
                {/* Left Gold Chevron Tip */}
                <polygon points="0,38 30,0 30,76" fill="url(#goldRibbonGrad)" />

                {/* Right Gold Chevron Tip */}
                <polygon points="710,38 680,0 680,76" fill="url(#goldRibbonGrad)" />

                {/* Main Navy Body with chamfered pointed ends */}
                <polygon
                  points="30,0 680,0 696,38 680,76 30,76 14,38"
                  fill="#061A40"
                  stroke="#D4AF37"
                  strokeWidth="2.5"
                />

                {/* Inner Golden Hairline */}
                <polygon
                  points="33,3.5 677,3.5 692,38 677,72.5 33,72.5 18,38"
                  fill="none"
                  stroke="#FFE082"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
              </svg>

              {/* Title Typography overlay */}
              <div className="relative z-10 flex flex-col items-center justify-center px-8 text-center">
                <h2
                  className="font-extrabold uppercase tracking-[0.20em] text-[25px] leading-tight text-center drop-shadow-sm"
                  style={{ color: '#FFFFFF', fontFamily: "'Cinzel', 'Times New Roman', serif" }}
                >
                  CERTIFICATE OF EMPLOYMENT
                </h2>
              </div>

            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Key-Value Grid + Main Paragraph + Terms */}
        <div className="flex-1 flex flex-col justify-between py-1">
          
          {/* ========================================================= */}
          {/* 4. KEY-VALUE DETAILS GRID (7 Exact Rows)                  */}
          {/* ========================================================= */}
          <div className="relative px-6 py-2">

            {/* 7 Key-Value Details Rows with Generous Legible Proportions */}
            <div className="space-y-3.5 text-[14.5px] relative z-10 text-left">
              <div className="flex items-center">
                <span className="w-[255px] font-bold" style={{ color: '#1E293B' }}>Appointment Reference No.</span>
                <span className="w-[22px] font-bold" style={{ color: '#334155' }}>:</span>
                <span className="font-black text-[15.5px] tracking-wide" style={{ color: '#002D62' }}>{appRefNo}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold" style={{ color: '#1E293B' }}>Employee ID</span>
                <span className="w-[22px] font-bold" style={{ color: '#334155' }}>:</span>
                <span className="font-black text-[15.5px] tracking-wide" style={{ color: '#002D62' }}>{employeeId}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold" style={{ color: '#1E293B' }}>Employee Name</span>
                <span className="w-[22px] font-bold" style={{ color: '#334155' }}>:</span>
                <span className="font-black text-[15.5px] uppercase tracking-wide" style={{ color: '#002D62' }}>{employeeName}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold" style={{ color: '#1E293B' }}>Position/Designation</span>
                <span className="w-[22px] font-bold" style={{ color: '#334155' }}>:</span>
                <span className="font-black text-[15px]" style={{ color: '#002D62' }}>{position}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold" style={{ color: '#1E293B' }}>Department</span>
                <span className="w-[22px] font-bold" style={{ color: '#334155' }}>:</span>
                <span className="font-black text-[15px] uppercase" style={{ color: '#002D62' }}>{department}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold" style={{ color: '#1E293B' }}>Date of Initial Appointment</span>
                <span className="w-[22px] font-bold" style={{ color: '#334155' }}>:</span>
                <span className="font-black text-[15px]" style={{ color: '#002D62' }}>{dateOfAppointment}</span>
              </div>

              <div className="flex items-center">
                <span className="w-[255px] font-bold" style={{ color: '#1E293B' }}>Effective Date of Employment</span>
                <span className="w-[22px] font-bold" style={{ color: '#334155' }}>:</span>
                <span className="font-black text-[15px]" style={{ color: '#002D62' }}>{dateOfConfirmation}</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 5. MAIN EMPLOYMENT PARAGRAPH                              */}
            {/* ========================================================= */}
            <div className="mt-4 pt-1 text-left text-[14.5px] leading-[1.75] font-normal" style={{ color: '#1E293B' }}>
              This is to formally certify that{' '}
              <strong className="font-black uppercase" style={{ color: '#002D62' }}>{employeeName}</strong>{' '}
              is officially employed as{' '}
              <strong className="font-black uppercase" style={{ color: '#002D62' }}>{position}</strong>{' '}
              with{' '}
              <strong className="font-black" style={{ color: '#002D62' }}>DS Tech and Digital Marketing Agency Limited</strong>, effective{' '}
              <strong className="font-black" style={{ color: '#002D62' }}>{dateOfConfirmation}</strong>.
            </div>

          </div>

          {/* ========================================================= */}
          {/* 6. EMPLOYMENT TERMS & CONDITIONS SECTION (100% SVG)       */}
          {/* ========================================================= */}
          <div className="px-2 mt-1">
            
            {/* Section Chamfered Mini-Banner with 100% Native SVG */}
            <div className="relative inline-flex items-center h-[36px] mb-3">
              <div className="relative h-full flex items-center justify-center">
                <svg
                  viewBox="0 0 350 36"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="goldRibbonGradTerms" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                  </defs>
                  {/* Navy Chamfered Box */}
                  <polygon
                    points="14,0 330,0 342,18 330,36 14,36 0,18"
                    fill="#061A40"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                  />
                  {/* Right Gold Chevron Tip */}
                  <polygon points="350,18 332,0 332,36" fill="url(#goldRibbonGradTerms)" />
                </svg>

                <div className="relative z-10 px-6">
                  <span className="text-[12.5px] font-extrabold uppercase tracking-[0.12em]" style={{ color: '#FFFFFF' }}>
                    EMPLOYMENT TERMS &amp; CONDITIONS
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Terms with Orange Number Badges */}
            <div className="space-y-3 text-left text-[12.8px] leading-[1.58] font-medium pl-1" style={{ color: '#334155' }}>
              
              {/* Term 1 */}
              <div className="flex items-start gap-2.5">
                <div
                  className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center font-black text-[11px] mt-[1.5px] shadow-sm"
                  style={{ backgroundColor: '#E8590C', color: '#FFFFFF' }}
                >
                  1
                </div>
                <p>
                  This employment is subject to the employee's continued compliance with the policies, procedures, professional standards, confidentiality requirements, and terms of engagement of DS Tech and Digital Marketing Agency Limited.
                </p>
              </div>

              {/* Term 2 */}
              <div className="flex items-start gap-2.5">
                <div
                  className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center font-black text-[11px] mt-[1.5px] shadow-sm"
                  style={{ backgroundColor: '#E8590C', color: '#FFFFFF' }}
                >
                  2
                </div>
                <p>
                  The employment remains subject to satisfactory performance and the applicable conditions of service of the organization.
                </p>
              </div>

              {/* Term 3 */}
              <div className="flex items-start gap-2.5">
                <div
                  className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center font-black text-[11px] mt-[1.5px] shadow-sm"
                  style={{ backgroundColor: '#E8590C', color: '#FFFFFF' }}
                >
                  3
                </div>
                <p>
                  This certificate is issued as an official record of the employee's employment and appointment with DS Tech and Digital Marketing Agency Limited.
                </p>
              </div>

            </div>

            {/* Issuance Date Line */}
            <div className="mt-3.5 text-left text-[14px] font-bold" style={{ color: '#1E293B' }}>
              Issued this <span className="font-black" style={{ color: '#002D62' }}>{issueDate}</span>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: Official Authorization (Signature, Seal, Verification) */}
        <div className="mt-2 px-2">
          
          <h3
            className="text-left font-black text-[14px] uppercase tracking-[0.12em] mb-2"
            style={{ color: '#002D62', fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            OFFICIAL AUTHORIZATION
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              width: '100%',
              gap: '14px',
              boxSizing: 'border-box',
            }}
          >
            
            {/* Left Column: Official Executive Signature & Title */}
            <div style={{ width: '270px', flexShrink: 0, textAlign: 'left' }}>
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
                    className="max-h-[66px] max-w-[210px] object-contain object-bottom"
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
                  <span
                    className="absolute -top-3 left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider pointer-events-none shadow-sm z-30"
                    style={{ backgroundColor: '#000E32', color: '#FFFFFF' }}
                  >
                    ✍️ Change Signature
                  </span>
                )}
              </div>

              {/* Signatory Details Hierarchy */}
              <div className="text-left leading-tight" style={{ color: '#1E293B' }}>
                {ceoName ? (
                  <p className="font-black text-[13px] tracking-wide" style={{ color: '#002D62' }}>
                    {ceoName}
                  </p>
                ) : null}
                <p className="font-extrabold text-[11.5px] mt-0.5" style={{ color: '#002D62' }}>
                  {ceoTitle}
                </p>
                <p className="font-semibold mt-0.5 text-[10.5px]" style={{ color: '#334155' }}>
                  DS Tech and Digital Marketing Agency Limited
                </p>
                <p className="font-medium text-[10px]" style={{ color: '#475569' }}>
                  Abuja, Nigeria
                </p>
              </div>
            </div>

            {/* Middle Column: Scalloped Golden Embossed Official Seal (Exact Match) */}
            <div style={{ width: '150px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <div className="relative w-[130px] h-[130px]">
                <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="sealMetallicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFE082" />
                      <stop offset="25%" stopColor="#FFB300" />
                      <stop offset="50%" stopColor="#FFC107" />
                      <stop offset="75%" stopColor="#FFA000" />
                      <stop offset="100%" stopColor="#FF8F00" />
                    </linearGradient>
                  </defs>
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
            <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              
              {/* Verification Box */}
              <div
                className="w-full rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-xs"
                style={{
                  border: '1.5px solid #061A40',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                
                {/* Left side info */}
                <div className="text-left space-y-0.5 min-w-0" style={{ maxWidth: '170px' }}>
                  <div className="flex items-center gap-1" style={{ color: '#002D62' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#002D62">
                      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 16L6.5 12.5L7.91 11.09L10 13.17L16.09 7.08L17.5 8.5L10 16Z" fill="#002D62"/>
                    </svg>
                    <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: '#002D62' }}>
                      Certificate Verification:
                    </span>
                  </div>

                  <p className="text-[9.5px] font-black truncate tracking-tight" style={{ color: '#002D62' }}>
                    [{verificationCode}]
                  </p>

                  <p className="text-[7.5px] leading-tight" style={{ color: '#64748B' }}>
                    Scan QR or visit our website to verify this certificate.
                  </p>
                </div>

                {/* Right side QR Code */}
                <div
                  className="w-[58px] h-[58px] shrink-0 rounded p-[1px] flex items-center justify-center overflow-hidden"
                  style={{ border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}
                >
                  {(activeQr || qrCodeDataUrl) ? (
                    <img
                      src={activeQr || qrCodeDataUrl}
                      alt="Verification QR"
                      crossOrigin="anonymous"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-[7px]"
                      style={{ backgroundColor: '#F1F5F9', color: '#94A3B8' }}
                    >
                      QR
                    </div>
                  )}
                </div>

              </div>

              {/* Brand Motto underneath matching Image */}
              <div className="mt-2 text-right text-[10px] italic font-semibold leading-tight pr-1" style={{ color: '#002D62' }}>
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
          className="w-full py-2.5 px-6 flex items-center justify-center gap-6 text-[10px] font-medium tracking-wide shadow-md"
          style={{ backgroundColor: '#061A40', color: '#FFFFFF' }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px]" style={{ color: '#FFA000' }}>🌐</span>
            <span style={{ color: '#FFFFFF' }}>www.dstech.com.ng</span>
          </div>

          <span className="font-bold opacity-60" style={{ color: '#94A3B8' }}>|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px]" style={{ color: '#FFA000' }}>📞</span>
            <span style={{ color: '#FFFFFF' }}>09023489111</span>
          </div>

          <span className="font-bold opacity-60" style={{ color: '#94A3B8' }}>|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px]" style={{ color: '#FFA000' }}>✉️</span>
            <span style={{ color: '#FFFFFF' }}>dstechanddigitalmarketingltd@gmail.com</span>
          </div>
        </div>
      </div>

    </div>
  );
};
