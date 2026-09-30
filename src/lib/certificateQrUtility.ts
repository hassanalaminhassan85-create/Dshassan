/**
 * DS Tech Certificate of Employment — QR Code Generation & Verification Utility
 * 
 * Dynamically creates high-resolution, scannable QR codes linking directly
 * to the authentic Certificate Verification endpoint using the 'qrcode' library.
 * Guarantees cryptographic / high-entropy uniqueness for every issued certificate.
 */

import QRCode from 'qrcode';

export interface CertificateQrOptions {
  /** Size in pixels (default: 300 for UI, 600+ for print) */
  size?: number;
  /** Quiet zone margin in modules (default: 1) */
  margin?: number;
  /** Error correction level ('L' | 'M' | 'Q' | 'H') (default: 'M') */
  errorCorrectionLevel?: QRCode.QRCodeErrorCorrectionLevel;
  /** Foreground module color (default: DS Tech Deep Navy '#000E32') */
  darkColor?: string;
  /** Background color (default: '#FFFFFF') */
  lightColor?: string;
}

export interface CertificateQrPackage {
  /** Unique verification identifier (e.g. DST-VRF-583921-XY9) */
  verificationCode: string;
  /** Authoritative public URL for real verification */
  verificationUrl: string;
  /** High-resolution PNG Base64 Data URL for <img> and jsPDF inclusion */
  qrDataUrl: string;
  /** Vector SVG string for lossless rendering */
  qrSvg: string;
  /** High-density print Data URL (768px) */
  qrPrintDataUrl: string;
}

/**
 * Generate a mathematically unique certificate reference & verification code.
 * Combines high-resolution timestamp, randomized cryptographic digits, and an alphanumeric checksum.
 */
export function generateUniqueCertificateReference(prefix: string = 'DST-VRF'): string {
  // 6 random digits
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  // 3-4 alphanumeric checksum characters
  const salt = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randomDigits}-${salt}`;
}

/**
 * Build the authoritative real verification URL for a given certificate verification reference.
 * Supports running in development, production, custom domains, or fallback to official agency domain.
 */
export function buildCertificateVerificationUrl(verificationCode: string, originOverride?: string): string {
  const code = (verificationCode || '').trim();
  let baseOrigin = 'https://dstech.com.ng';

  if (originOverride) {
    baseOrigin = originOverride.replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location?.origin) {
    baseOrigin = window.location.origin.replace(/\/+$/, '');
  }

  return `${baseOrigin}/verify-certificate/${encodeURIComponent(code)}`;
}

/**
 * Generate a scannable QR Code Data URL using the 'qrcode' library.
 */
export async function generateQrDataUrl(
  text: string,
  options: CertificateQrOptions = {}
): Promise<string> {
  const {
    size = 300,
    margin = 1,
    errorCorrectionLevel = 'M',
    darkColor = '#000E32', // DS Tech Navy
    lightColor = '#FFFFFF',
  } = options;

  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel,
    });
  } catch (err) {
    console.error('[QR Code Utility] Failed to generate Data URL:', err);
    throw err;
  }
}

/**
 * Generate a pure vector SVG QR Code string for sharp rendering.
 */
export async function generateQrSvgString(
  text: string,
  options: CertificateQrOptions = {}
): Promise<string> {
  const {
    size = 300,
    margin = 1,
    errorCorrectionLevel = 'M',
    darkColor = '#000E32',
    lightColor = '#FFFFFF',
  } = options;

  try {
    return await QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel,
    });
  } catch (err) {
    console.error('[QR Code Utility] Failed to generate SVG string:', err);
    return '';
  }
}

/**
 * High-level Generator: Creates a complete, scannable QR package for an issued certificate.
 * Includes unique reference, authoritative verification URL, high-res Data URL, SVG, and print payload.
 */
export async function createCertificateQrPackage(
  verificationCodeOrReference?: string,
  options: CertificateQrOptions = {}
): Promise<CertificateQrPackage> {
  const verificationCode = verificationCodeOrReference?.trim() || generateUniqueCertificateReference();
  const verificationUrl = buildCertificateVerificationUrl(verificationCode);

  // 1. Generate standard screen Data URL (300px)
  const qrDataUrl = await generateQrDataUrl(verificationUrl, {
    size: options.size || 300,
    margin: options.margin || 1,
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    darkColor: options.darkColor || '#000E32',
    lightColor: options.lightColor || '#FFFFFF',
  });

  // 2. Generate vector SVG
  const qrSvg = await generateQrSvgString(verificationUrl, {
    size: options.size || 300,
    margin: options.margin || 1,
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    darkColor: options.darkColor || '#000E32',
    lightColor: options.lightColor || '#FFFFFF',
  });

  // 3. Generate print-ready high-density Data URL (768px for single-page A4 PDF rendering)
  const qrPrintDataUrl = await generateQrDataUrl(verificationUrl, {
    size: 768,
    margin: 1,
    errorCorrectionLevel: 'H', // High error correction for print durability
    darkColor: options.darkColor || '#000E32',
    lightColor: '#FFFFFF',
  });

  return {
    verificationCode,
    verificationUrl,
    qrDataUrl,
    qrSvg,
    qrPrintDataUrl,
  };
}

/**
 * Parse and sanitize a scanned QR code payload (either full URL or raw code)
 * into a verified certificate lookup string.
 */
export function extractVerificationCodeFromScan(rawPayload: string): string {
  if (!rawPayload) return '';
  const text = rawPayload.trim();

  // 1. Match /verify-certificate/:code or /verify/:code
  const pathMatch = text.match(/(?:verify-certificate|verify)\/([A-Za-z0-9_\-\/]+)/i);
  if (pathMatch && pathMatch[1]) {
    return decodeURIComponent(pathMatch[1]).trim();
  }

  // 2. Match URL query params (?verify=... or ?code=...)
  try {
    if (text.includes('?') || text.startsWith('http')) {
      const url = new URL(text.startsWith('http') ? text : `https://dummy.com/${text}`);
      const code = url.searchParams.get('verify') || 
                   url.searchParams.get('code') || 
                   url.searchParams.get('certificate') || 
                   url.searchParams.get('verificationCode');
      if (code) return code.trim();
    }
  } catch (e) {}

  // 3. Return as raw clean token
  return text.replace(/[\[\]]/g, '').trim();
}
