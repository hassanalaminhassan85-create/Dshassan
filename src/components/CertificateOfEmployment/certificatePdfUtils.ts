import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { EmploymentCertificate } from '../../types';

export function sanitizeFileNamePart(str: string): string {
  return (str || '')
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatCertificateFileName(certificate: Partial<EmploymentCertificate>): string {
  const cleanName = sanitizeFileNamePart(certificate.employeeName || 'Staff');
  const cleanCertNo = sanitizeFileNamePart(certificate.certificateNumber || 'CERT');
  return `DS-Tech-Certificate-of-Employment-${cleanName}-${cleanCertNo}.pdf`;
}

/**
 * Convert any CSS color (including modern oklch, lab, lch) to standard rgb/rgba string
 * using in-memory 2D canvas context to guarantee 100% html2canvas compatibility.
 */
function safeConvertColor(colorStr: string): string {
  if (!colorStr || !colorStr.includes('oklch')) return colorStr;
  try {
    const cvs = document.createElement('canvas');
    cvs.width = 1;
    cvs.height = 1;
    const ctx = cvs.getContext('2d');
    if (!ctx) return colorStr;
    ctx.fillStyle = colorStr;
    return ctx.fillStyle || colorStr;
  } catch {
    return colorStr;
  }
}

/**
 * Render high-resolution pixel-perfect canvas from certificate DOM element
 */
export async function renderCertificateCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  // 1. Wait for web fonts with safe timeout to avoid hanging on slow mobile connections
  try {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 1200))
      ]);
    }
  } catch (fontErr) {
    console.warn('[Certificate PDF] Font readiness check skipped:', fontErr);
  }
  await new Promise((resolve) => setTimeout(resolve, 150));

  // 2. High-precision scale factor (2x scale produces razor-sharp 1588x2246 canvas within safe memory limits)
  const scale = 2;

  // 3. Render pixel-perfect canvas using html2canvas-pro (with locked desktop viewport and explicit A4 bounds)
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    imageTimeout: 10000,
    width: 794,
    height: 1123,
    windowWidth: 1024, // Crucial: forces desktop viewport in iframe so flex and text NEVER collapse to mobile width!
    windowHeight: 1400,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc) => {
      // Ensure dark mode classes are removed across cloned document
      clonedDoc.documentElement.classList.remove('dark');
      clonedDoc.body.classList.remove('dark');
      clonedDoc.documentElement.style.backgroundColor = '#FFFFFF';
      clonedDoc.body.style.backgroundColor = '#FFFFFF';
      clonedDoc.documentElement.style.margin = '0';
      clonedDoc.documentElement.style.padding = '0';
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';

      const clonedTarget =
        (element.id ? clonedDoc.getElementById(element.id) : null) ||
        clonedDoc.getElementById('ds-certificate-clean-export-doc') ||
        clonedDoc.getElementById('ds-modal-certificate-doc') ||
        clonedDoc.getElementById('ds-certificate-of-employment-document');

      if (clonedTarget) {
        // Isolate clonedTarget directly into clonedDoc.body at (0, 0)
        // This eliminates all parent scroll offsets, margins, and layout collapsing from the page!
        clonedDoc.body.innerHTML = '';
        clonedDoc.body.appendChild(clonedTarget);

        clonedDoc.body.style.width = '794px';
        clonedDoc.body.style.height = '1123px';
        clonedDoc.body.style.overflow = 'hidden';
        clonedDoc.body.style.position = 'relative';

        // Lock clonedTarget to EXACT A4 portrait dimensions at (0, 0)
        clonedTarget.style.position = 'absolute';
        clonedTarget.style.left = '0px';
        clonedTarget.style.top = '0px';
        clonedTarget.style.width = '794px';
        clonedTarget.style.minWidth = '794px';
        clonedTarget.style.maxWidth = '794px';
        clonedTarget.style.height = '1123px';
        clonedTarget.style.minHeight = '1123px';
        clonedTarget.style.maxHeight = '1123px';
        clonedTarget.style.margin = '0px';
        clonedTarget.style.padding = '0px';
        clonedTarget.style.transform = 'none';
        clonedTarget.style.webkitTransform = 'none';
        clonedTarget.style.backgroundColor = '#FFFFFF';
        clonedTarget.style.opacity = '1';
        clonedTarget.style.visibility = 'visible';
        clonedTarget.style.boxSizing = 'border-box';
        clonedTarget.style.overflow = 'hidden';
        clonedTarget.style.zIndex = '1';

        // Secondary safety: scan cloned elements and replace any remaining oklch colors or dark classes
        try {
          const allNodes = clonedTarget.querySelectorAll('*');
          allNodes.forEach((node) => {
            const el = node as HTMLElement;
            el.classList?.remove('dark');
            if (el.style) {
              if (el.style.color && el.style.color.includes('oklch')) {
                el.style.color = safeConvertColor(el.style.color);
              }
              if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
                el.style.backgroundColor = safeConvertColor(el.style.backgroundColor);
              }
              if (el.style.borderColor && el.style.borderColor.includes('oklch')) {
                el.style.borderColor = safeConvertColor(el.style.borderColor);
              }
            }
          });
        } catch (colorScanErr) {
          console.warn('[Certificate PDF] Color sanitization note:', colorScanErr);
        }

        // Ensure all images in cloned element have anonymous CORS
        const imgs = clonedTarget.querySelectorAll('img');
        imgs.forEach((img) => {
          img.setAttribute('crossorigin', 'anonymous');
          img.crossOrigin = 'anonymous';
        });
      }
    }
  });

  return canvas;
}

/**
 * Generate print-ready single A4 portrait PDF from certificate DOM element
 */
export async function generateCertificatePDFBlob(
  element: HTMLElement
): Promise<Blob> {
  const canvas = await renderCertificateCanvas(element);

  // Export image data with error fallback
  let imgData: string;
  try {
    imgData = canvas.toDataURL('image/png');
  } catch (exportErr) {
    console.warn('[Certificate PDF] PNG export failed, falling back to JPEG:', exportErr);
    imgData = canvas.toDataURL('image/jpeg', 0.95);
  }

  if (!imgData || imgData === 'data:,' || imgData.length < 100) {
    throw new Error('Canvas rendering generated an empty document image.');
  }

  // Formulate standard A4 PDF (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

  return pdf.output('blob');
}

/**
 * Download generated PDF with standard name and mobile browser compatibility
 */
export function downloadCertificateBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Extend revoke timeout to 30 seconds so mobile downloads can complete without interruption
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }, 30000);
}

/**
 * Print the certificate cleanly across Mobile and Desktop with exact preview fidelity
 */
export async function printCertificateElement(element: HTMLElement) {
  const isMobile =
    typeof window !== 'undefined' &&
    (/Android|iPhone|iPad|iPod|Mobile|Silk|SamsungBrowser/i.test(navigator.userAgent) || window.innerWidth < 768);

  const canvas = await renderCertificateCanvas(element);
  let imgData: string;
  try {
    imgData = canvas.toDataURL('image/png');
  } catch {
    imgData = canvas.toDataURL('image/jpeg', 0.95);
  }

  // 1. On Mobile: Also create PDF blob for immediate download or viewing
  if (isMobile) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    const blob = pdf.output('blob');
    downloadCertificateBlob(blob, 'DS-Tech-Certificate-of-Employment.pdf');
    return;
  }

  // 2. On Desktop: Use an HTML iframe with 100% exact vector/canvas raster
  // This bypasses PDF plugin cross-origin sandbox restrictions and triggers the browser's native print preview dialog immediately
  try {
    const existingFrame = document.getElementById('ds-cert-print-iframe');
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'ds-cert-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    iframe.style.opacity = '0.001';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      throw new Error('Unable to create print document context');
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DS Tech - Certificate of Employment</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                height: 297mm !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              img {
                width: 210mm !important;
                height: 297mm !important;
                display: block !important;
                margin: 0 !important;
                object-fit: contain !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
              }
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background-color: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            img {
              width: 210mm;
              height: 297mm;
              display: block;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img id="ds-print-img" src="${imgData}" alt="Certificate of Employment" />
        </body>
      </html>
    `);
    doc.close();

    const printImg = doc.getElementById('ds-print-img') as HTMLImageElement;
    const executePrint = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (printErr) {
          console.warn('[Print Error] iframe print fallback:', printErr);
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
          pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
          downloadCertificateBlob(pdf.output('blob'), 'DS-Tech-Certificate-of-Employment.pdf');
        } finally {
          setTimeout(() => {
            try { iframe.remove(); } catch {}
          }, 60000);
        }
      }, 250);
    };

    if (printImg && printImg.complete) {
      executePrint();
    } else if (printImg) {
      printImg.onload = executePrint;
    } else {
      executePrint();
    }
  } catch (err) {
    console.warn('[Certificate Print] Desktop print fallback to PDF download:', err);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    downloadCertificateBlob(pdf.output('blob'), 'DS-Tech-Certificate-of-Employment.pdf');
  }
}

// In-memory cache for compiled certificate PDF blobs to enable instantaneous (0ms) Web Share without losing user activation
const certificateBlobCache = new Map<string, { blob: Blob; file: File; timestamp: number }>();

export function getCachedCertificatePDF(certId: string): { blob: Blob; file: File } | null {
  if (!certId) return null;
  const item = certificateBlobCache.get(certId);
  if (!item) return null;
  // Valid for 10 minutes
  if (Date.now() - item.timestamp > 10 * 60 * 1000) {
    certificateBlobCache.delete(certId);
    return null;
  }
  return { blob: item.blob, file: item.file };
}

export function setCachedCertificatePDF(certId: string, blob: Blob, file: File): void {
  if (!certId) return;
  certificateBlobCache.set(certId, { blob, file, timestamp: Date.now() });
}

export function clearCachedCertificatePDF(certId: string): void {
  if (!certId) return;
  certificateBlobCache.delete(certId);
}

export function clearAllCertificateBlobCache(): void {
  certificateBlobCache.clear();
}

export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
  if (typeof navigator.canShare !== 'function') return true;
  try {
    const testFile = new File(['%PDF-1.4 test'], 'test.pdf', { type: 'application/pdf' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

export interface ShareCertificateResult {
  shared: boolean;
  method: 'native' | 'fallback' | 'cancelled';
  error?: any;
}

/**
 * Native mobile and desktop Web Share for the exact PDF file
 */
export async function shareCertificatePDF(
  blob: Blob,
  fileName: string,
  certificate: Partial<EmploymentCertificate>
): Promise<ShareCertificateResult> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const file = new File([blob], fileName, {
        type: 'application/pdf',
        lastModified: Date.now(),
      });

      // Cache for subsequent instant re-shares
      if (certificate.id) {
        setCachedCertificatePDF(certificate.id, blob, file);
      }

      // Check file sharing support
      const filesSupported = typeof navigator.canShare === 'function' ? navigator.canShare({ files: [file] }) : true;

      if (filesSupported) {
        // CRITICAL: Pass ONLY `files: [file]`!
        // DO NOT pass `title`, `text`, or `url`!
        // When `title`, `text`, or `url` are passed, WhatsApp / WhatsApp Business on Android
        // discards the PDF file and sends raw text/url into the chat!
        // Passing ONLY `files: [file]` forces Android and iOS to share the actual .pdf document!
        await navigator.share({
          files: [file],
        });
        return { shared: true, method: 'native' };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { shared: false, method: 'cancelled' };
      }
      console.warn('[Certificate Share] Native file share error:', err);
    }
  }

  // Fallback: If device cannot share files natively, download the exact PDF file to device storage
  downloadCertificateBlob(blob, fileName);
  return { shared: true, method: 'fallback' };
}
