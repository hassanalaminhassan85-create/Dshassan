import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award, FileText, Download, Printer, Share2, CheckCircle2,
  AlertCircle, Search, Filter, RefreshCw, Eye, Plus, ShieldCheck,
  Building, User, Calendar, QrCode, ArrowRight, ArrowLeft,
  XCircle, Copy, ExternalLink, Check, RotateCcw, AlertTriangle, Users,
  Maximize2, Minimize2, PenTool, Feather, CheckSquare, Sparkles, Layout,
  Smartphone, Mail, Trash2
} from 'lucide-react';
import { EmploymentCertificate, CertificateStatus } from '../../types';
import { CertificateOfEmploymentDocument } from './CertificateOfEmploymentDocument';
import { CeoSignatureStudio, CeoSignatureResult, OFFICIAL_CEO_PRESET_SVG } from './CeoSignatureStudio';
import { InAppCalendarDatePicker } from './InAppCalendarDatePicker';
import {
  apiSubscribeToCertificates,
  apiSaveCertificate,
  apiUpdateCertificateStatus,
  apiDeleteCertificate,
  generateCertificateNumber,
  generateAppointmentRefNo,
  computeNextCertificateSequence,
  generateSerialEmployeeId,
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
  getCachedCertificatePDF,
  setCachedCertificatePDF,
  clearCachedCertificatePDF,
  clearAllCertificateBlobCache,
} from './certificatePdfUtils';
import { CertificateShareModal } from './CertificateShareModal';
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
  const [dateOfConfirmation, setDateOfConfirmation] = useState<string>('');
  const [employmentStatus, setEmploymentStatus] = useState<string>('Confirmed');
  const [employmentType, setEmploymentType] = useState<string>('Full-Time Permanent');

  // Certificate Information
  const [appointmentRefNo, setAppointmentRefNo] = useState<string>('');
  const [certificateNumber, setCertificateNumber] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(() => {
    return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  });
  const [authorizedOfficerName, setAuthorizedOfficerName] = useState<string>('');
  const [authorizedOfficerPosition, setAuthorizedOfficerPosition] = useState<string>('Company Director/CEO');
  const [allowManualOverrides, setAllowManualOverrides] = useState<boolean>(false);

  // Auto-generated Verification state
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Dedicated Export Target State (to render any certificate 1:1 for PDF/Print without modal scale dependencies)
  const [exportCertData, setExportCertData] = useState<Partial<EmploymentCertificate> | null>(null);
  const [exportQrUrl, setExportQrUrl] = useState<string>('');

  // Active Selected Certificate for Actions/Preview
  const [previewModalCert, setPreviewModalCert] = useState<EmploymentCertificate | null>(null);
  const [revokeModalCert, setRevokeModalCert] = useState<EmploymentCertificate | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('');
  const [reissueModalCert, setReissueModalCert] = useState<EmploymentCertificate | null>(null);
  const [reissueNote, setReissueNote] = useState<string>('');
  const [deleteModalCert, setDeleteModalCert] = useState<EmploymentCertificate | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Operations Loading
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [shareModalData, setShareModalData] = useState<{
    blob: Blob | null;
    file: File | null;
    fileName: string;
    certificate: Partial<EmploymentCertificate>;
    isCompiling?: boolean;
  } | null>(null);

  // CEO Official Signature & Executive Authorization State
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>(OFFICIAL_CEO_PRESET_SVG);
  const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload' | 'preset'>('preset');
  const [ceoSignatoryName, setCeoSignatoryName] = useState<string>('');
  const [ceoSignatureDate, setCeoSignatureDate] = useState<string>(() => {
    return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  });
  const [ceoSignatureHash, setCeoSignatureHash] = useState<string>('DST-EXEC-AUTH-2026');
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);

  // Responsive Live Preview Auto-Fit & Layout Modes
  const [previewScale, setPreviewScale] = useState<number>(0.68);
  const [zoomMode, setZoomMode] = useState<'auto' | 'custom'>('auto');
  const [previewLayout, setPreviewLayout] = useState<'split' | 'preview-focus'>('split');
  const [showFullscreenPreview, setShowFullscreenPreview] = useState<boolean>(false);
  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const certContainerRef = useRef<HTMLDivElement>(null);
  const modalCertContainerRef = useRef<HTMLDivElement>(null);

  // History Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Handle CEO Signature Apply from Studio (Both live sync and explicit confirm)
  const handleCeoSignatureApply = (result: CeoSignatureResult) => {
    setSignatureDataUrl(result.signatureDataUrl || OFFICIAL_CEO_PRESET_SVG);
    setSignatureType(result.signatureType);
    if (result.signatoryName) {
      setCeoSignatoryName(result.signatoryName);
      setAuthorizedOfficerName(result.signatoryName);
    }
    if (result.signatoryPosition) {
      setAuthorizedOfficerPosition(result.signatoryPosition);
    }
    if (result.signedAt) {
      setCeoSignatureDate(result.signedAt);
    }
    if (result.signatureHash) {
      setCeoSignatureHash(result.signatureHash);
    }
  };

  const handleClearSignature = () => {
    setSignatureDataUrl(OFFICIAL_CEO_PRESET_SVG);
    setSignatureType('preset');
    showToast('info', 'Signature reset to DS Tech official preset vector seal.');
  };

  // Automatically calculate next serial Employee ID from certificates & staff directory
  const computeNextSerialEmployeeId = (certs: EmploymentCertificate[], staff: any[]): string => {
    let maxSeq = 0;
    certs.forEach((c) => {
      if (c.employeeId) {
        const m = c.employeeId.match(/(\d+)/);
        if (m) {
          const num = parseInt(m[1], 10);
          if (!isNaN(num) && num > maxSeq && num < 100000) maxSeq = num;
        }
      }
    });
    staff.forEach((s) => {
      const id = s.employeeId || s.employee_id || '';
      const m = id.match(/(\d+)/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq && num < 100000) maxSeq = num;
      }
    });
    const nextNum = Math.max(maxSeq + 1, certs.length + 1, 1);
    return generateSerialEmployeeId(nextNum);
  };

  // Load existing certificate from registry into editor for signing / reissue
  const handleLoadCertificateToEdit = (cert: EmploymentCertificate) => {
    setCertificateNumber(cert.certificateNumber);
    setAppointmentRefNo(cert.appointmentRefNo || cert.certificateNumber);
    setEmployeeName(cert.employeeName);
    setEmployeeId(cert.employeeId);
    setPosition(cert.position);
    setDepartment(cert.department);
    setDateOfAppointment(cert.dateOfAppointment);
    setDateOfConfirmation(cert.dateOfConfirmation || '');
    setEmploymentStatus(cert.employmentStatus || 'Confirmed');
    setEmploymentType(cert.employmentType || 'Full-Time Permanent');
    setIssueDate(cert.issueDate);
    setVerificationCode(cert.verificationCode);
    setSignatureDataUrl(cert.signatureDataUrl || OFFICIAL_CEO_PRESET_SVG);
    setSignatureType(cert.signatureType || 'preset');
    setCeoSignatoryName(cert.ceoSignatoryName || cert.authorizedOfficerName || '');
    setAuthorizedOfficerName(cert.ceoSignatoryName || cert.authorizedOfficerName || '');
    setAuthorizedOfficerPosition(cert.ceoSignatureTitle || cert.authorizedOfficerPosition || 'Company Director/CEO');
    if (cert.ceoSignatureDate) setCeoSignatureDate(cert.ceoSignatureDate);
    if (cert.ceoSignatureHash) setCeoSignatureHash(cert.ceoSignatureHash);
    setActiveTab('create');
    showToast('info', `Loaded Certificate ${cert.certificateNumber} for ${cert.employeeName}. Ready for CEO signing.`);
  };

  // Responsive Auto-Fit calculation: adapts preview perfectly to any container width
  useEffect(() => {
    const handleResize = () => {
      if (previewWrapperRef.current && zoomMode === 'auto') {
        const containerWidth = previewWrapperRef.current.clientWidth;
        // Available width accounting for container padding
        const available = Math.max(260, containerWidth - 36);
        const computed = Math.min(1.0, Math.max(0.35, available / 794));
        setPreviewScale(Number(computed.toFixed(2)));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (previewWrapperRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(handleResize);
      observer.observe(previewWrapperRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [zoomMode, previewLayout]);

  // Initialize new Certificate Identifiers with auto serial Employee ID
  const resetFormToNew = () => {
    const currentYear = new Date().getFullYear();
    const nextSeq = computeNextCertificateSequence(certificates);
    const certNum = generateCertificateNumber(nextSeq, currentYear);
    const refNum = generateAppointmentRefNo(nextSeq, currentYear);
    const vCode = generateVerificationCode();
    const autoEmpId = computeNextSerialEmployeeId(certificates, staffDirectory);

    setCertificateNumber(certNum);
    setAppointmentRefNo(refNum);
    setVerificationCode(vCode);
    setEmployeeId(autoEmpId);

    setEmployeeName('');
    setPosition('');
    setDepartment('');
    setDateOfAppointment('');
    setDateOfConfirmation('');
    setEmploymentStatus('Confirmed');
    setEmploymentType('Full-Time Permanent');
    setIssueDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
    setCeoSignatoryName('');
    setAuthorizedOfficerName('');
    setSignatureDataUrl(OFFICIAL_CEO_PRESET_SVG);
    setSignatureType('preset');
  };

  // Real-time Database Subscriptions
  useEffect(() => {
    // Clear any stale cached PDFs from memory
    clearAllCertificateBlobCache();
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

  // Update initial certificate numbers and auto serial Employee ID when certificates list loads
  useEffect(() => {
    if (loading) return;
    const currentYear = new Date().getFullYear();
    const nextSeq = computeNextCertificateSequence(certificates);
    // If certificateNumber is uninitialized OR user has not typed an employee yet and sequence was stuck at 0001
    if (!certificateNumber || (!employeeName.trim() && certificateNumber.endsWith('0001') && nextSeq > 1)) {
      setCertificateNumber(generateCertificateNumber(nextSeq, currentYear));
      setAppointmentRefNo(generateAppointmentRefNo(nextSeq, currentYear));
      if (!verificationCode) {
        setVerificationCode(generateVerificationCode());
      }
    }
    if (!employeeId || (!employeeName.trim() && employeeId.endsWith('0001'))) {
      setEmployeeId(computeNextSerialEmployeeId(certificates, staffDirectory));
    }
  }, [certificates, staffDirectory, loading]);

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
    dateOfConfirmation: dateOfConfirmation || issueDate || dateOfAppointment,
    employmentStatus,
    employmentType,
    issueDate,
    authorizedOfficerName: ceoSignatoryName || authorizedOfficerName,
    authorizedOfficerPosition,
    verificationCode,
    qrVerificationUrl: getVerificationUrl(verificationCode),
    signatureDataUrl: signatureDataUrl || OFFICIAL_CEO_PRESET_SVG,
    signatureType,
    ceoSignatoryName,
    ceoSignatureDate,
    ceoSignatureTitle: authorizedOfficerPosition,
    ceoSignatureHash,
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
        dateOfConfirmation: dateOfConfirmation.trim() || dateOfAppointment.trim() || issueDate.trim(),
        employmentStatus,
        employmentType,
        issueDate: issueDate.trim(),
        authorizedOfficerName: ceoSignatoryName.trim() || authorizedOfficerName,
        authorizedOfficerPosition: authorizedOfficerPosition.trim() || 'Company Director/CEO',
        verificationCode: verificationCode.trim(),
        qrVerificationUrl: getVerificationUrl(verificationCode.trim()),
        signatureDataUrl: signatureDataUrl || OFFICIAL_CEO_PRESET_SVG,
        signatureType,
        ceoSignatoryName: ceoSignatoryName.trim(),
        ceoSignatureDate,
        ceoSignatureTitle: authorizedOfficerPosition.trim() || 'Company Director/CEO',
        ceoSignatureHash,
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

  // Delete Certificate Permanently
  const handleDeleteCertificate = async () => {
    if (!deleteModalCert?.id) return;
    setIsDeleting(true);
    try {
      await apiDeleteCertificate(deleteModalCert.id);
      clearCachedCertificatePDF(deleteModalCert.id);
      setCertificates((prev) => prev.filter((c) => c.id !== deleteModalCert.id));
      showToast('success', `Certificate ${deleteModalCert.certificateNumber} permanently deleted.`);
      if (previewModalCert?.id === deleteModalCert.id) {
        setPreviewModalCert(null);
      }
      setDeleteModalCert(null);
    } catch (err: any) {
      console.error('[Delete Error]', err);
      showToast('error', err?.message || 'Failed to delete certificate.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Download PDF Action
  const handleDownloadPDF = async (certOverride?: EmploymentCertificate) => {
    const cert = certOverride || previewModalCert || (currentCertificateData as EmploymentCertificate);
    setIsGeneratingPDF(true);
    try {
      setExportCertData(cert);
      if (cert.verificationCode) {
        const vUrl = cert.qrVerificationUrl || getVerificationUrl(cert.verificationCode);
        const qr = await generateCertificateQRCode(vUrl).catch(() => '');
        setExportQrUrl(qr);
      }
      // Double rAF + safe delay ensures React renders export target with 100% updated state
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise((resolve) => setTimeout(resolve, 200));

      const targetEl =
        (previewModalCert?.id === cert.id ? document.getElementById('ds-modal-certificate-doc') : null) ||
        document.getElementById('ds-certificate-clean-export-doc') ||
        document.getElementById('ds-certificate-of-employment-document');

      if (!targetEl) {
        throw new Error('Certificate rendering canvas not ready.');
      }

      const blob = await generateCertificatePDFBlob(targetEl);
      const fileName = formatCertificateFileName(cert);
      if (cert.id) {
        const file = new File([blob], fileName, { type: 'application/pdf', lastModified: Date.now() });
        setCachedCertificatePDF(cert.id, blob, file);
      }
      downloadCertificateBlob(blob, fileName);
      showToast('success', `Downloaded ${fileName}`);
    } catch (err: any) {
      console.error('[PDF Generation Error]', err);
      showToast('error', err?.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print Action
  const handlePrint = async (certOverride?: EmploymentCertificate) => {
    const cert = certOverride || previewModalCert || (currentCertificateData as EmploymentCertificate);
    try {
      showToast('info', 'Preparing print-ready certificate...');
      setExportCertData(cert);
      if (cert.verificationCode) {
        const vUrl = cert.qrVerificationUrl || getVerificationUrl(cert.verificationCode);
        const qr = await generateCertificateQRCode(vUrl).catch(() => '');
        setExportQrUrl(qr);
      }
      // Double rAF + safe delay ensures React renders export target with 100% updated state
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise((resolve) => setTimeout(resolve, 200));

      const targetEl =
        (previewModalCert?.id === cert.id ? document.getElementById('ds-modal-certificate-doc') : null) ||
        document.getElementById('ds-certificate-clean-export-doc') ||
        document.getElementById('ds-certificate-of-employment-document');

      if (!targetEl) {
        throw new Error('Certificate element not available for printing.');
      }
      await printCertificateElement(targetEl as HTMLElement);
    } catch (err: any) {
      console.error('[Print Error]', err);
      showToast('error', err?.message || 'Print error. Please try downloading PDF instead.');
    }
  };

  // Pre-generate and cache PDF in the background whenever a certificate is previewed so Share is instant
  useEffect(() => {
    if (!previewModalCert?.id) return;
    const cert = previewModalCert;

    // Immediately sync export data with the specific previewed certificate
    setExportCertData(cert);
    if (cert.verificationCode) {
      const vUrl = cert.qrVerificationUrl || getVerificationUrl(cert.verificationCode);
      generateCertificateQRCode(vUrl).then(setExportQrUrl).catch(() => {});
    }

    const cached = getCachedCertificatePDF(cert.id);
    if (cached) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        // Prioritize the modal certificate doc which is guaranteed to be rendered with previewModalCert
        const targetEl =
          document.getElementById('ds-modal-certificate-doc') ||
          document.getElementById('ds-certificate-clean-export-doc');
        if (targetEl && isMounted) {
          const blob = await generateCertificatePDFBlob(targetEl);
          const fileName = formatCertificateFileName(cert);
          const file = new File([blob], fileName, { type: 'application/pdf', lastModified: Date.now() });
          setCachedCertificatePDF(cert.id, blob, file);
        }
      } catch {
        // Silent background preheat catch
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [previewModalCert]);

  // Share Action: Pops up phone native share channels with exact PDF, or displays channels modal
  const handleShare = async (certOverride?: EmploymentCertificate) => {
    // 1. Determine exact certificate to share (prioritizing override, then preview modal cert, then active form only if name is entered)
    const cert =
      certOverride ||
      previewModalCert ||
      (employeeName.trim() ? (currentCertificateData as EmploymentCertificate) : null);

    if (!cert || !cert.employeeName || cert.employeeName.trim() === '') {
      showToast('error', 'Please select a certificate to share or fill in the employee details first.');
      return;
    }

    const fileName = formatCertificateFileName(cert);

    // Sync export targets immediately
    setExportCertData(cert);
    if (cert.verificationCode) {
      const vUrl = cert.qrVerificationUrl || getVerificationUrl(cert.verificationCode);
      const qr = await generateCertificateQRCode(vUrl).catch(() => '');
      setExportQrUrl(qr);
    }

    // 2. If PDF is already pre-cached in memory for this exact certificate ID:
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

        // Trigger native share sheet directly with ONLY the PDF file
        try {
          const res = await shareCertificatePDF(cached.blob, fileName, cert);
          if (res.shared) {
            showToast('success', 'PDF shared directly!');
          }
        } catch {
          // Modal will remain open for fallback
        }
        return;
      }
    }

    // 3. Open channels modal immediately with compiling indicator
    setShareModalData({
      blob: null,
      file: null,
      fileName,
      certificate: cert,
      isCompiling: true,
    });

    setIsSharing(true);
    try {
      // Double rAF + safe delay ensures React renders export target with 100% updated state
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise((resolve) => setTimeout(resolve, 200));

      const targetEl =
        (previewModalCert?.id === cert.id ? document.getElementById('ds-modal-certificate-doc') : null) ||
        document.getElementById('ds-certificate-clean-export-doc') ||
        document.getElementById('ds-certificate-of-employment-document');

      if (!targetEl) {
        throw new Error('Certificate element not ready.');
      }

      const blob = await generateCertificatePDFBlob(targetEl);
      const file = new File([blob], fileName, { type: 'application/pdf', lastModified: Date.now() });

      if (cert.id) {
        setCachedCertificatePDF(cert.id, blob, file);
      }

      // Update modal with ready PDF
      setShareModalData({
        blob,
        file,
        fileName,
        certificate: cert,
        isCompiling: false,
      });

      // Attempt native share with ONLY the PDF file
      try {
        const res = await shareCertificatePDF(blob, fileName, cert);
        if (res.shared) {
          showToast('success', 'PDF shared directly!');
        }
      } catch {
        // Fallback is already displayed in the modal
      }
    } catch (err: any) {
      console.error('[Share Error]', err);
      showToast('error', 'Select a share channel below or save PDF to device.');
    } finally {
      setIsSharing(false);
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
                  Pick from the database to populate staff details.
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                        Employee ID *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newSerial = computeNextSerialEmployeeId(certificates, staffDirectory);
                          setEmployeeId(newSerial);
                          showToast('info', `Generated next serial ID: ${newSerial}`);
                        }}
                        className="text-[9px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 cursor-pointer"
                        title="Generate next available serial Employee ID"
                      >
                        <RefreshCw size={10} />
                        <span>Next</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. DST-STAFF-0001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-black focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                    <span className="text-[9.5px] text-slate-400 block mt-1 font-mono">
                      Sequential organizational staff identifier
                    </span>
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <InAppCalendarDatePicker
                      label="Date of Initial Appointment"
                      value={dateOfAppointment}
                      onChange={(formatted) => setDateOfAppointment(formatted)}
                      required={true}
                      placeholder="Select appointment date..."
                      helperText="One-click selection • Formats into official certificate date"
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
                
                {/* Issue Date & Confirmation Date with In-App Calendar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <InAppCalendarDatePicker
                      label="Certificate Issue Date"
                      value={issueDate}
                      onChange={(formatted) => setIssueDate(formatted)}
                      required={true}
                      placeholder="Select issue date..."
                      helperText="Official issuance date stamped on certificate"
                    />
                  </div>

                  <div>
                    <InAppCalendarDatePicker
                      label="Effective Date of Employment"
                      value={dateOfConfirmation || issueDate}
                      onChange={(formatted) => setDateOfConfirmation(formatted)}
                      placeholder="Select effective date..."
                      helperText="Official effective date of employment certificate"
                    />
                  </div>
                </div>

                {/* Authorized Officer Name & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Authorized Signatory Name
                    </label>
                    <input
                      type="text"
                      value={ceoSignatoryName}
                      onChange={(e) => {
                        setCeoSignatoryName(e.target.value);
                        setAuthorizedOfficerName(e.target.value);
                      }}
                      placeholder="Leave empty or input CEO / Signatory Name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <span className="text-[9.5px] text-slate-400 block mt-1 font-mono">
                      CEO can enter during e-signing or leave empty
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Authorized Officer Title
                    </label>
                    <input
                      type="text"
                      value={authorizedOfficerPosition}
                      onChange={(e) => setAuthorizedOfficerPosition(e.target.value)}
                      placeholder="Company Director/CEO"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Auto-Generated Identifiers Panel */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#000E32] dark:text-white tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-500" />
                      Official Certificate Identifiers
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

            {/* Form Section 3: CEO Official Signature & Authorization Tools */}
            <div className="space-y-2">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#000E32] dark:text-white tracking-wider flex items-center gap-1.5">
                  <Feather size={14} className="text-orange-500" />
                  Official Authorization Step
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Step 3 of 3</span>
              </div>

              <CeoSignatureStudio
                currentSignatureUrl={signatureDataUrl}
                currentSignatureType={signatureType}
                initialSignatoryName={ceoSignatoryName}
                initialSignatoryPosition={authorizedOfficerPosition}
                onSignatureApply={handleCeoSignatureApply}
                onClearSignature={handleClearSignature}
              />
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
                  disabled={isSharing}
                  onClick={() => handleShare()}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Share Certificate PDF to all phone channels"
                >
                  <Share2 size={12} className={isSharing ? 'animate-spin text-orange-500' : ''} />
                  <span>{isSharing ? 'Sharing...' : 'Share'}</span>
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

          {/* RIGHT: Live A4 Portrait Preview (7 cols or full) */}
          <div className="xl:col-span-7 space-y-4">
            
            {/* Live Preview Controls Header */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider text-[#000E32] dark:text-white flex items-center gap-2">
                  <Eye size={15} className="text-orange-500" />
                  Live Preview (A4 Portrait 1:1)
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Responsive single-page rendering. Click on signature to sign or use tools.
                </p>
              </div>

              {/* Scaling & Signature Action Controls */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Auto-Fit / Zoom Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setZoomMode('auto');
                      if (previewWrapperRef.current) {
                        const width = previewWrapperRef.current.clientWidth;
                        const available = Math.max(260, width - 36);
                        const computed = Math.min(1.0, Math.max(0.35, available / 794));
                        setPreviewScale(Number(computed.toFixed(2)));
                      }
                    }}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                      zoomMode === 'auto'
                        ? 'bg-[#000E32] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                    title="Fit certificate to container width without horizontal overflow"
                  >
                    Fit ({Math.round(previewScale * 100)}%)
                  </button>

                  {[0.5, 0.65, 0.8, 1.0].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setZoomMode('custom');
                        setPreviewScale(s);
                      }}
                      className={`px-1.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                        zoomMode === 'custom' && previewScale === s
                          ? 'bg-[#000E32] text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      {Math.round(s * 100)}%
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowFullscreenPreview(true)}
                    title="Open Fullscreen HD Preview"
                    className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>

                {/* Quick CEO Sign Trigger */}
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                >
                  <PenTool size={11} />
                  <span>CEO Sign</span>
                </button>
              </div>
            </div>

            {/* Document Frame Container with Responsive Auto-Fit Centering */}
            <div
              ref={previewWrapperRef}
              className="bg-slate-200/70 dark:bg-slate-950 p-3 sm:p-6 rounded-3xl border border-slate-300/80 dark:border-slate-800 flex justify-center items-start shadow-inner overflow-x-auto min-h-[500px]"
            >
              <div
                style={{
                  width: `${794 * previewScale}px`,
                  height: `${1123 * previewScale}px`,
                  transition: 'width 0.15s ease-out, height 0.15s ease-out',
                }}
                className="relative shrink-0 shadow-2xl rounded-sm overflow-hidden bg-white"
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
                    onSignClick={() => setShowSignatureModal(true)}
                    interactive={true}
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
                            {/* Edit / Sign */}
                            <button
                              type="button"
                              onClick={() => handleLoadCertificateToEdit(cert)}
                              className="p-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 rounded-lg transition-colors cursor-pointer"
                              title="Edit & Sign Certificate"
                            >
                              <PenTool size={13} />
                            </button>

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
                              onClick={() => handleDownloadPDF(cert)}
                              className="p-1.5 bg-[#000E32] hover:bg-[#001750] text-white rounded-lg transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <Download size={13} />
                            </button>

                            {/* Print */}
                            <button
                              type="button"
                              onClick={() => handlePrint(cert)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Print Certificate"
                            >
                              <Printer size={13} />
                            </button>

                            {/* Share */}
                            <button
                              type="button"
                              onClick={() => handleShare(cert)}
                              className="p-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 rounded-lg transition-colors cursor-pointer"
                              title="Share Certificate PDF"
                            >
                              <Share2 size={13} />
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

                            {/* Delete Certificate Button */}
                            <button
                              type="button"
                              onClick={() => setDeleteModalCert(cert)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg transition-colors cursor-pointer"
                              title="Delete Certificate Permanently"
                            >
                              <Trash2 size={13} />
                            </button>
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
                    onClick={() => {
                      if (previewModalCert) setDeleteModalCert(previewModalCert);
                    }}
                    className="px-3 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                    title="Delete Certificate"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
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
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer with Actions for quick access on mobile */}
              <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalCert(null)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (previewModalCert) setDeleteModalCert(previewModalCert);
                    }}
                    className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(previewModalCert)}
                    className="px-3.5 py-2 bg-[#000E32] hover:bg-[#001750] text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Download</span> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(previewModalCert)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-md shadow-orange-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>Share Certificate</span>
                  </button>
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

      {/* ========================================================= */}
      {/* MODAL: DELETE CERTIFICATE CONFIRMATION                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {deleteModalCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900/60 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Delete Certificate
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{deleteModalCert.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate No:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{deleteModalCert.certificateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Position:</span>
                  <span className="text-slate-700 dark:text-slate-300">{deleteModalCert.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Code:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{deleteModalCert.verificationCode}</span>
                </div>
              </div>

              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-medium">
                Deleting this certificate will permanently remove its database record and invalidate any public verification link or printed QR code.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalCert(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCertificate}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>Delete Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: CEO SIGNATURE & AUTHORIZATION STUDIO               */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showSignatureModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-2xl my-auto"
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(false)}
                  className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <XCircle size={20} />
                </button>

                <CeoSignatureStudio
                  currentSignatureUrl={signatureDataUrl}
                  currentSignatureType={signatureType}
                  initialSignatoryName={ceoSignatoryName}
                  initialSignatoryPosition={authorizedOfficerPosition}
                  onSignatureApply={handleCeoSignatureApply}
                  onClearSignature={handleClearSignature}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: FULLSCREEN HD CERTIFICATE PREVIEW                  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showFullscreenPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 overflow-hidden"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Award className="text-orange-500" size={20} />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Fullscreen Certificate Inspection
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ref: {appointmentRefNo || certificateNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <PenTool size={13} />
                  <span>CEO Sign</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF()}
                  className="px-3 py-1.5 rounded-xl bg-[#000E32] border border-blue-900 hover:bg-blue-900 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrint()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare()}
                  className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFullscreenPreview(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Document Center */}
            <div className="flex-1 overflow-auto flex justify-center items-start p-4 sm:p-8">
              <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white shrink-0 my-auto">
                <CertificateOfEmploymentDocument
                  id="ds-modal-fullscreen-certificate-doc"
                  certificate={currentCertificateData}
                  qrCodeDataUrl={qrCodeDataUrl}
                  onSignClick={() => setShowSignatureModal(true)}
                  interactive={true}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: SHARE CERTIFICATE CHANNELS PICKER                 */}
      {/* ========================================================= */}
      <CertificateShareModal
        isOpen={!!shareModalData}
        onClose={() => setShareModalData(null)}
        certificate={shareModalData?.certificate || null}
        pdfBlob={shareModalData?.blob || null}
        pdfFile={shareModalData?.file || null}
        fileName={shareModalData?.fileName || 'Certificate.pdf'}
        isCompiling={shareModalData?.isCompiling}
        onToast={showToast}
      />

      {/* Hidden Clean 1:1 Rendering Target for 100% Reliable PDF & Print Generation (Zero Mobile Scaling Glitches) */}
      <div
        id="ds-certificate-clean-export-container"
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
          id="ds-certificate-clean-export-doc"
          certificate={exportCertData || currentCertificateData}
          qrCodeDataUrl={exportQrUrl || qrCodeDataUrl}
        />
      </div>

    </div>
  );
};
