import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award, FileText, Download, Printer, Share2, CheckCircle2,
  AlertCircle, Search, Filter, RefreshCw, Eye, Plus, ShieldCheck,
  Building, User, Calendar, QrCode, ArrowRight, ArrowLeft,
  XCircle, Copy, ExternalLink, Check, RotateCcw, AlertTriangle, Users
} from 'lucide-react';
import { EmploymentCertificate, CertificateStatus } from '../../types';
import { CertificateOfEmploymentDocument } from './CertificateOfEmploymentDocument';
import {
  apiSubscribeToCertificates,
  apiSaveCertificate,
  apiUpdateCertificateStatus,
  generateCertificateNumber,
  generateAppointmentRefNo,
  generateVerificationCode,
  getVerificationUrl,
  generateCertificateQRCode,
} from '../../lib/certificateStorage';
import {
  generateCertificatePDFBlob,
  downloadCertificateBlob,
  printCertificateElement,
  shareCertificatePDF,
  formatCertificateFileName,
} from './certificatePdfUtils';
import { apiSubscribeToStaff, apiSubscribeToDepartments } from '../../lib/api';

interface AdminCertificateManagerProps {
  onNavigateToVerification?: (code: string) => void;
}

export const AdminCertificateOfEmploymentManager: React.FC<AdminCertificateManagerProps> = ({
  onNavigateToVerification,
}) => {
  // Navigation: 'list' (History) or 'create' (Editor & Preview)
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Certificate Registry State
  const [certificates, setCertificates] = useState<EmploymentCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Staff and Departments from Real Database
  const [staffDirectory, setStaffDirectory] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showStaffPicker, setShowStaffPicker] = useState<boolean>(false);

  // Form Fields - Employee Information (No hardcoded data)
  const [employeeName, setEmployeeName] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [dateOfAppointment, setDateOfAppointment] = useState<string>('');
  const [employmentStatus, setEmploymentStatus] = useState<string>('Confirmed');
  const [employmentType, setEmploymentType] = useState<string>('Full-Time Permanent');

  // Certificate Information
  const [appointmentRefNo, setAppointmentRefNo] = useState<string>('');
  const [certificateNumber, setCertificateNumber] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(() => {
    return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  });
  const [authorizedOfficerName, setAuthorizedOfficerName] = useState<string>('Company Director/CEO');
  const [authorizedOfficerPosition, setAuthorizedOfficerPosition] = useState<string>('Director/CEO');
  const [allowManualOverrides, setAllowManualOverrides] = useState<boolean>(false);

  // Auto-generated Verification state
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Active Selected Certificate for Actions/Preview
  const [previewModalCert, setPreviewModalCert] = useState<EmploymentCertificate | null>(null);
  const [revokeModalCert, setRevokeModalCert] = useState<EmploymentCertificate | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('');
  const [reissueModalCert, setReissueModalCert] = useState<EmploymentCertificate | null>(null);
  const [reissueNote, setReissueNote] = useState<string>('');

  // Operations Loading
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Live Preview scaling (A4 container width = 794px)
  const [previewScale, setPreviewScale] = useState<number>(0.85);
  const certContainerRef = useRef<HTMLDivElement>(null);
  const modalCertContainerRef = useRef<HTMLDivElement>(null);

  // History Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Initialize new Certificate Identifiers
  const resetFormToNew = () => {
    const currentYear = new Date().getFullYear();
    const nextSeq = certificates.length + 1;
    const certNum = generateCertificateNumber(nextSeq, currentYear);
    const refNum = generateAppointmentRefNo(nextSeq, currentYear);
    const vCode = generateVerificationCode();

    setCertificateNumber(certNum);
    setAppointmentRefNo(refNum);
    setVerificationCode(vCode);

    setEmployeeName('');
    setEmployeeId('');
    setPosition('');
    setDepartment('');
    setDateOfAppointment('');
    setEmploymentStatus('Confirmed');
    setEmploymentType('Full-Time Permanent');
    setIssueDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  };

  // Real-time Database Subscriptions
  useEffect(() => {
    setLoading(true);
    const unsubCerts = apiSubscribeToCertificates((data) => {
      setCertificates(data);
      setLoading(false);
    });

    const unsubStaff = apiSubscribeToStaff((data) => {
      setStaffDirectory(data || []);
    });

    const unsubDepts = apiSubscribeToDepartments((data) => {
      setDepartments(data || []);
    });

    const handleExternalStaffSelect = (e: any) => {
      if (e && e.detail) {
        handleSelectStaff(e.detail);
        setActiveTab('create');
      }
    };
    window.addEventListener('dstech_open_certificate_module', handleExternalStaffSelect);

    return () => {
      unsubCerts();
      unsubStaff();
      unsubDepts();
      window.removeEventListener('dstech_open_certificate_module', handleExternalStaffSelect);
    };
  }, []);

  // Update initial certificate numbers when certificates list loads if empty
  useEffect(() => {
    if (!certificateNumber) {
      const currentYear = new Date().getFullYear();
      const nextSeq = certificates.length + 1;
      setCertificateNumber(generateCertificateNumber(nextSeq, currentYear));
      setAppointmentRefNo(generateAppointmentRefNo(nextSeq, currentYear));
      setVerificationCode(generateVerificationCode());
    }
  }, [certificates]);

  // Update QR Code whenever verification code changes
  useEffect(() => {
    if (verificationCode) {
      const url = getVerificationUrl(verificationCode);
      generateCertificateQRCode(url).then(setQrCodeDataUrl);
    }
  }, [verificationCode]);

  // Populate from chosen staff member
  const handleSelectStaff = (member: any) => {
    const name = member.fullName || member.full_name || '';
    const empId = member.employeeId || member.employee_id || `DST-${Math.floor(1000 + Math.random() * 9000)}`;
    const job = member.jobTitle || member.job_title || '';
    const dept = member.departmentId || member.department_id || member.department || '';
    const dateJoined = member.dateJoined || member.date_joined || new Date().toISOString().split('T')[0];

    // Format dateJoined to readable string e.g. "15th January 2024"
    let formattedDate = dateJoined;
    try {
      const d = new Date(dateJoined);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch (e) {}

    setEmployeeName(name);
    setEmployeeId(empId);
    setPosition(job);
    setDepartment(dept);
    setDateOfAppointment(formattedDate);
    setShowStaffPicker(false);

    showToast('success', `Selected employee ${name} from database.`);
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Compile active form certificate object
  const currentCertificateData: Partial<EmploymentCertificate> = {
    certificateNumber,
    appointmentRefNo,
    employeeName,
    employeeId,
    position,
    department,
    dateOfAppointment,
    employmentStatus,
    employmentType,
    issueDate,
    authorizedOfficerName,
    authorizedOfficerPosition,
    verificationCode,
    qrVerificationUrl: getVerificationUrl(verificationCode),
    status: 'Issued',
  };

  // Save / Issue Action
  const handleIssueCertificate = async (statusToSet: CertificateStatus = 'Issued') => {
    if (!employeeName.trim() || !employeeId.trim() || !position.trim() || !department.trim()) {
      showToast('error', 'Please enter all required Employee Information (Name, ID, Position, Department).');
      return;
    }

    setIsSaving(true);
    try {
      const certId = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const certToSave: EmploymentCertificate = {
        id: certId,
        certificateNumber: certificateNumber.trim(),
        appointmentRefNo: appointmentRefNo.trim(),
        employeeName: employeeName.trim(),
        employeeId: employeeId.trim(),
        position: position.trim(),
        department: department.trim(),
        dateOfAppointment: dateOfAppointment.trim() || issueDate,
        employmentStatus,
        employmentType,
        issueDate: issueDate.trim(),
        authorizedOfficerName,
        authorizedOfficerPosition,
        verificationCode: verificationCode.trim(),
        qrVerificationUrl: getVerificationUrl(verificationCode.trim()),
        status: statusToSet,
        issuedBy: 'Super Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await apiSaveCertificate(certToSave);

      showToast('success', `Certificate of Employment ${certToSave.certificateNumber} successfully ${statusToSet === 'Draft' ? 'saved as Draft' : 'Issued'} to database!`);
      setActiveTab('history');
      resetFormToNew();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save certificate to database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Download PDF Action
  const handleDownloadPDF = async (certOverride?: EmploymentCertificate) => {
    const cert = certOverride || (currentCertificateData as EmploymentCertificate);
    const targetEl = certOverride
      ? document.getElementById('ds-modal-certificate-doc')
      : document.getElementById('ds-certificate-of-employment-document');

    if (!targetEl) {
      showToast('error', 'Certificate rendering canvas not ready.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const blob = await generateCertificatePDFBlob(targetEl);
      const fileName = formatCertificateFileName(cert);
      downloadCertificateBlob(blob, fileName);
      showToast('success', `Downloaded ${fileName}`);
    } catch (err: any) {
      showToast('error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print Action
  const handlePrint = (certOverride?: EmploymentCertificate) => {
    const targetEl = certOverride
      ? document.getElementById('ds-modal-certificate-doc')
      : document.getElementById('ds-certificate-of-employment-document');

    if (!targetEl) {
      showToast('error', 'Certificate element not available for printing.');
      return;
    }
    printCertificateElement(targetEl);
  };

  // Share Action
  const handleShare = async (certOverride?: EmploymentCertificate) => {
    const cert = certOverride || (currentCertificateData as EmploymentCertificate);
    const targetEl = certOverride
      ? document.getElementById('ds-modal-certificate-doc')
      : document.getElementById('ds-certificate-of-employment-document');

    if (!targetEl) {
      showToast('error', 'Certificate element not ready.');
      return;
    }

    try {
      const blob = await generateCertificatePDFBlob(targetEl);
      const fileName = formatCertificateFileName(cert);
      const shared = await shareCertificatePDF(blob, fileName, cert);
      if (shared) {
        showToast('success', 'Shared certificate successfully!');
      } else {
        const vUrl = getVerificationUrl(cert.verificationCode || '');
        await navigator.clipboard.writeText(vUrl);
        showToast('info', 'Verification link copied to clipboard!');
      }
    } catch (err) {
      showToast('error', 'Share operation cancelled or unavailable.');
    }
  };

  // Revoke Action
  const handleConfirmRevoke = async () => {
    if (!revokeModalCert) return;
    try {
      await apiUpdateCertificateStatus(revokeModalCert.id, 'Revoked', {
        revocationReason: revokeReason || 'Administrative revocation by HR Management.',
        updatedBy: 'Super Admin',
      });
      showToast('success', `Certificate ${revokeModalCert.certificateNumber} has been revoked.`);
      setRevokeModalCert(null);
      setRevokeReason('');
    } catch (err: any) {
      showToast('error', 'Failed to revoke certificate.');
    }
  };

  // Reissue Action
  const handleConfirmReissue = async () => {
    if (!reissueModalCert) return;
    try {
      const currentYear = new Date().getFullYear();
      const nextSeq = certificates.length + 1;
      const newCertNo = generateCertificateNumber(nextSeq, currentYear);
      const newVCode = generateVerificationCode();
      const now = new Date().toISOString();

      // Create new certificate with reference to previous
      const reissuedCert: EmploymentCertificate = {
        ...reissueModalCert,
        id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        certificateNumber: newCertNo,
        verificationCode: newVCode,
        qrVerificationUrl: getVerificationUrl(newVCode),
        status: 'Reissued',
        previousCertificateId: reissueModalCert.id,
        reissueNote: reissueNote || `Reissued to replace ${reissueModalCert.certificateNumber}`,
        issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        createdAt: now,
        updatedAt: now,
      };

      await apiSaveCertificate(reissuedCert);
      showToast('success', `New Certificate ${newCertNo} reissued successfully! Historical record preserved.`);
      setReissueModalCert(null);
      setReissueNote('');
    } catch (err: any) {
      showToast('error', 'Failed to reissue certificate.');
    }
  };

  // Filtered Certificates for History Table
  const filteredCertificates = certificates.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.employeeName?.toLowerCase().includes(q) ||
      c.employeeId?.toLowerCase().includes(q) ||
      c.certificateNumber?.toLowerCase().includes(q) ||
      c.position?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q) ||
      c.verificationCode?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40 min-h-screen">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/20'
                : notification.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-950/20'
                : 'bg-[#000E32] text-white border-blue-900 shadow-blue-950/20'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={18} />
            ) : notification.type === 'error' ? (
              <AlertCircle size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
              Staff Certificates Module
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              A4 Portrait High-Resolution Engine
            </span>
          </div>
          <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="text-orange-500 shrink-0" size={26} />
            Certificate of Employment
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Issue, preview, digitally verify, download, and manage official DS Tech Certificates of Employment. All documents are preserved in the real database with unique verification codes and scannable QR verification.
          </p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#000E32] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus size={14} />
            <span>Create &amp; Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#000E32] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Certificate History</span>
            <span className="px-1.5 py-0.2 bg-orange-500/20 text-orange-500 text-[10px] font-mono font-black rounded-full ml-1">
              {certificates.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CREATE & LIVE PREVIEW WORKFLOW                      */}
      {/* ========================================================= */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Structured Admin Input Form (5 cols) */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* Quick Populate from Existing Staff Button */}
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent p-4 rounded-2xl border border-orange-200 dark:border-orange-900/40 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-800 dark:text-slate-200">
                  Select Registered Staff Member
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick from the real authenticated database to pre-fill info automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStaffPicker(true)}
                className="px-3 py-1.5 bg-[#000E32] hover:bg-[#001750] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Users size={12} />
                <span>Select Staff</span>
              </button>
            </div>

            {/* Form Section 1: Employee Information */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#000E32] dark:text-white flex items-center gap-2">
                  <User size={15} className="text-orange-500" />
                  Employee Information
                </h3>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Step 1 of 3</span>
              </div>

              <div className="space-y-3.5">
                {/* Employee Full Name */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                    Employee Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="e.g. Al-Amin Hassan"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Employee ID & Position in 2 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. DST/STAFF/0042"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Position / Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. Senior Security Architect"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Department & Initial Appointment Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Software &amp; AI Engineering"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Date of Initial Appointment *
                    </label>
                    <input
                      type="text"
                      required
                      value={dateOfAppointment}
                      onChange={(e) => setDateOfAppointment(e.target.value)}
                      placeholder="e.g. 15th January 2024"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Employment Status
                    </label>
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Active">Active</option>
                      <option value="Permanent">Permanent</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="Full-Time Permanent">Full-Time Permanent</option>
                      <option value="Full-Time Staff">Full-Time Staff</option>
                      <option value="Contract Specialist">Contract Specialist</option>
                      <option value="Executive Partner">Executive Partner</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Form Section 2: Certificate & Authorization Information */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#000E32] dark:text-white flex items-center gap-2">
                  <Building size={15} className="text-orange-500" />
                  Certificate &amp; Issuance Parameters
                </h3>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Step 2 of 3</span>
              </div>

              <div className="space-y-3.5">
                
                {/* Issue Date */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                    Certificate Issue Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    placeholder="e.g. 30th September 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Authorized Officer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Authorized Officer Title
                    </label>
                    <input
                      type="text"
                      value={authorizedOfficerPosition}
                      onChange={(e) => setAuthorizedOfficerPosition(e.target.value)}
                      placeholder="Company Director/CEO"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Authorized Location
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Abuja, Nigeria"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Auto-Generated Identifiers Panel */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#000E32] dark:text-white tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-500" />
                      Auto-Generated Identifiers
                    </span>
                    <button
                      type="button"
                      onClick={() => setAllowManualOverrides(!allowManualOverrides)}
                      className="text-[9px] font-bold text-orange-600 dark:text-orange-400 underline cursor-pointer"
                    >
                      {allowManualOverrides ? 'Lock Identifiers' : 'Manual Override'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Certificate Number:</span>
                      {allowManualOverrides ? (
                        <input
                          type="text"
                          value={certificateNumber}
                          onChange={(e) => setCertificateNumber(e.target.value)}
                          className="w-full px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                        />
                      ) : (
                        <span className="font-mono font-bold text-[#000E32] dark:text-white break-all">
                          {certificateNumber}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Verification Code:</span>
                      {allowManualOverrides ? (
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="w-full px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                        />
                      ) : (
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all">
                          {verificationCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <QrCode size={11} className="text-slate-400" />
                    <span>Real public verification route:</span>
                    <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-[9px] text-indigo-500 font-mono">
                      /verify-certificate/{verificationCode}
                    </code>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons: Save, Generate PDF, Print, Share */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 font-mono">
                Issuance &amp; Export Center
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleIssueCertificate('Issued')}
                  className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Award size={15} />
                  <span>{isSaving ? 'Issuing...' : 'Issue Certificate'}</span>
                </button>

                <button
                  type="button"
                  disabled={isGeneratingPDF}
                  onClick={() => handleDownloadPDF()}
                  className="px-4 py-3 bg-[#000E32] hover:bg-[#001750] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-950/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Download size={15} />
                  <span>{isGeneratingPDF ? 'Compiling A4...' : 'Download PDF'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handlePrint()}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare()}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={12} />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleIssueCertificate('Draft')}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={12} />
                  <span>Save Draft</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center pt-1 font-medium">
                Saves official record to Cloud Firestore &amp; backend registry.
              </p>
            </div>

          </div>

          {/* RIGHT: Live A4 Portrait Preview (7 cols) */}
          <div className="xl:col-span-7 space-y-4">
            
            {/* Live Preview Controls Header */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider text-[#000E32] dark:text-white flex items-center gap-2">
                  <Eye size={15} className="text-orange-500" />
                  Live Preview (A4 Portrait 1:1)
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  The preview below uses the exact same single-page rendering layout as the final PDF.
                </p>
              </div>

              {/* Scaling Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-mono">
                <span className="text-slate-400 px-1 font-bold">Zoom:</span>
                {[0.55, 0.7, 0.85, 1.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPreviewScale(s)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                      previewScale === s
                        ? 'bg-[#000E32] text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    {Math.round(s * 100)}%
                  </button>
                ))}
              </div>
            </div>

            {/* Document Frame Container with Responsive Centering */}
            <div className="bg-slate-200/70 dark:bg-slate-950 p-4 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-slate-800 overflow-x-auto flex justify-center shadow-inner">
              <div
                style={{
                  width: `${794 * previewScale}px`,
                  height: `${1123 * previewScale}px`,
                  transition: 'all 0.2s ease-out',
                }}
                className="relative shrink-0 shadow-2xl rounded-sm overflow-hidden"
              >
                <div
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                    width: '794px',
                    height: '1123px',
                  }}
                >
                  <CertificateOfEmploymentDocument
                    id="ds-certificate-of-employment-document"
                    certificate={currentCertificateData}
                    qrCodeDataUrl={qrCodeDataUrl}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CERTIFICATE HISTORY & REGISTRY                     */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Employee, ID, Cert # or Verification Code..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Status Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {['all', 'Issued', 'Draft', 'Reissued', 'Revoked'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#000E32] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Statuses' : st}
                </button>
              ))}
            </div>

          </div>

          {/* Certificates Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-white tracking-wide">
                  Issued Certificates Registry
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Showing {filteredCertificates.length} records retrieved from database.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setActiveTab('create'); resetFormToNew(); }}
                className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Issue New Certificate</span>
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <RefreshCw size={24} className="animate-spin mx-auto text-orange-500" />
                <p className="text-xs font-mono">Loading certificates registry...</p>
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Award size={40} className="text-slate-300 dark:text-slate-700 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                    No Certificates Found
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No records match your search filter criteria.'
                      : 'No Certificate of Employment has been issued yet. Click "Issue New Certificate" to generate one.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                      <th className="px-5 py-3.5">Certificate #</th>
                      <th className="px-5 py-3.5">Employee Name &amp; ID</th>
                      <th className="px-5 py-3.5">Position &amp; Dept</th>
                      <th className="px-5 py-3.5">Issue Date</th>
                      <th className="px-5 py-3.5">Verification Code</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredCertificates.map((cert) => (
                      <tr
                        key={cert.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Cert Number */}
                        <td className="px-5 py-4 font-mono font-bold text-[#000E32] dark:text-white">
                          {cert.certificateNumber}
                        </td>

                        {/* Employee Name */}
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            {cert.employeeName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            ID: {cert.employeeId}
                          </span>
                        </td>

                        {/* Position & Dept */}
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {cert.position}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase block mt-0.5">
                            {cert.department}
                          </span>
                        </td>

                        {/* Issue Date */}
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {cert.issueDate}
                        </td>

                        {/* Verification Code */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                              {cert.verificationCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(cert.verificationCode);
                                setCopyFeedback(cert.id);
                                setTimeout(() => setCopyFeedback(null), 2000);
                              }}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                              title="Copy Verification Code"
                            >
                              {copyFeedback === cert.id ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                              cert.status === 'Issued'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : cert.status === 'Draft'
                                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                : cert.status === 'Reissued'
                                ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                                : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {cert.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              type="button"
                              onClick={() => setPreviewModalCert(cert)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Preview Certificate"
                            >
                              <Eye size={13} />
                            </button>

                            {/* Download */}
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewModalCert(cert);
                                setTimeout(() => handleDownloadPDF(cert), 200);
                              }}
                              className="p-1.5 bg-[#000E32] hover:bg-[#001750] text-white rounded-lg transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <Download size={13} />
                            </button>

                            {/* Print */}
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewModalCert(cert);
                                setTimeout(() => handlePrint(cert), 200);
                              }}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Print Certificate"
                            >
                              <Printer size={13} />
                            </button>

                            {/* Verify Action Link */}
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToVerification) {
                                  onNavigateToVerification(cert.verificationCode);
                                } else {
                                  window.open(`/verify-certificate/${cert.verificationCode}`, '_blank');
                                }
                              }}
                              className="p-1.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                              title="Verify Certificate"
                            >
                              <ExternalLink size={13} />
                            </button>

                            {/* Reissue Button */}
                            {cert.status !== 'Revoked' && (
                              <button
                                type="button"
                                onClick={() => setReissueModalCert(cert)}
                                className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                title="Reissue Certificate"
                              >
                                <RotateCcw size={13} />
                              </button>
                            )}

                            {/* Revoke Button */}
                            {cert.status !== 'Revoked' && (
                              <button
                                type="button"
                                onClick={() => setRevokeModalCert(cert)}
                                className="p-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                title="Revoke Certificate"
                              >
                                <XCircle size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: STAFF MEMBER PICKER                                */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showStaffPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-white">
                    Select Staff Member
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose an authenticated staff member from the database to issue their Certificate of Employment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStaffPicker(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2 flex-1">
                {staffDirectory.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Users size={32} className="mx-auto text-slate-300" />
                    <p className="text-xs font-bold">No registered staff members found in database.</p>
                    <p className="text-[11px] text-slate-400">You can still type the employee details manually.</p>
                  </div>
                ) : (
                  staffDirectory.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => handleSelectStaff(member)}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-orange-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl flex items-center justify-between gap-4 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#000E32] text-white flex items-center justify-center font-bold text-sm">
                          {(member.fullName || member.full_name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                            {member.fullName || member.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {member.jobTitle || member.job_title || 'Staff'} • {member.departmentId || member.department_id || 'General'}
                          </p>
                          <span className="text-[9px] font-mono text-slate-400">
                            ID: {member.employeeId || member.employee_id || member.id}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 bg-[#000E32] group-hover:bg-orange-600 text-white rounded-xl text-[10px] font-bold uppercase transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: FULL CERTIFICATE PREVIEW & ACTIONS                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {previewModalCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-white flex items-center gap-2">
                    <Award size={18} className="text-orange-500" />
                    Certificate Preview: {previewModalCert.certificateNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Issued to {previewModalCert.employeeName} ({previewModalCert.position})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(previewModalCert)}
                    className="px-3.5 py-2 bg-[#000E32] text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrint(previewModalCert)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(previewModalCert)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewModalCert(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer ml-1"
                  >
                    <XCircle size={22} />
                  </button>
                </div>
              </div>

              {/* Modal Body with Scaled A4 Document */}
              <div className="p-4 sm:p-6 bg-slate-200 dark:bg-slate-950 overflow-auto flex justify-center">
                <div
                  style={{
                    width: '635px',
                    height: '898px',
                  }}
                  className="relative shrink-0 shadow-2xl rounded-sm overflow-hidden"
                >
                  <div
                    style={{
                      transform: 'scale(0.8)',
                      transformOrigin: 'top left',
                      width: '794px',
                      height: '1123px',
                    }}
                  >
                    <CertificateOfEmploymentDocument
                      id="ds-modal-certificate-doc"
                      certificate={previewModalCert}
                      qrCodeDataUrl={qrCodeDataUrl}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: REVOKE CERTIFICATE                                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {revokeModalCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-2xl w-full max-w-md p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase">
                  Revoke Certificate
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to revoke Certificate <strong>{revokeModalCert.certificateNumber}</strong> for <strong>{revokeModalCert.employeeName}</strong>?
                </p>
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  Once revoked, scanning the QR code or verifying this certificate will flag it as REVOKED on the official verification portal.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Revocation Reason / Audit Note *
                </label>
                <textarea
                  rows={2}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Employment contract terminated or superseded."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalCert(null)}
                  className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevoke}
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Confirm Revoke
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: REISSUE CERTIFICATE                                */}
      {/* ========================================================= */}
      <AnimatePresence>
        {reissueModalCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-200 dark:border-blue-900 shadow-2xl w-full max-w-md p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
                <RotateCcw size={24} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase">
                  Reissue Certificate
                </h3>
                <p className="text-xs text-slate-500">
                  Reissuing Certificate <strong>{reissueModalCert.certificateNumber}</strong> for <strong>{reissueModalCert.employeeName}</strong>.
                </p>
                <p className="text-[11px] text-blue-600 font-semibold mt-1">
                  A brand new certificate with unique certificate number and verification code will be generated. The previous certificate record will remain preserved in historical audit records.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reissue Notes / Justification
                </label>
                <textarea
                  rows={2}
                  value={reissueNote}
                  onChange={(e) => setReissueNote(e.target.value)}
                  placeholder="e.g. Employee promotion / position title updated."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReissueModalCert(null)}
                  className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReissue}
                  className="w-1/2 py-2.5 bg-[#000E32] hover:bg-[#001750] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Generate Reissue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
