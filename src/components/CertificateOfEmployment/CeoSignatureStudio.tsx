import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenTool, Type, Upload, ShieldCheck, RotateCcw, Trash2,
  Check, CheckCircle2, Sparkles, Feather, UserCheck, RefreshCw
} from 'lucide-react';
import { InAppCalendarDatePicker } from './InAppCalendarDatePicker';

export interface CeoSignatureResult {
  signatureDataUrl: string;
  signatureType: 'draw' | 'type' | 'upload' | 'preset';
  signatoryName: string;
  signatoryPosition: string;
  signedAt: string;
  signatureHash: string;
}

interface CeoSignatureStudioProps {
  currentSignatureUrl?: string;
  currentSignatureType?: 'draw' | 'type' | 'upload' | 'preset';
  initialSignatoryName?: string;
  initialSignatoryPosition?: string;
  initialSignatureDate?: string;
  onSignatureApply: (result: CeoSignatureResult) => void;
  onClearSignature?: () => void;
  isCompact?: boolean;
}

// Preset Official Executive Vector Signature SVG Data URL (Authentic reproduction of DS Tech CEO signature)
export const OFFICIAL_CEO_PRESET_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="90" viewBox="0 0 300 90" fill="none">
    <path d="M 22 55 C 16 42, 18 20, 28 14 C 38 8, 52 16, 44 34 C 36 50, 26 56, 20 50 C 14 44, 18 28, 34 20 C 50 12, 66 20, 68 34 C 70 46, 62 55, 52 55" stroke="#002D62" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 52 52 C 58 44, 64 32, 72 35 C 80 38, 76 50, 84 46 C 92 42, 96 34, 104 32 C 112 30, 110 44, 118 40 C 126 36, 128 24, 134 22 C 140 20, 136 44, 144 40 C 152 36, 160 32, 172 28" stroke="#002D62" stroke-width="3.0" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="134" cy="13" r="2.8" fill="#002D62" />
    <path d="M 18 60 C 52 64, 112 62, 190 50 C 204 48, 216 44, 220 42" stroke="#002D62" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M 210 44 L 220 42 L 214 52" stroke="#002D62" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
)}`;

const INK_COLORS = [
  { id: 'navy', label: 'Executive Navy', value: '#002D62' },
  { id: 'black', label: 'Midnight Black', value: '#111827' },
  { id: 'royal', label: 'Royal Blue', value: '#0A2558' },
  { id: 'classic', label: 'Corporate Cobalt', value: '#0D47A1' },
];

const STROKE_WIDTHS = [
  { id: 'fine', label: 'Fine (1.8px)', value: 1.8 },
  { id: 'medium', label: 'Classic (2.8px)', value: 2.8 },
  { id: 'bold', label: 'Executive (4.2px)', value: 4.2 },
];

const CURSIVE_FONTS = [
  { id: 'great-vibes', name: 'Great Vibes', family: "'Great Vibes', cursive", sample: 'Signature' },
  { id: 'dancing-script', name: 'Dancing Script', family: "'Dancing Script', cursive", sample: 'Signature' },
  { id: 'alex-brush', name: 'Alex Brush', family: "'Alex Brush', cursive", sample: 'Signature' },
  { id: 'allura', name: 'Allura Script', family: "'Allura', cursive", sample: 'Signature' },
  { id: 'playball', name: 'Playball Prestige', family: "'Playball', cursive", sample: 'Signature' },
];

export const CeoSignatureStudio: React.FC<CeoSignatureStudioProps> = ({
  currentSignatureUrl,
  currentSignatureType = 'preset',
  initialSignatoryName = '',
  initialSignatoryPosition = 'Company Director/CEO',
  initialSignatureDate,
  onSignatureApply,
  onClearSignature,
  isCompact = false,
}) => {
  // Active Tool Mode
  const [activeMode, setActiveMode] = useState<'draw' | 'type' | 'upload' | 'preset'>(
    currentSignatureType || 'preset'
  );

  // Signatory Metadata
  const [signatoryName, setSignatoryName] = useState<string>(initialSignatoryName || '');
  const [signatoryPosition, setSignatoryPosition] = useState<string>(initialSignatoryPosition || 'Company Director/CEO');
  const [signatureDate, setSignatureDate] = useState<string>(() => {
    return initialSignatureDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  });

  // Customization
  const [selectedColor, setSelectedColor] = useState<string>('#002D62');
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState<number>(2.8);

  // Mode 1: DRAW State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([]);
  const [hasDrawnContent, setHasDrawnContent] = useState<boolean>(false);

  // Mode 2: TYPE State
  const [typedName, setTypedName] = useState<string>(initialSignatoryName || '');
  const [selectedFont, setSelectedFont] = useState<string>(CURSIVE_FONTS[0].family);

  // Mode 3: UPLOAD State
  const [uploadedRawImage, setUploadedRawImage] = useState<string | null>(null);
  const [uploadCleanedDataUrl, setUploadCleanedDataUrl] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState<boolean>(true);
  const [contrastThreshold, setContrastThreshold] = useState<number>(215);

  // Feedback State
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Central Sync Function that broadcasts signature immediately to the certificate preview
  const syncToCertificate = useCallback((
    overrideDataUrl?: string,
    overrideType?: 'draw' | 'type' | 'upload' | 'preset',
    overrideName?: string,
    overridePosition?: string,
    overrideDate?: string
  ) => {
    const typeToUse = overrideType || activeMode;
    const nameToUse = (overrideName !== undefined ? overrideName : signatoryName).trim();
    const positionToUse = (overridePosition !== undefined ? overridePosition : signatoryPosition).trim() || 'Company Director/CEO';
    const dateToUse = overrideDate !== undefined ? overrideDate : signatureDate;

    let finalDataUrl = overrideDataUrl;
    if (!finalDataUrl) {
      if (typeToUse === 'preset') {
        finalDataUrl = OFFICIAL_CEO_PRESET_SVG;
      } else if (typeToUse === 'upload') {
        finalDataUrl = uploadCleanedDataUrl || uploadedRawImage || OFFICIAL_CEO_PRESET_SVG;
      } else if (typeToUse === 'type') {
        finalDataUrl = generateTypedSignatureDataUrl(nameToUse, selectedFont, selectedColor);
      } else if (typeToUse === 'draw') {
        if (canvasRef.current && hasDrawnContent) {
          finalDataUrl = canvasRef.current.toDataURL('image/png');
        } else {
          finalDataUrl = OFFICIAL_CEO_PRESET_SVG;
        }
      }
    }

    const uniqueHash = `DST-EXEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;

    onSignatureApply({
      signatureDataUrl: finalDataUrl || OFFICIAL_CEO_PRESET_SVG,
      signatureType: typeToUse,
      signatoryName: nameToUse,
      signatoryPosition: positionToUse,
      signedAt: dateToUse,
      signatureHash: uniqueHash,
    });
  }, [activeMode, signatoryName, signatoryPosition, signatureDate, uploadCleanedDataUrl, uploadedRawImage, selectedFont, selectedColor, hasDrawnContent, onSignatureApply]);

  // Convert Typed Name to High-Res Transparent PNG with Executive Underline
  const generateTypedSignatureDataUrl = (
    textToRender: string,
    fontFamily: string,
    color: string
  ): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return OFFICIAL_CEO_PRESET_SVG;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Set font style
    const fontSize = 68;
    ctx.font = `italic ${fontSize}px ${fontFamily}`;
    ctx.fillText(textToRender || 'CEO Signature', canvas.width / 2, canvas.height / 2 - 8);

    // Dynamic executive underline flourish
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(80, canvas.height / 2 + 36);
    ctx.bezierCurveTo(220, canvas.height / 2 + 50, 360, canvas.height / 2 + 24, 490, canvas.height / 2 + 38);
    ctx.stroke();

    // Underline end tick
    ctx.beginPath();
    ctx.moveTo(475, canvas.height / 2 + 38);
    ctx.lineTo(495, canvas.height / 2 + 36);
    ctx.lineTo(488, canvas.height / 2 + 48);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  };

  // Initialize Canvas for Drawing - Only on mount / mode switch, NEVER on color change
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = selectedStrokeWidth;

    ctx.clearRect(0, 0, rect.width, rect.height);
  }, []); // Intentionally empty dependencies to prevent erasing user strokes

  useEffect(() => {
    if (activeMode === 'draw') {
      const timer = setTimeout(() => {
        initCanvas();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [activeMode, initCanvas]);

  // Update stroke style dynamically without clearing canvas
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = selectedStrokeWidth;
      }
    }
  }, [selectedColor, selectedStrokeWidth]);

  // Canvas Drawing Handlers with Touch & Device Pixel Ratio Precision
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) {
      // Prevent scrolling when drawing on touch screens
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const currentSnap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setDrawHistory((prev) => [...prev.slice(-10), currentSnap]);
    } catch {}

    const { x, y } = getCoordinates(e);

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = selectedStrokeWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawnContent(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.closePath();

      // AUTO-SYNC IMMEDIATELY: Broadcast drawn signature to Certificate Live Preview
      const dataUrl = canvas.toDataURL('image/png');
      syncToCertificate(dataUrl, 'draw');
    }
  };

  const handleUndoDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas || drawHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = drawHistory[drawHistory.length - 1];
    setDrawHistory((prev) => prev.slice(0, -1));
    ctx.putImageData(previous, 0, 0);

    const hasRemaining = drawHistory.length > 1;
    setHasDrawnContent(hasRemaining);

    const dataUrl = hasRemaining ? canvas.toDataURL('image/png') : OFFICIAL_CEO_PRESET_SVG;
    syncToCertificate(dataUrl, 'draw');
  };

  const handleClearDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setDrawHistory([]);
    setHasDrawnContent(false);

    // Reset to preset on clear
    syncToCertificate(OFFICIAL_CEO_PRESET_SVG, 'preset');
  };

  // Process Uploaded Image to Remove Background and make ink transparent
  const processUploadedImage = useCallback((dataUrl: string, removeBg: boolean, threshold: number) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      if (removeBg) {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            if (brightness > threshold) {
              data[i + 3] = 0; // Pure white / light paper becomes transparent
            } else {
              const alphaFactor = 1 - (brightness / threshold);
              data[i + 3] = Math.min(255, Math.floor(alphaFactor * 255 * 1.35));
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (err) {
          console.warn('[CeoSignatureStudio] Background filter fallback notice:', err);
        }
      }

      const cleaned = canvas.toDataURL('image/png');
      setUploadCleanedDataUrl(cleaned);
      // Auto-sync uploaded image to certificate preview
      syncToCertificate(cleaned, 'upload');
    };
    img.src = dataUrl;
  }, [syncToCertificate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUploadedRawImage(result);
        processUploadedImage(result, removeBackground, contrastThreshold);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-sync when typing, font change, or color change occurs in 'type' mode
  const handleTypedNameChange = (val: string) => {
    setTypedName(val);
    const dataUrl = generateTypedSignatureDataUrl(val, selectedFont, selectedColor);
    syncToCertificate(dataUrl, 'type', val);
  };

  const handleFontChange = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    const dataUrl = generateTypedSignatureDataUrl(typedName, fontFamily, selectedColor);
    syncToCertificate(dataUrl, 'type');
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (activeMode === 'type') {
      const dataUrl = generateTypedSignatureDataUrl(typedName, selectedFont, color);
      syncToCertificate(dataUrl, 'type');
    }
  };

  // Mode change handler
  const handleModeSwitch = (mode: 'draw' | 'type' | 'upload' | 'preset') => {
    setActiveMode(mode);
    if (mode === 'preset') {
      syncToCertificate(OFFICIAL_CEO_PRESET_SVG, 'preset');
    } else if (mode === 'type') {
      const dataUrl = generateTypedSignatureDataUrl(typedName, selectedFont, selectedColor);
      syncToCertificate(dataUrl, 'type');
    } else if (mode === 'upload' && (uploadCleanedDataUrl || uploadedRawImage)) {
      syncToCertificate(uploadCleanedDataUrl || uploadedRawImage || OFFICIAL_CEO_PRESET_SVG, 'upload');
    } else if (mode === 'draw' && hasDrawnContent && canvasRef.current) {
      syncToCertificate(canvasRef.current.toDataURL('image/png'), 'draw');
    }
  };

  // Signatory parameter changes
  const handleSignatoryNameChange = (val: string) => {
    setSignatoryName(val);
    syncToCertificate(undefined, undefined, val, undefined, undefined);
  };

  const handleSignatoryPositionChange = (val: string) => {
    setSignatoryPosition(val);
    syncToCertificate(undefined, undefined, undefined, val, undefined);
  };

  const handleSignatureDateChange = (val: string) => {
    setSignatureDate(val);
    syncToCertificate(undefined, undefined, undefined, undefined, val);
  };

  // Master Explicit Apply Button (Guarantees certificate reflects it)
  const handleMasterApply = () => {
    let finalDataUrl = '';
    if (activeMode === 'draw') {
      if (canvasRef.current && hasDrawnContent) {
        finalDataUrl = canvasRef.current.toDataURL('image/png');
      } else {
        finalDataUrl = OFFICIAL_CEO_PRESET_SVG;
      }
    } else if (activeMode === 'type') {
      finalDataUrl = generateTypedSignatureDataUrl(typedName, selectedFont, selectedColor);
    } else if (activeMode === 'upload') {
      finalDataUrl = uploadCleanedDataUrl || uploadedRawImage || OFFICIAL_CEO_PRESET_SVG;
    } else if (activeMode === 'preset') {
      finalDataUrl = OFFICIAL_CEO_PRESET_SVG;
    }

    syncToCertificate(finalDataUrl, activeMode);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 2600);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#000E32] via-[#0A2558] to-[#002D62] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 shadow-inner">
            <Feather size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                CEO Signature &amp; Executive Authorization Suite
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Reflection Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Draw with pen, type in calligraphy, upload a scan, or apply the official vector seal. Live updates reflected on certificate.
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="flex items-center gap-2">
          {currentSignatureUrl ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
              <CheckCircle2 size={13} />
              <span>Signature Embedded</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
              <UserCheck size={13} />
              <span>Official Vector Seal Active</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        
        {/* Tool Mode Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
          {[
            { id: 'draw', label: 'Draw with Pen', icon: PenTool, desc: 'Digital Touch & Mouse Pad' },
            { id: 'type', label: 'Type Calligraphy', icon: Type, desc: 'Executive Cursive Script' },
            { id: 'upload', label: 'Upload Scan', icon: Upload, desc: 'Transparent Background' },
            { id: 'preset', label: 'Official Seal Preset', icon: ShieldCheck, desc: 'Authorized DS Tech Mark' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleModeSwitch(tab.id as any)}
                className={`flex-1 min-w-[130px] p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 text-[#000E32] dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon size={14} className={isActive ? 'text-orange-500' : 'text-slate-400'} />
                  <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{tab.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Global Inks & Colors Toolbar */}
        {(activeMode === 'draw' || activeMode === 'type') && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Color Swatches */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-500 font-mono">Ink Color:</span>
              <div className="flex items-center gap-1.5">
                {INK_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleColorChange(c.value)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedColor === c.value ? 'ring-2 ring-offset-2 ring-orange-500 scale-105' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {selectedColor === c.value && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke Width (Draw Mode only) */}
            {activeMode === 'draw' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500 font-mono">Pen Nib:</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {STROKE_WIDTHS.map((sw) => (
                    <button
                      key={sw.id}
                      type="button"
                      onClick={() => setSelectedStrokeWidth(sw.value)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        selectedStrokeWidth === sw.value
                          ? 'bg-[#000E32] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {sw.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 1: DRAW CANVAS                                       */}
        {/* ========================================================= */}
        {activeMode === 'draw' && (
          <div className="space-y-3">
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 transition-colors rounded-2xl overflow-hidden bg-slate-50/60 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[190px]">
              
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[180px] touch-none cursor-crosshair block"
              />

              {!hasDrawnContent && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1.5">
                  <PenTool size={22} className="text-orange-500/70" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Sign Here Using Finger, Mouse, or Stylus Pen
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Smooth vector curves • Changes reflect immediately on certificate
                  </p>
                </div>
              )}
            </div>

            {/* Canvas Actions */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndoDraw}
                  disabled={drawHistory.length === 0}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <RotateCcw size={12} />
                  <span>Undo Stroke</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearDraw}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Clear Pad</span>
                </button>
              </div>

              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 2: TYPE CALLIGRAPHY                                  */}
        {/* ========================================================= */}
        {activeMode === 'type' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Full Name / Initial for Calligraphy Signature
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => handleTypedNameChange(e.target.value)}
                placeholder="Type name for signature..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Font Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CURSIVE_FONTS.map((f) => {
                const isSelected = selectedFont === f.family;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFontChange(f.family)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{f.name}</span>
                      {isSelected && <CheckCircle2 size={13} className="text-orange-500" />}
                    </div>
                    <div
                      className="text-2xl py-1 text-slate-900 dark:text-white truncate"
                      style={{ fontFamily: f.family, color: selectedColor }}
                    >
                      {typedName || f.sample}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 3: UPLOAD SIGNATURE SCAN                             */}
        {/* ========================================================= */}
        {activeMode === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 transition-colors rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-950 space-y-3">
              <Upload size={28} className="mx-auto text-orange-500" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  Upload Scanned Signature Image
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Supports PNG, JPG, JPEG, SVG, WebP with clean background transparency.
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="ceo-signature-file-input"
              />
              <label
                htmlFor="ceo-signature-file-input"
                className="inline-block px-4 py-2 bg-[#000E32] hover:bg-[#001750] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Choose Signature File
              </label>
            </div>

            {/* Upload Preview & Auto Background Filter Controls */}
            {uploadedRawImage && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Transparent Ink Preview
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={removeBackground}
                      onChange={(e) => setRemoveBackground(e.target.checked)}
                      className="rounded text-orange-500 focus:ring-orange-500"
                    />
                    <span>Remove Paper Background</span>
                  </label>
                </div>

                <div className="h-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2">
                  <img
                    src={uploadCleanedDataUrl || uploadedRawImage}
                    alt="Uploaded Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {removeBackground && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Ink Contrast Threshold:</span>
                      <span>{contrastThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min={150}
                      max={245}
                      value={contrastThreshold}
                      onChange={(e) => setContrastThreshold(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 4: OFFICIAL PRESET VECTOR SEAL                       */}
        {/* ========================================================= */}
        {activeMode === 'preset' && (
          <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#002D62] text-white flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#002D62] dark:text-blue-300">
                  Official DS Tech Executive Vector Signature
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Authentic vector reproduction of the Company Director &amp; CEO authorized signature.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <img
                src={OFFICIAL_CEO_PRESET_SVG}
                alt="Official Preset Signature"
                className="max-h-16 object-contain"
              />
            </div>

            <p className="text-[10px] text-slate-500 italic text-center">
              This signature is officially verified and accepted across all formal DS Tech employment certificates.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* SIGNATORY METADATA PARAMETERS (Live updates to preview)   */}
        {/* ========================================================= */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Authorized Signatory Name
              </label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => handleSignatoryNameChange(e.target.value)}
                placeholder="Enter Authorized Signatory Name"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Executive Designation
              </label>
              <input
                type="text"
                value={signatoryPosition}
                onChange={(e) => handleSignatoryPositionChange(e.target.value)}
                placeholder="Company Director/CEO"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <InAppCalendarDatePicker
                label="Authorization Date"
                value={signatureDate}
                onChange={(formatted) => handleSignatureDateChange(formatted)}
              />
            </div>
          </div>
        </div>

        {/* Action Confirmation Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {onClearSignature && (
            <button
              type="button"
              onClick={onClearSignature}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reset to Preset Seal
            </button>
          )}

          <button
            type="button"
            onClick={handleMasterApply}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
              appliedSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-600/30'
            }`}
          >
            {appliedSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Signature Confirmed &amp; Reflected on Certificate!</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Apply &amp; Confirm Signature on Certificate</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
