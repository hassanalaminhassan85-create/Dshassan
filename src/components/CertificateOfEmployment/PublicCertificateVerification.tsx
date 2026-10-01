import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck, ShieldAlert, Award, CheckCircle2, AlertTriangle,
  Search, ArrowLeft, Download, Printer, Share2, Building2, Check, ExternalLink, Calendar, User, Briefcase, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { apiVerifyCertificate } from '../../lib/certificateStorage';
import { extractVerificationCodeFromScan } from '../../lib/certificateQrUtility';
import { CertificateOfEmploymentDocument } from './CertificateOfEmploymentDocument';
import { generateCertificateQRCode } from '../../lib/certificateStorage';
import {
  generateCertificatePDFBlob,
  downloadCertificateBlob,
  printCertificateElement,
  shareCertificatePDF,
  formatCertificateFileName,
  getCachedCertificatePDF,
  setCachedCertificatePDF,
} from './certificatePdfUtils';
import { CertificateShareModal } from './CertificateShareModal';

interface PublicCertificateVerificationProps {
  initialCode?: string;
  onBackToHome?: () => void;
}

export const PublicCertificateVerification: React.FC<PublicCertificateVerificationProps> = ({
  initialCode,
  onBackToHome,
}) => {
  const [searchCode, setSearchCode] = useState<string>(initialCode || '');
  const [loading, setLoading] = useState<boolean>(!!initialCode);
  const [result, setResult] = useState<{
    verified: boolean;
    certificate?: any;
    error?: string;
  } | null>(null);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showDocPreview, setShowDocPreview] = useState<boolean>(true);
  const [docScale, setDocScale] = useState<number>(0.75);
  const docWrapperRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareModalData, setShareModalData] = useState<{
    blob: Blob | null;
    file: File | null;
    fileName: string;
    certificate: any;
    isCompiling?: boolean;
  } | null>(null);

  const performVerification = async (codeToVerify: string) => {
    const clean = extractVerificationCodeFromScan(codeToVerify);
    if (!clean) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await apiVerifyCertificate(clean);
      setResult(res);
      if (res.verified && res.certificate) {
        setShowDocPreview(true);
        const codeForQr = res.certificate.verificationCode || clean;
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dstech.com.ng';
        const vUrl = `${origin}/verify-certificate/${encodeURIComponent(codeForQr)}`;
        generateCertificateQRCode(vUrl).then(setQrCodeDataUrl).catch(() => {});
      }
    } catch (err: any) {
      setResult({
        verified: false,
        error: 'Network or verification service error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      performVerification(initialCode);
    }
  }, [initialCode]);

  // Responsive scale computation for mobile, tablet, and desktop screens
  useEffect(() => {
    if (!result?.verified) return;
    const updateScale = () => {
      if (docWrapperRef.current) {
        const containerW = docWrapperRef.current.clientWidth;
        const padding = window.innerWidth < 640 ? 16 : 40;
        const available = Math.max(220, containerW - padding);
        const computed = Math.min(1.0, Math.max(0.30, available / 794));
        setDocScale(Number(computed.toFixed(2)));
      }
    };
    updateScale();
    const t = setTimeout(updateScale, 80);
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(t);
    };
  }, [result?.verified, showDocPreview]);

  const handleDownload = async () => {
    if (!result?.certificate) return;
    const el =
      document.getElementById('ds-public-verified-clean-export') ||
      document.getElementById('ds-public-verified-cert-doc');
    if (!el) return;
    setIsGeneratingPDF(true);
    try {
      const blob = await generateCertificatePDFBlob(el);
      const name = formatCertificateFileName(result.certificate);
      downloadCertificateBlob(blob, name);
      setToast(`Downloaded ${name}`);
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      alert('Failed to download PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    const el =
      document.getElementById('ds-public-verified-clean-export') ||
      document.getElementById('ds-public-verified-cert-doc');
    if (el) printCertificateElement(el);
  };

  const handleShare = async () => {
    if (!result?.certificate) return;
    const cert = result.certificate;
    const fileName = formatCertificateFileName(cert);

    // 1. If already cached in memory, trigger phone native share with 0ms delay!
    if (cert.id) {
      const cached = getCachedCertificatePDF(cert.id);
      if (cached) {
        setShareModalData({
          blob: cached.blob,
          file: cached.file,
          fileName,
          certificate: cert,
          isCompiling: false,
        });
        try {
          await shareCertificatePDF(cached.blob, fileName, cert);
        } catch {}
        return;
      }
    }

    setShareModalData({
      blob: null,
      file: null,
      fileName,
      certificate: cert,
      isCompiling: true,
    });

    const el =
      document.getElementById('ds-public-verified-clean-export') ||
      document.getElementById('ds-public-verified-cert-doc');
    if (!el) return;

    try {
      const blob = await generateCertificatePDFBlob(el);
      const file = new File([blob], fileName, { type: 'application/pdf', lastModified: Date.now() });
      if (cert.id) {
        setCachedCertificatePDF(cert.id, blob, file);
      }
      setShareModalData({
        blob,
        file,
        fileName,
        certificate: cert,
        isCompiling: false,
      });
      try {
        await shareCertificatePDF(blob, fileName, cert);
      } catch {}
    } catch (e) {
      console.warn('[Public Share Error]', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 md:p-10 flex flex-col items-center justify-start">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navigation */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={onBackToHome || (() => window.location.href = '/')}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700"
        >
          <ArrowLeft size={14} />
          <span>Return to Portal</span>
        </button>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>DS Tech Cloud Verification Registry (Active)</span>
        </div>
      </div>

      {/* Verification Card Header */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white">
        
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#000E32] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              DS
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#000E32] dark:text-white font-serif">
                DS Tech and Digital Marketing Agency
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official Document Verification &amp; Authentication System • CAC RC-1849204
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <ShieldCheck size={14} />
            <span>Cryptographic Verification Online</span>
          </div>
        </div>

        {/* Verification Lookup Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performVerification(searchCode);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              required
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter Verification Code (e.g. DST-VRF-...) or Certificate Number..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <ShieldCheck size={16} />
            <span>{loading ? 'Verifying...' : 'Verify Certificate'}</span>
          </button>
        </form>

        {/* Verification Results */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-500">Querying official DS Tech database ledger...</p>
          </div>
        )}

        {!loading && result && (
          <div className="space-y-6">
            
            {/* Status Banner */}
            {result.verified ? (
              <div
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left ${
                  result.certificate?.status === 'Revoked'
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                    result.certificate?.status === 'Revoked' ? 'bg-rose-600' : 'bg-emerald-600'
                  }`}
                >
                  {result.certificate?.status === 'Revoked' ? (
                    <AlertTriangle size={24} />
                  ) : (
                    <CheckCircle2 size={24} />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        result.certificate?.status === 'Revoked'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {result.certificate?.status === 'Revoked' ? 'STATUS: REVOKED' : 'STATUS: OFFICIAL & VERIFIED'}
                    </span>
                    <span className="text-xs font-mono font-bold">
                      {result.certificate?.certificateNumber}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                    {result.certificate?.status === 'Revoked'
                      ? 'Certificate Notice: Revoked Document'
                      : 'Authentic Certificate of Employment'}
                  </h3>

                  <p className="text-xs leading-relaxed opacity-90 max-w-2xl">
                    {result.certificate?.status === 'Revoked'
                      ? `This Certificate has been marked as REVOKED in the DS Tech registry. Reason: ${result.certificate?.revocationReason || 'Superseded or cancelled by administration.'}`
                      : 'This document was officially issued and recorded by DS Tech and Digital Marketing Agency Limited, Garki, Abuja. All employee credentials and terms match the official company database.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-base font-extrabold text-rose-900 dark:text-rose-200 uppercase">
                  Verification Failed
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                  {result.error || 'The entered code could not be verified against the official DS Tech database.'}
                </p>
              </div>
            )}

            {/* Verified Details & Exact Certificate Rendering */}
            {result.verified && result.certificate && (
              <div className="space-y-6">
                
                {/* Immediate Action Toolbar & Zoom Controls */}
                <div className="p-3.5 sm:p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isGeneratingPDF}
                      onClick={handleDownload}
                      className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Download size={14} />
                      <span>{isGeneratingPDF ? 'Generating...' : 'Download Official PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3.5 py-2 bg-[#000E32] hover:bg-[#001750] text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                    >
                      <Printer size={14} />
                      <span>Print Certificate</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="px-3.5 py-2 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Share2 size={14} />
                      <span>Share PDF</span>
                    </button>
                  </div>

                  {/* Zoom Controls for easy inspection on mobile & desktop */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setDocScale(prev => Math.max(0.3, Number((prev - 0.1).toFixed(2))))}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="px-2 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                      {Math.round(docScale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setDocScale(prev => Math.min(1.2, Number((prev + 0.1).toFixed(2))))}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (docWrapperRef.current) {
                          const containerW = docWrapperRef.current.clientWidth;
                          const padding = window.innerWidth < 640 ? 16 : 40;
                          const available = Math.max(220, containerW - padding);
                          setDocScale(Number((Math.min(1.0, Math.max(0.30, available / 794))).toFixed(2)));
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
                      title="Fit to Screen Width"
                    >
                      Fit
                    </button>
                  </div>
                </div>

                {/* EXACT CERTIFICATE OF EMPLOYMENT DOCUMENT DISPLAY */}
                <div
                  ref={docWrapperRef}
                  className="w-full p-2 sm:p-6 bg-slate-200 dark:bg-slate-950 rounded-3xl overflow-x-auto flex justify-center items-start border border-slate-300/80 dark:border-slate-800 shadow-inner"
                >
                  <div
                    style={{
                      width: `${794 * docScale}px`,
                      height: `${1123 * docScale}px`,
                      transition: 'width 0.15s ease-out, height 0.15s ease-out',
                    }}
                    className="relative shrink-0 shadow-2xl rounded-sm overflow-hidden bg-white my-2"
                  >
                    <div
                      style={{
                        transform: `scale(${docScale})`,
                        transformOrigin: 'top left',
                        width: '794px',
                        height: '1123px',
                      }}
                    >
                      <CertificateOfEmploymentDocument
                        id="ds-public-verified-cert-doc"
                        certificate={result.certificate}
                        qrCodeDataUrl={qrCodeDataUrl}
                      />
                    </div>
                  </div>
                </div>

                {/* Verified Metadata Matrix */}
                <div className="pt-2 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                    Official Employment Record Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Employee Full Name</span>
                      <span className="text-sm font-black text-[#000E32] dark:text-white uppercase block truncate">
                        {result.certificate.employeeName}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Employee ID</span>
                      <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {result.certificate.employeeId}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Position / Designation</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block truncate">
                        {result.certificate.position}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Department</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase block truncate">
                        {result.certificate.department}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Initial Appointment Date</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {result.certificate.dateOfAppointment}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Certificate Issue Date</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {result.certificate.issueDate}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Appointment Reference #</span>
                      <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {result.certificate.appointmentRefNo || result.certificate.certificateNumber}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Verification Code</span>
                      <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 block truncate">
                        {result.certificate.verificationCode}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Authorized Signatory</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {result.certificate.authorizedOfficerPosition || 'Company Director/CEO'}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Hidden Clean 1:1 Rendering Target for 100% Reliable PDF & Print Generation */}
                <div
                  id="ds-public-verified-clean-export-container"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: '-99999px',
                    width: '794px',
                    height: '1123px',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    zIndex: -9999,
                    opacity: 1,
                    backgroundColor: '#FFFFFF',
                  }}
                  aria-hidden="true"
                >
                  <CertificateOfEmploymentDocument
                    id="ds-public-verified-clean-export"
                    certificate={result.certificate}
                    qrCodeDataUrl={qrCodeDataUrl}
                  />
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-400 space-y-1 max-w-xl">
        <p className="font-semibold text-slate-300">
          DS Tech and Digital Marketing Agency Limited • RC-1849204
        </p>
        <p className="text-[11px]">
          Ext A-73 Efab Mall, Second Floor Area 10, Garki, Abuja, Nigeria • Phone: 09023489111 • Email: dstechanddigitalmarketingltd@gmail.com
        </p>
      </div>

      {/* Share Modal */}
      <CertificateShareModal
        isOpen={!!shareModalData}
        onClose={() => setShareModalData(null)}
        certificate={shareModalData?.certificate || null}
        pdfBlob={shareModalData?.blob || null}
        pdfFile={shareModalData?.file || null}
        fileName={shareModalData?.fileName || 'Certificate.pdf'}
        isCompiling={shareModalData?.isCompiling}
        onToast={(type, msg) => {
          setToast(msg);
          setTimeout(() => setToast(null), 3000);
        }}
      />
    </div>
  );
};
