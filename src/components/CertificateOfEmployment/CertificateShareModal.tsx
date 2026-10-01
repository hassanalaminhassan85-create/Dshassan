import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2, XCircle, Smartphone, Mail, Download, Copy,
  Check, ArrowRight, Loader2, Send
} from 'lucide-react';
import { EmploymentCertificate } from '../../types';
import {
  shareCertificatePDF,
  downloadCertificateBlob,
  canShareFiles,
} from './certificatePdfUtils';
import { getVerificationUrl } from '../../lib/certificateStorage';

export interface CertificateShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Partial<EmploymentCertificate> | null;
  pdfBlob: Blob | null;
  pdfFile: File | null;
  fileName: string;
  isCompiling?: boolean;
  onToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const CertificateShareModal: React.FC<CertificateShareModalProps> = ({
  isOpen,
  onClose,
  certificate,
  pdfBlob,
  pdfFile,
  fileName,
  isCompiling = false,
  onToast,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isOpeningNativeShare, setIsOpeningNativeShare] = useState(false);

  if (!isOpen || !certificate) return null;

  const employeeName = certificate.employeeName || 'Staff';
  const position = certificate.position || 'Staff';
  const certNumber = certificate.certificateNumber || 'N/A';
  const verificationUrl =
    certificate.qrVerificationUrl ||
    getVerificationUrl(certificate.verificationCode || '');

  const fileSizeKb = pdfBlob ? Math.round(pdfBlob.size / 1024) : null;

  // 1. Direct Native Phone Share (Triggers Android / Samsung / iOS system share sheet)
  const handleOpenNativeShare = async () => {
    if (!pdfBlob || !pdfFile) {
      onToast?.('info', 'Compiling exact PDF, please wait a moment...');
      return;
    }

    setIsOpeningNativeShare(true);
    try {
      const res = await shareCertificatePDF(pdfBlob, fileName, certificate);
      if (res.shared) {
        onToast?.('success', 'Phone share channels opened!');
      } else if (res.method === 'cancelled') {
        // User closed share sheet - no error needed
      } else {
        // Fallback: prompt admin to choose WhatsApp or Email below
        onToast?.('info', 'Choose a channel below (WhatsApp, Email, or Save PDF).');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        onToast?.('info', 'Choose any direct channel below.');
      }
    } finally {
      setIsOpeningNativeShare(false);
    }
  };

  // 2. Direct WhatsApp
  const handleWhatsAppShare = () => {
    if (pdfBlob) {
      downloadCertificateBlob(pdfBlob, fileName);
    }
    const message = `*Official Certificate of Employment*\n\n` +
      `*Employee:* ${employeeName}\n` +
      `*Position:* ${position}\n` +
      `*Certificate No:* ${certNumber}\n` +
      `*Verification Code:* ${certificate.verificationCode || 'N/A'}\n\n` +
      `*Verify Online:* ${verificationUrl}\n\n` +
      `_Issued by DS Tech and Digital Marketing Agency Limited._`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    onToast?.('success', 'WhatsApp opened! Attach the downloaded PDF to your chat.');
  };

  // 3. Direct Email
  const handleEmailShare = () => {
    if (pdfBlob) {
      downloadCertificateBlob(pdfBlob, fileName);
    }
    const subject = `Official Certificate of Employment - ${employeeName}`;
    const body = `Dear ${employeeName},\n\n` +
      `Please find attached your official Certificate of Employment issued by DS Tech and Digital Marketing Agency Limited.\n\n` +
      `Position: ${position}\n` +
      `Certificate Number: ${certNumber}\n` +
      `Verification Code: ${certificate.verificationCode || 'N/A'}\n` +
      `Public Verification Link: ${verificationUrl}\n\n` +
      `Sincerely,\nExecutive Management\nDS Tech and Digital Marketing Agency Limited\nAbuja, Nigeria`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onToast?.('info', 'Email app opened! PDF saved to phone to attach.');
  };

  // 4. Direct Telegram
  const handleTelegramShare = () => {
    if (pdfBlob) {
      downloadCertificateBlob(pdfBlob, fileName);
    }
    const text = `Official Certificate of Employment for ${employeeName} (${position}) - DS Tech. Verification: ${verificationUrl}`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(verificationUrl)}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank');
    onToast?.('success', 'Telegram opened! Attach the downloaded PDF to your chat.');
  };

  // 5. Download exact PDF
  const handleDownloadPDF = () => {
    if (!pdfBlob) return;
    downloadCertificateBlob(pdfBlob, fileName);
    onToast?.('success', `Saved ${fileName} to device`);
  };

  // 6. Copy Link
  const handleCopyLink = () => {
    if (!verificationUrl) return;
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    onToast?.('success', 'Verification link copied!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden my-auto text-left"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-white">
                  Share Certificate PDF
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select your phone channel or direct recipient app
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <XCircle size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* File Info Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-11 bg-rose-600 text-white rounded-xl flex flex-col items-center justify-center font-black text-[9px] shadow-sm shrink-0">
                  <span>PDF</span>
                  <span className="text-[7px] opacity-80 uppercase">A4</span>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {fileName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Issued to {employeeName} • {fileSizeKb ? `${fileSizeKb} KB` : 'High Definition A4'}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200 dark:border-emerald-800/40">
                Official
              </span>
            </div>

            {/* Compiling Indicator */}
            {isCompiling && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs">
                <Loader2 size={16} className="animate-spin text-amber-600 shrink-0" />
                <span>Compiling exact A4 vector PDF...</span>
              </div>
            )}

            {/* Primary Action: Phone Native Share Channels */}
            <button
              type="button"
              disabled={isCompiling}
              onClick={handleOpenNativeShare}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#000E32] via-[#001E5A] to-[#000E32] hover:from-[#001750] hover:to-[#001750] text-white flex items-center justify-between gap-3 shadow-lg shadow-blue-950/30 transition-all cursor-pointer group active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span>Open Phone Share Channels</span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] bg-orange-500 text-white font-bold">ALL APPS</span>
                  </p>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Pops up WhatsApp, Gmail, Telegram, Quick Share, Google Drive &amp; all phone channels
                  </p>
                </div>
              </div>
              {isOpeningNativeShare ? (
                <Loader2 size={16} className="animate-spin text-orange-400 shrink-0" />
              ) : (
                <ArrowRight size={16} className="text-orange-400 group-hover:translate-x-1 transition-transform shrink-0" />
              )}
            </button>

            {/* Direct App Channels */}
            <div className="space-y-2 pt-1 text-left">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block font-mono">
                Or Direct Channels
              </span>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full p-3 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm font-bold">
                    💬
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                      WhatsApp
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Send to WhatsApp chat &amp; attaches exact PDF
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Email / Gmail */}
              <button
                type="button"
                onClick={handleEmailShare}
                className="w-full p-3 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm font-bold">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-blue-900 dark:text-blue-200">
                      Email Client (Gmail / Outlook)
                    </p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400">
                      Pre-filled formal email with verification details &amp; PDF
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleTelegramShare}
                className="w-full p-3 bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800/60 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center text-xs shrink-0 shadow-sm font-bold">
                    <Send size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-sky-900 dark:text-sky-200">
                      Telegram
                    </p>
                    <p className="text-[10px] text-sky-700 dark:text-sky-400">
                      Send to Telegram contact or group
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-sky-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Save PDF to Phone Storage */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#000E32] text-white flex items-center justify-center text-xs shrink-0 shadow-sm font-bold">
                    <Download size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Save PDF to Device Storage
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Save pristine A4 PDF to phone's Downloads folder
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Copy Verification Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs shrink-0 shadow-sm font-bold">
                    {copiedLink ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Public Verification URL'}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[240px]">
                      {verificationUrl}
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
