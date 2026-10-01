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
 * Generate print-ready single A4 portrait PDF from certificate DOM element
 */
export async function generateCertificatePDFBlob(
  element: HTMLElement
): Promise<Blob> {
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
      clonedDoc.body.style.width = '1024px';
      clonedDoc.body.style.minHeight = '1400px';
      clonedDoc.body.style.overflow = 'visible';

      const clonedTarget =
        (element.id ? clonedDoc.getElementById(element.id) : null) ||
        clonedDoc.getElementById('ds-certificate-clean-export-doc') ||
        clonedDoc.getElementById('ds-modal-certificate-doc') ||
        clonedDoc.getElementById('ds-certificate-of-employment-document');

      if (clonedTarget) {
        // Reset all parent containers in clonedDoc up to body so mobile transforms, scales, or overflow do not clip
        let curr = clonedTarget.parentElement;
        while (curr && curr !== clonedDoc.body) {
          curr.style.transform = 'none';
          curr.style.webkitTransform = 'none';
          curr.style.width = 'auto';
          curr.style.maxWidth = 'none';
          curr.style.minWidth = '0';
          curr.style.height = 'auto';
          curr.style.maxHeight = 'none';
          curr.style.overflow = 'visible';
          curr.style.margin = '0';
          curr.style.padding = '0';
          curr.style.position = 'static';
          curr.style.opacity = '1';
          curr = curr.parentElement;
        }

        // Lock clonedTarget to EXACT A4 portrait dimensions
        clonedTarget.style.position = 'relative';
        clonedTarget.style.left = '0';
        clonedTarget.style.top = '0';
        clonedTarget.style.width = '794px';
        clonedTarget.style.minWidth = '794px';
        clonedTarget.style.maxWidth = '794px';
        clonedTarget.style.height = '1123px';
        clonedTarget.style.minHeight = '1123px';
        clonedTarget.style.maxHeight = '1123px';
        clonedTarget.style.margin = '0';
        clonedTarget.style.transform = 'none';
        clonedTarget.style.webkitTransform = 'none';
        clonedTarget.style.backgroundColor = '#FFFFFF';
        clonedTarget.style.opacity = '1';
        clonedTarget.style.visibility = 'visible';
        clonedTarget.style.boxSizing = 'border-box';
        clonedTarget.style.overflow = 'hidden';

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

  // 4. Export image data with error fallback
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

  // 5. Formulate standard A4 PDF (210mm x 297mm)
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
 * Print the certificate cleanly across Mobile and Desktop without Print Spooler crashes
 */
export async function printCertificateElement(element: HTMLElement) {
  const isMobile =
    typeof window !== 'undefined' &&
    (/Android|iPhone|iPad|iPod|Mobile|Silk|SamsungBrowser/i.test(navigator.userAgent) || window.innerWidth < 768);

  // 1. Generate clean single-page PDF Blob first
  const blob = await generateCertificatePDFBlob(element);
  const blobUrl = URL.createObjectURL(blob);

  // 2. On Mobile (Android / Samsung Browser / iOS):
  // Opening the generated PDF blob directly activates the native Android PDF viewer / Samsung Print Spooler with zero crash!
  if (isMobile) {
    const win = window.open(blobUrl, '_blank');
    if (!win) {
      // Fallback if popup blocked: trigger direct download which opens in Samsung Print Spooler / PDF viewer
      downloadCertificateBlob(blob, 'DS-Tech-Certificate-of-Employment.pdf');
    }
    return;
  }

  // 3. On Desktop: Use hidden iframe for seamless instant printing
  try {
    const existingFrame = document.getElementById('ds-cert-print-iframe');
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'ds-cert-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = blobUrl;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.open(blobUrl, '_blank');
        }
      }, 400);
    };
  } catch (err) {
    console.warn('[Certificate Print] Iframe print fallback:', err);
    window.open(blobUrl, '_blank');
  }
}

/**
 * Native mobile and desktop Web Share
 */
export async function shareCertificatePDF(
  blob: Blob,
  fileName: string,
  certificate: Partial<EmploymentCertificate>
): Promise<boolean> {
  const shareTitle = `DS Tech Certificate of Employment - ${certificate.employeeName || 'Staff'}`;
  const shareText = `Official Certificate of Employment issued to ${certificate.employeeName || 'Employee'} by DS Tech and Digital Marketing Agency Limited. Verify at: ${certificate.qrVerificationUrl || ''}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([blob], fileName, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareText,
        });
        return true;
      } else {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: certificate.qrVerificationUrl,
        });
        return true;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Navigator share error:', err);
      }
    }
  }

  // Fallback: Copy link or WhatsApp share
  if (certificate.qrVerificationUrl) {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareText}\n${certificate.qrVerificationUrl}`)}`;
    window.open(waUrl, '_blank');
    return true;
  }

  return false;
}
