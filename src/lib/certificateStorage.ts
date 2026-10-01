import { collection, doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { EmploymentCertificate, CertificateStatus } from '../types';
import {
  generateUniqueCertificateReference,
  buildCertificateVerificationUrl,
  generateQrDataUrl,
  createCertificateQrPackage,
  extractVerificationCodeFromScan
} from './certificateQrUtility';

export {
  generateUniqueCertificateReference,
  buildCertificateVerificationUrl,
  generateQrDataUrl,
  createCertificateQrPackage,
  extractVerificationCodeFromScan
};

const CERTIFICATES_COLLECTION = 'employment_certificates';

/**
 * Generate standard Certificate Number
 * Format: DST/COE/[YEAR]/[SEQUENCE]
 */
export function generateCertificateNumber(sequence: number, year: number = new Date().getFullYear()): string {
  const seqStr = String(sequence).padStart(4, '0');
  return `DST/COE/${year}/${seqStr}`;
}

/**
 * Compute the next sequence number by finding the highest sequence in existing certificates
 */
export function computeNextCertificateSequence(certs: EmploymentCertificate[]): number {
  let maxSeq = 0;
  if (Array.isArray(certs)) {
    certs.forEach((c) => {
      if (typeof c.sequenceNumber === 'number' && c.sequenceNumber > maxSeq && c.sequenceNumber < 100000) {
        maxSeq = c.sequenceNumber;
      }
      const candidates = [c.certificateNumber, c.appointmentRefNo];
      candidates.forEach((str) => {
        if (typeof str === 'string') {
          // Match the last sequence of digits e.g. /2026/0004 or -0004
          const m = str.match(/(\d+)(?!.*\d)/);
          if (m) {
            const val = parseInt(m[1], 10);
            if (!isNaN(val) && val > maxSeq && val < 100000) {
              maxSeq = val;
            }
          }
        }
      });
    });
  }
  return maxSeq + 1;
}

/**
 * Generate serial Employee ID automatically
 * Format: DST-STAFF-[SEQUENCE] e.g. DST-STAFF-0001, DST-STAFF-0002...
 */
export function generateSerialEmployeeId(sequence: number): string {
  const seqStr = String(sequence).padStart(4, '0');
  return `DST-STAFF-${seqStr}`;
}

/**
 * Generate standard Appointment Reference Number
 * Format: DST/COE/[YEAR]/[SEQUENCE]
 */
export function generateAppointmentRefNo(sequence: number, year: number = new Date().getFullYear()): string {
  const seqStr = String(sequence).padStart(4, '0');
  return `DST/COE/${year}/${seqStr}`;
}

/**
 * Generate high-entropy unique verification code
 * Format: DST-VRF-[RANDOM_NUMBERS]-[CHECKSUM]
 */
export function generateVerificationCode(): string {
  return generateUniqueCertificateReference('DST-VRF');
}

/**
 * Generate the public verification URL pointing to the real verification endpoint
 */
export function getVerificationUrl(verificationCode: string): string {
  return buildCertificateVerificationUrl(verificationCode);
}

/**
 * Generate crisp QR Code Base64 Data URL for the certificate using the qrcode library
 */
export async function generateCertificateQRCode(verificationUrl: string): Promise<string> {
  return generateQrDataUrl(verificationUrl, {
    size: 300,
    margin: 1,
    errorCorrectionLevel: 'M',
    darkColor: '#000E32',
    lightColor: '#FFFFFF',
  });
}

/**
 * Subscribe to Certificates of Employment in real-time from Firestore & backend
 */
export function apiSubscribeToCertificates(callback: (certs: EmploymentCertificate[]) => void): () => void {
  // 1. One-time fetch from Express backend to guarantee immediate data
  fetch('/api/certificates')
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data && Array.isArray(data.certificates) && data.certificates.length > 0) {
        callback(data.certificates);
      }
    })
    .catch(err => console.warn('Initial backend certificates fetch error:', err));

  // 2. Realtime listener on Firestore collection
  try {
    const q = query(collection(db, CERTIFICATES_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EmploymentCertificate));
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(list);
      }
    }, (err) => {
      console.warn('Firestore employment_certificates listener warning:', err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to setup Firestore listener for certificates:', err);
    return () => {};
  }
}

/**
 * Save / Issue a Certificate of Employment to the database
 */
export async function apiSaveCertificate(cert: EmploymentCertificate): Promise<EmploymentCertificate> {
  const now = new Date().toISOString();
  const record: EmploymentCertificate = {
    ...cert,
    updatedAt: now,
    createdAt: cert.createdAt || now,
  };

  // 1. Persist to Firestore
  try {
    const certRef = doc(db, CERTIFICATES_COLLECTION, record.id);
    await setDoc(certRef, record, { merge: true });
  } catch (err) {
    console.error('Firestore save certificate error:', err);
  }

  // 2. Persist to Server backend
  try {
    await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch (err) {
    console.warn('Backend save certificate error:', err);
  }

  // 3. Dispatch global sync event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_certificate_saved', { detail: record }));
    window.dispatchEvent(new Event('storage'));
  }

  return record;
}

/**
 * Update certificate status (e.g. Revoked, Reissued)
 */
export async function apiUpdateCertificateStatus(
  id: string,
  status: CertificateStatus,
  options?: {
    revocationReason?: string;
    reissueNote?: string;
    previousCertificateId?: string;
    updatedBy?: string;
  }
): Promise<EmploymentCertificate | null> {
  const now = new Date().toISOString();
  const updates: Partial<EmploymentCertificate> = {
    status,
    updatedAt: now,
    ...(options?.revocationReason !== undefined && { revocationReason: options.revocationReason }),
    ...(options?.reissueNote !== undefined && { reissueNote: options.reissueNote }),
    ...(options?.previousCertificateId && { previousCertificateId: options.previousCertificateId }),
    ...(options?.updatedBy && { issuedBy: options.updatedBy }),
  };

  // 1. Firestore update
  try {
    const certRef = doc(db, CERTIFICATES_COLLECTION, id);
    await updateDoc(certRef, updates);
  } catch (err) {
    console.error('Firestore update certificate status error:', err);
  }

  // 2. Backend update
  try {
    const res = await fetch(`/api/certificates/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      return data.certificate;
    }
  } catch (err) {
    console.warn('Backend update certificate status error:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_certificate_updated', { detail: { id, ...updates } }));
    window.dispatchEvent(new Event('storage'));
  }

  return null;
}

/**
 * Permanently delete a Certificate of Employment from Firestore and backend
 */
export async function apiDeleteCertificate(id: string): Promise<boolean> {
  // 1. Delete from Firestore
  try {
    const certRef = doc(db, CERTIFICATES_COLLECTION, id);
    await deleteDoc(certRef);
  } catch (err) {
    console.error('Firestore delete certificate error:', err);
  }

  // 2. Delete from Backend
  try {
    await fetch(`/api/certificates/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Backend delete certificate error:', err);
  }

  // 3. Dispatch global sync event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_certificate_deleted', { detail: { id } }));
    window.dispatchEvent(new Event('storage'));
  }

  return true;
}

/**
 * Verify a certificate by verification code or certificate number
 */
export async function apiVerifyCertificate(codeOrNumber: string): Promise<{
  verified: boolean;
  certificate?: Partial<EmploymentCertificate>;
  error?: string;
}> {
  const queryTerm = (codeOrNumber || '').trim();
  if (!queryTerm) {
    return { verified: false, error: 'Please provide a valid certificate number or verification code.' };
  }

  // 1. Try server backend verification endpoint
  try {
    const res = await fetch(`/api/certificates/verify/${encodeURIComponent(queryTerm)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.verified && data.certificate) {
        return { verified: true, certificate: data.certificate };
      }
    }
  } catch (err) {
    console.warn('Server verification API error, querying Firestore fallback:', err);
  }

  // 2. Fallback to Firestore direct lookup
  try {
    const q1 = query(collection(db, CERTIFICATES_COLLECTION), where('verificationCode', '==', queryTerm));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const docData = snap1.docs[0].data() as EmploymentCertificate;
      return { verified: true, certificate: docData };
    }

    const q2 = query(collection(db, CERTIFICATES_COLLECTION), where('certificateNumber', '==', queryTerm));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const docData = snap2.docs[0].data() as EmploymentCertificate;
      return { verified: true, certificate: docData };
    }

    // Try case-insensitive comparison across all docs
    const allSnap = await getDocs(collection(db, CERTIFICATES_COLLECTION));
    const lower = queryTerm.toLowerCase();
    const match = allSnap.docs.find(d => {
      const data = d.data();
      return (
        (data.verificationCode && String(data.verificationCode).toLowerCase() === lower) ||
        (data.certificateNumber && String(data.certificateNumber).toLowerCase() === lower) ||
        (d.id.toLowerCase() === lower)
      );
    });

    if (match) {
      return { verified: true, certificate: match.data() as EmploymentCertificate };
    }
  } catch (fsErr) {
    console.error('Firestore certificate verification lookup error:', fsErr);
  }

  return {
    verified: false,
    error: 'Certificate not found. The provided verification code is invalid or does not match any officially issued DS Tech record.',
  };
}
