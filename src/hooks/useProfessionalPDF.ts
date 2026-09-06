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
  /** Security watermark text injected across the center of every page (default: "OFFICIAL - DS TECH") */
  watermarkText?: string;
  /** Enable security watermark injection across pages (default: true) */
  enableWatermark?: boolean;
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

export function drawSecurityWatermark(
  pdf: jsPDF,
  pageWidthMm: number = 210,
  pageHeightMm: number = 297,
  watermarkText: string = 'OFFICIAL - DS TECH'
) {
  try {
    pdf.saveGraphicsState();

    // Set delicate transparent opacity for high-security watermark
    const gState = new (pdf as any).GState({ opacity: 0.12 });
    pdf.setGState(gState);

    // Center coordinates
    const centerX = pageWidthMm / 2;
    const centerY = pageHeightMm / 2;

    // Draw Primary Diagonally Rotated Watermark Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    pdf.setTextColor(0, 14, 50); // Official DS TECH Navy Blue (#000E32)

    pdf.text(watermarkText, centerX, centerY - 2, {
      align: 'center',
      angle: 42,
      baseline: 'middle',
    });

    // Draw Secondary Security Certification Subtitle
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(234, 88, 12); // DS TECH Orange Accent (#EA580C)

    pdf.text('AUTHENTIC DOCUMENT • CAC RC 9550925', centerX, centerY + 10, {
      align: 'center',
      angle: 42,
      baseline: 'middle',
    });

    pdf.restoreGraphicsState();
  } catch (err) {
    console.warn('Watermark rendering fallback applied:', err);
  }
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
      watermarkText = 'OFFICIAL - DS TECH',
      enableWatermark = true,
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
        allowTaint: false,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: targetWidthPx + 50,
        onclone: (clonedDoc) => {
          const targetInClone =
            (elementId ? clonedDoc.getElementById(elementId) : null) ||
            clonedDoc.getElementById('dsta-render-slip-target') ||
            clonedDoc.getElementById('dsta-course-registration-slip') ||
            clonedDoc.getElementById('careers-pdf-document');

          if (targetInClone) {
            // Calculate standard A4 height ratio for targetWidthPx
            const a4Ratio = 297 / 210; // ~1.41428
            const calculatedA4HeightPx = Math.round(targetWidthPx * a4Ratio); // e.g., 800 * 1.414 = 1131px

            targetInClone.style.width = `${targetWidthPx}px`;
            targetInClone.style.maxWidth = `${targetWidthPx}px`;
            targetInClone.style.minHeight = `${calculatedA4HeightPx}px`;
            targetInClone.style.display = 'flex';
            targetInClone.style.flexDirection = 'column';
            targetInClone.style.justifyContent = 'space-between';
            targetInClone.style.visibility = 'visible';
            targetInClone.style.backgroundColor = '#FFFFFF';
            targetInClone.style.margin = '0 auto';
            targetInClone.style.boxSizing = 'border-box';
            targetInClone.style.overflow = 'visible';

            // Unwrap parent element constraints in clonedDoc up to body so mobile viewport bounds don't crop PDF canvas
            let parent = targetInClone.parentElement;
            while (parent && parent !== clonedDoc.body) {
              parent.style.width = 'auto';
              parent.style.maxWidth = 'none';
              parent.style.minWidth = '0';
              parent.style.overflow = 'visible';
              parent.style.margin = '0';
              parent.style.padding = '0';
              parent = parent.parentElement;
            }
            clonedDoc.body.style.width = `${targetWidthPx + 50}px`;
            clonedDoc.body.style.overflow = 'visible';

            // Ensure all sections/cards marked for page-break-avoid are enforced
            const breakAvoidEls = targetInClone.querySelectorAll(
              '.pdf-page-break-avoid, [data-pdf-section], table, tr, .card, .pdf-footer, [data-pdf-footer]'
            );
            breakAvoidEls.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.breakInside = 'avoid';
              htmlEl.style.pageBreakInside = 'avoid';
            });

            // Ensure footer elements are anchored firmly to the bottom of the A4 page container
            const footerEls = targetInClone.querySelectorAll('.pdf-footer, [data-pdf-footer]');
            footerEls.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.marginTop = 'auto';
              htmlEl.style.breakInside = 'avoid';
              htmlEl.style.pageBreakInside = 'avoid';
            });
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

      if (pdfImgHeight <= printableHeight + 5) {
        // Single Page A4 PDF: Expand image to span printable height cleanly
        const imgData = canvas.toDataURL('image/png');
        const renderHeight = Math.max(pdfImgHeight, printableHeight);
        pdf.addImage(imgData, 'PNG', marginMm, marginMm, pdfImgWidth, renderHeight, undefined, 'FAST');

        // Security Watermark Injection across Page 1 Center
        if (enableWatermark) {
          drawSecurityWatermark(pdf, a4WidthMm, a4HeightMm, watermarkText);
        }
      } else {
        // Multi-Page A4 Dynamic Page-Break Pagination Engine
        const nominalSliceHeightPx = (printableHeight * canvasWidth) / printableWidth;

        // Intelligent Page Break Slicing Logic
        let sourceY = 0;
        let pageIndex = 0;

        while (sourceY < canvasHeight) {
          if (pageIndex > 0) {
            pdf.addPage('a4', 'portrait');
          }

          let currentSliceHeightPx = Math.min(nominalSliceHeightPx, canvasHeight - sourceY);

          // If remaining height is slightly more than a single page, fit gracefully
          if (
            currentSliceHeightPx < nominalSliceHeightPx &&
            currentSliceHeightPx > nominalSliceHeightPx * 0.8
          ) {
            currentSliceHeightPx = canvasHeight - sourceY;
          }

          const pageCanvas = document.createElement('canvas');
          const ctx = pageCanvas.getContext('2d');

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

          // Render slice scaled to printable width & height
          const renderSlicePdfHeight =
            currentSliceHeightPx === nominalSliceHeightPx ? printableHeight : slicePdfHeight;

          pdf.addImage(
            sliceDataUrl,
            'PNG',
            marginMm,
            marginMm,
            pdfImgWidth,
            renderSlicePdfHeight,
            undefined,
            'FAST'
          );

          // Security Watermark Injection across center of every A4 page
          if (enableWatermark) {
            drawSecurityWatermark(pdf, a4WidthMm, a4HeightMm, watermarkText);
          }

          sourceY += currentSliceHeightPx;
          pageIndex++;
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
