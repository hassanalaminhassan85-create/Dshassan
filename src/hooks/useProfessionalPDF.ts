import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface GeneratePDFOptions {
  /** ID of the HTML element to render into PDF */
  elementId?: string;
  /** Direct HTML element reference to render into PDF */
  element?: HTMLElement | null;
  /** Specific filename to save as (e.g. "Registration-Doc.pdf") */
  filename?: string;
  /** Applicant or entity name used to construct standard filename */
  applicantName?: string;
  /** Document title descriptor for default filename construct */
  documentTitle?: string;
  /** Print-safe page margin in millimeters (default: 10mm) */
  marginMm?: number;
  /** Fixed width in pixels forced during html2canvas render (default: 800) */
  targetWidthPx?: number;
  /** Optional callback fired upon successful PDF generation */
  onSuccess?: () => void;
  /** Optional callback fired if generation fails */
  onError?: (err: unknown) => void;
}

export function sanitizeFilename(name: string): string {
  return (name || 'Document')
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function useProfessionalPDF() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generatePDF = useCallback(async (options: GeneratePDFOptions = {}): Promise<boolean> => {
    const {
      elementId,
      element,
      filename,
      applicantName,
      documentTitle = 'DS-TECH-Academy-Course-Registration',
      marginMm = 10,
      targetWidthPx = 800,
      onSuccess,
      onError,
    } = options;

    setIsGenerating(true);
    setStatusText('Preparing document rendering engine...');
    setError(null);

    try {
      // 1. Ensure custom web fonts and DOM layouts are fully settled
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 2. Resolve target element
      let targetEl: HTMLElement | null = null;
      if (element) {
        targetEl = element;
      } else if (elementId) {
        targetEl = document.getElementById(elementId);
      } else {
        // Fallback IDs commonly used in DS TECH Academy
        targetEl =
          document.getElementById('dsta-render-slip-target') ||
          document.getElementById('dsta-course-registration-slip');
      }

      if (!targetEl) {
        throw new Error('Target document element could not be found in DOM.');
      }

      setStatusText('Capturing high-resolution document canvas...');

      // 3. Render pixel-perfect canvas using html2canvas
      const scaleFactor = Math.max(
        2,
        Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2, 3)
      );

      const canvas = await html2canvas(targetEl, {
        scale: scaleFactor,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: targetWidthPx + 50,
        onclone: (clonedDoc) => {
          const targetInClone =
            (elementId ? clonedDoc.getElementById(elementId) : null) ||
            clonedDoc.getElementById('dsta-render-slip-target') ||
            clonedDoc.getElementById('dsta-course-registration-slip');

          if (targetInClone) {
            targetInClone.style.width = `${targetWidthPx}px`;
            targetInClone.style.maxWidth = `${targetWidthPx}px`;
            targetInClone.style.display = 'block';
            targetInClone.style.visibility = 'visible';
            targetInClone.style.backgroundColor = '#FFFFFF';
            targetInClone.style.margin = '0 auto';
          }
        },
      });

      setStatusText('Formulating official A4 PDF pages...');

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // 4. Initialize jsPDF with standard A4 specs (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const a4WidthMm = 210;
      const a4HeightMm = 297;
      const printableWidth = a4WidthMm - marginMm * 2; // e.g. 190mm
      const printableHeight = a4HeightMm - marginMm * 2; // e.g. 277mm

      const pdfImgWidth = printableWidth;
      const pdfImgHeight = (canvasHeight * pdfImgWidth) / canvasWidth;

      if (pdfImgHeight <= printableHeight) {
        // Single Page A4 PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', marginMm, marginMm, pdfImgWidth, pdfImgHeight, undefined, 'FAST');
      } else {
        // Multi-Page A4 Pagination Engine
        const sliceHeightPx = (printableHeight * canvasWidth) / printableWidth;
        const totalPages = Math.ceil(canvasHeight / sliceHeightPx);

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage('a4', 'portrait');
          }

          const pageCanvas = document.createElement('canvas');
          const ctx = pageCanvas.getContext('2d');
          const sourceY = page * sliceHeightPx;
          const currentSliceHeightPx = Math.min(sliceHeightPx, canvasHeight - sourceY);

          pageCanvas.width = canvasWidth;
          pageCanvas.height = currentSliceHeightPx;

          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              sourceY,
              canvasWidth,
              currentSliceHeightPx,
              0,
              0,
              canvasWidth,
              currentSliceHeightPx
            );
          }

          const sliceDataUrl = pageCanvas.toDataURL('image/png');
          const slicePdfHeight = (currentSliceHeightPx * pdfImgWidth) / canvasWidth;
          pdf.addImage(sliceDataUrl, 'PNG', marginMm, marginMm, pdfImgWidth, slicePdfHeight, undefined, 'FAST');
        }
      }

      // 5. Construct sanitized filename
      let finalFilename = filename;
      if (!finalFilename) {
        const cleanName = sanitizeFilename(applicantName || 'Student');
        const cleanTitle = sanitizeFilename(documentTitle);
        finalFilename = `${cleanTitle}-${cleanName}.pdf`;
      }

      if (!finalFilename.endsWith('.pdf')) {
        finalFilename += '.pdf';
      }

      setStatusText('Saving PDF document...');
      pdf.save(finalFilename);

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (err) {
      console.error('Error generating professional PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF document.';
      setError(errorMessage);

      if (onError) {
        onError(err);
      }

      return false;
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  }, []);

  return {
    generatePDF,
    isGenerating,
    statusText,
    error,
  };
}
