import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, ExternalLink, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  RotateCw, ChevronLeft, ChevronRight, FileText, AlertCircle, Loader2,
  FileCheck, ShieldCheck, Eye, RefreshCw
} from 'lucide-react';
import { ProposalRecord } from '../../types';

interface ProposalDocumentReaderProps {
  proposal: ProposalRecord;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export const ProposalDocumentReader: React.FC<ProposalDocumentReaderProps> = ({
  proposal,
  isOpen,
  onClose,
  isAdmin = false
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1.1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Document URL
  const documentUrl = `/api/proposals/file?id=${encodeURIComponent(proposal.id)}${isAdmin ? '&admin=true' : ''}`;
  const downloadUrl = `/api/proposals/file?id=${encodeURIComponent(proposal.id)}&download=true${isAdmin ? '&admin=true' : ''}`;
  const isPdf = proposal.mime_type === 'application/pdf' || proposal.original_filename.toLowerCase().endsWith('.pdf');

  // Load PDF.js dynamically
  useEffect(() => {
    if (!isOpen || !isPdf) return;

    let isMounted = true;
    setIsLoading(true);
    setRenderError(null);

    const loadPdfJs = async () => {
      try {
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const loadingTask = window.pdfjsLib.getDocument({
          url: documentUrl,
          withCredentials: false
        });

        const pdf = await loadingTask.promise;
        if (!isMounted) return;

        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        console.warn('PDF.js rendering notice, switching to responsive embedded viewer fallback:', err);
        if (isMounted) {
          setUseIframeFallback(true);
          setIsLoading(false);
        }
      }
    };

    loadPdfJs();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [isOpen, documentUrl, isPdf]);

  // Render current page to canvas
  useEffect(() => {
    if (!isOpen || !isPdf || !pdfDocRef.current || useIframeFallback) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Calculate responsive viewport scale
        const containerWidth = containerRef.current?.clientWidth || 800;
        const unscaledViewport = page.getViewport({ scale: 1, rotation });
        const fitScale = (containerWidth - 48) / unscaledViewport.width;
        const actualScale = Math.min(Math.max(fitScale * zoomLevel, 0.4), 3.0);

        const viewport = page.getViewport({ scale: actualScale, rotation });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Cancel previous render if any
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {}
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
      } catch (e: any) {
        if (e?.name !== 'RenderingCancelledException') {
          console.warn('Page render fallback:', e);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, zoomLevel, rotation, isOpen, isPdf, useIframeFallback]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        ref={containerRef}
        className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-xl text-white select-none overflow-hidden"
      >
        {/* Top Control Header */}
        <header className="h-14 sm:h-16 px-3 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-orange-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md lg:max-w-xl">
                {proposal.title}
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="uppercase font-mono text-orange-400 font-semibold">{isPdf ? 'PDF' : 'DOCX'}</span>
                <span>•</span>
                <span>{(proposal.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                {proposal.category && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">{proposal.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reader Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isPdf && !useIframeFallback && (
              <>
                {/* Page Navigation */}
                <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-mono">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 hover:text-orange-400 disabled:opacity-30 disabled:hover:text-inherit cursor-pointer transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1 text-[11px] font-bold">
                    {currentPage} <span className="text-slate-500">/</span> {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1 hover:text-orange-400 disabled:opacity-30 disabled:hover:text-inherit cursor-pointer transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs">
                  <button
                    onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.15))}
                    className="p-1 hover:text-orange-400 cursor-pointer transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono px-1 font-bold text-slate-300">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.15))}
                    className="p-1 hover:text-orange-400 cursor-pointer transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* Open Original in New Window */}
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Open document in original viewer tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Original</span>
            </a>

            {/* Direct Download Button */}
            <a
              href={downloadUrl}
              download={proposal.original_filename}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
              title="Download original file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors cursor-pointer"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-auto p-2 sm:p-6 flex items-center justify-center relative bg-slate-950">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 p-8">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Loading document...</p>
            </div>
          )}

          {!isLoading && isPdf && !useIframeFallback && (
            <div className="max-w-full flex justify-center shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-white">
              <canvas ref={canvasRef} className="max-w-full block" />
            </div>
          )}

          {!isLoading && isPdf && useIframeFallback && (
            <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
              <iframe
                src={`${documentUrl}#toolbar=1&navpanes=1`}
                title={proposal.title}
                className="w-full h-full border-none"
              />
            </div>
          )}

          {!isLoading && !isPdf && (
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{proposal.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This document is stored as a Microsoft Word ({proposal.original_filename.split('.').pop()?.toUpperCase()}) file.
                </p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl text-left text-xs space-y-1 text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">File Name:</span>
                  <span className="truncate ml-2 max-w-[200px]">{proposal.original_filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Size:</span>
                  <span>{(proposal.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400 capitalize">{proposal.status}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href={downloadUrl}
                  download={proposal.original_filename}
                  className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </a>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Raw</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
