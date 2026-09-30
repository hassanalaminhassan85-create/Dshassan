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
  // Wait for web fonts if any
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  await new Promise(r => setTimeout(r, 120));

  const scale = Math.max(2, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2, 3));

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#FFFFFF',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    windowWidth: 850,
    onclone: (clonedDoc) => {
      // Ensure dark mode classes are removed
      clonedDoc.documentElement.classList.remove('dark');
      clonedDoc.body.classList.remove('dark');
      clonedDoc.documentElement.style.backgroundColor = '#FFFFFF';
      clonedDoc.body.style.backgroundColor = '#FFFFFF';

      const clonedTarget = clonedDoc.getElementById(element.id);
      if (clonedTarget) {
        clonedTarget.style.width = '794px';
        clonedTarget.style.height = '1123px';
        clonedTarget.style.minHeight = '1123px';
        clonedTarget.style.maxHeight = '1123px';
        clonedTarget.style.margin = '0';
        clonedTarget.style.padding = '0';
        clonedTarget.style.transform = 'none';
        clonedTarget.style.backgroundColor = '#FFFFFF';
      }
    }
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Exactly fit A4 210mm x 297mm
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

  return pdf.output('blob');
}

/**
 * Download generated PDF with standard name
 */
export function downloadCertificateBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
