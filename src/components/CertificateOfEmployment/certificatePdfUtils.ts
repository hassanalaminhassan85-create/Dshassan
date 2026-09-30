import html2canvas from 'html2canvas';
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

  // 2. Safe scale factor: mobile browsers crash on 3x canvas due to memory caps
  const isMobile =
    typeof window !== 'undefined' &&
    (/Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent) || window.innerWidth < 768);
  const scale = isMobile ? 1.6 : 2;

  // 3. Render pixel-perfect canvas
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    imageTimeout: 8000,
    onclone: (clonedDoc) => {
      // Ensure dark mode classes are removed
      clonedDoc.documentElement.classList.remove('dark');
      clonedDoc.body.classList.remove('dark');
      clonedDoc.documentElement.style.backgroundColor = '#FFFFFF';
      clonedDoc.body.style.backgroundColor = '#FFFFFF';

      const clonedTarget = clonedDoc.getElementById(element.id);
      if (clonedTarget) {
        // Reset all parent containers in clonedDoc up to body so mobile transforms & overflow-hidden do not clip or corrupt canvas
        let curr = clonedTarget.parentElement;
        while (curr && curr !== clonedDoc.body) {
          curr.style.transform = 'none';
          curr.style.width = 'auto';
          curr.style.maxWidth = 'none';
          curr.style.minWidth = '0';
          curr.style.height = 'auto';
          curr.style.maxHeight = 'none';
          curr.style.overflow = 'visible';
          curr.style.margin = '0';
          curr.style.padding = '0';
          curr.style.position = 'static';
          curr = curr.parentElement;
        }

        clonedDoc.body.style.width = '850px';
        clonedDoc.body.style.minHeight = '1200px';
        clonedDoc.body.style.overflow = 'visible';
        clonedDoc.body.style.margin = '0';
        clonedDoc.body.style.padding = '0';

        clonedTarget.style.width = '794px';
        clonedTarget.style.minWidth = '794px';
        clonedTarget.style.maxWidth = '794px';
        clonedTarget.style.height = '1123px';
        clonedTarget.style.minHeight = '1123px';
        clonedTarget.style.maxHeight = '1123px';
        clonedTarget.style.margin = '0';
        clonedTarget.style.transform = 'none';
        clonedTarget.style.backgroundColor = '#FFFFFF';

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
    imgData = canvas.toDataURL('image/jpeg', 0.95);
  } catch (exportErr) {
    console.warn('[Certificate PDF] JPEG export failed, falling back to PNG:', exportErr);
    imgData = canvas.toDataURL('image/png');
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

  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

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

  // Extend revoke timeout to 20 seconds so mobile browsers have ample time to complete the download stream
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }, 20000);
}

/**
 * Print the certificate using standard print window / iframe
 */
export async function printCertificateElement(element: HTMLElement) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const certHtml = element.outerHTML;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>DS Tech - Certificate of Employment</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #FFFFFF;
            display: flex;
            justify-content: center;
            align-items: center;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #${element.id} {
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${certHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
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
