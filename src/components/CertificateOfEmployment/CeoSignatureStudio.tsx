import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenTool, Type, Upload, ShieldCheck, RotateCcw, Trash2,
  Check, CheckCircle2, Sparkles, Image as ImageIcon, Sliders,
  HelpCircle, Eye, RefreshCw, Feather, UserCheck
} from 'lucide-react';

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
  onSignatureApply: (result: CeoSignatureResult) => void;
  onClearSignature?: () => void;
  isCompact?: boolean;
}

// Preset Official Executive Vector Signature SVG Data URL
export const OFFICIAL_CEO_PRESET_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="90" viewBox="0 0 300 90" fill="none">
    <!-- Executive Flowing Master Pen Stroke -->
    <path d="M 20 62 C 35 22, 48 14, 64 60 C 76 76, 96 18, 112 36 C 128 56, 140 40, 156 60 C 170 72, 184 28, 204 48 C 224 64, 244 56, 276 68" stroke="#002D62" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 56 70 C 100 74, 170 72, 284 68" stroke="#002D62" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M 80 36 Q 90 8, 104 28" stroke="#002D62" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M 170 45 Q 185 20, 195 38" stroke="#002D62" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="288" cy="68" r="3.5" fill="#002D62" />
  </svg>`
)}`;

const INK_COLORS = [
  { id: 'navy', label: 'Executive Navy', value: '#002D62' },
  { id: 'black', label: 'Midnight Black', value: '#111827' },
  { id: 'royal', label: 'Royal Blue', value: '#0A2558' },
  { id: 'classic', label: 'Corporate Cobalt', value: '#0D47A1' },
];

const STROKE_WIDTHS = [
  { id: 'fine', label: 'Fine (1.5px)', value: 1.8 },
  { id: 'medium', label: 'Classic (2.8px)', value: 2.8 },
  { id: 'bold', label: 'Executive (4.2px)', value: 4.2 },
];

const CURSIVE_FONTS = [
  { id: 'great-vibes', name: 'Great Vibes', family: "'Great Vibes', cursive", sample: 'Donald S.' },
  { id: 'dancing-script', name: 'Dancing Script', family: "'Dancing Script', cursive", sample: 'Donald S.' },
  { id: 'alex-brush', name: 'Alex Brush', family: "'Alex Brush', cursive", sample: 'Donald S.' },
  { id: 'allura', name: 'Allura Script', family: "'Allura', cursive", sample: 'Donald S.' },
  { id: 'playball', name: 'Playball Prestige', family: "'Playball', cursive", sample: 'Donald S.' },
];

export const CeoSignatureStudio: React.FC<CeoSignatureStudioProps> = ({
  currentSignatureUrl,
  currentSignatureType = 'preset',
  initialSignatoryName = 'Dr. Donald S.',
  initialSignatoryPosition = 'Company Director/CEO',
  onSignatureApply,
  onClearSignature,
  isCompact = false,
}) => {
  // Active Tool Mode: 'draw' | 'type' | 'upload' | 'preset'
  const [activeMode, setActiveMode] = useState<'draw' | 'type' | 'upload' | 'preset'>(
    currentSignatureType || 'draw'
  );

  // Signatory Metadata
  const [signatoryName, setSignatoryName] = useState<string>(initialSignatoryName);
  const [signatoryPosition, setSignatoryPosition] = useState<string>(initialSignatoryPosition);
  const [signatureDate, setSignatureDate] = useState<string>(() => {
    return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  });
  const [includeSecurityStamp, setIncludeSecurityStamp] = useState<boolean>(true);

  // Common Customization
  const [selectedColor, setSelectedColor] = useState<string>('#002D62');
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState<number>(2.8);

  // Mode 1: DRAW State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([]);
  const [hasDrawnContent, setHasDrawnContent] = useState<boolean>(false);

  // Mode 2: TYPE State
  const [typedName, setTypedName] = useState<string>(initialSignatoryName || 'Dr. Donald S.');
  const [selectedFont, setSelectedFont] = useState<string>(CURSIVE_FONTS[0].family);
  const typeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mode 3: UPLOAD State
  const [uploadedRawImage, setUploadedRawImage] = useState<string | null>(null);
  const [uploadCleanedDataUrl, setUploadCleanedDataUrl] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState<boolean>(true);
  const [contrastThreshold, setContrastThreshold] = useState<number>(215);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  // Feedback State
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Initialize Canvas for Drawing
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = selectedStrokeWidth;

    // Clear with transparent
    ctx.clearRect(0, 0, rect.width, rect.height);
  }, [selectedColor, selectedStrokeWidth]);

  useEffect(() => {
    if (activeMode === 'draw') {
      // Allow DOM to layout
      const timer = setTimeout(() => {
        initCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeMode, initCanvas]);

  // Update canvas style on color / stroke change
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = selectedStrokeWidth;
      }
    }
  }, [selectedColor, selectedStrokeWidth]);

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history for undo
    try {
      const currentSnap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setDrawHistory((prev) => [...prev.slice(-10), currentSnap]);
    } catch {
      // Ignore security errors if tainted
    }

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawnContent(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

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

    if (drawHistory.length <= 1) {
      setHasDrawnContent(false);
    }
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
  };

  // Convert Typed Name to High-Res Transparent PNG
  const generateTypedSignatureDataUrl = useCallback((): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Measure text size to fit cleanly
    const fontSize = 72;
    ctx.font = `italic ${fontSize}px ${selectedFont}`;
    ctx.fillText(typedName || 'Donald S.', canvas.width / 2, canvas.height / 2);

    // Add optional elegant flourish stroke underline
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(100, canvas.height / 2 + 38);
    ctx.bezierCurveTo(240, canvas.height / 2 + 52, 380, canvas.height / 2 + 28, 500, canvas.height / 2 + 42);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  }, [typedName, selectedFont, selectedColor]);

  // Process Uploaded Image to Remove White Paper Background & Filter Ink
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
            // Calculate pixel brightness
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            if (brightness > threshold) {
              // Convert light/white paper pixel to completely transparent
              data[i + 3] = 0;
            } else {
              // Smooth semi-transparent edge anti-aliasing
              const alphaFactor = 1 - (brightness / threshold);
              data[i + 3] = Math.min(255, Math.floor(alphaFactor * 255 * 1.3));
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (err) {
          console.warn('[CeoSignatureStudio] Canvas transparency processing notice:', err);
        }
      }

      setUploadCleanedDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  }, []);

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

  // Re-process when contrast or background toggle changes
  useEffect(() => {
    if (uploadedRawImage) {
      processUploadedImage(uploadedRawImage, removeBackground, contrastThreshold);
    }
  }, [uploadedRawImage, removeBackground, contrastThreshold, processUploadedImage]);

  // Master Apply Handler
  const handleApplySignature = () => {
    let finalDataUrl = '';

    if (activeMode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas && hasDrawnContent) {
        finalDataUrl = canvas.toDataURL('image/png');
      } else {
        // Fallback to preset if canvas is empty
        finalDataUrl = OFFICIAL_CEO_PRESET_SVG;
      }
    } else if (activeMode === 'type') {
      finalDataUrl = generateTypedSignatureDataUrl();
    } else if (activeMode === 'upload') {
      finalDataUrl = uploadCleanedDataUrl || uploadedRawImage || OFFICIAL_CEO_PRESET_SVG;
    } else if (activeMode === 'preset') {
      finalDataUrl = OFFICIAL_CEO_PRESET_SVG;
    }

    const uniqueHash = `DST-EXEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;

    onSignatureApply({
      signatureDataUrl: finalDataUrl,
      signatureType: activeMode,
      signatoryName: signatoryName.trim() || 'Dr. Donald S.',
      signatoryPosition: signatoryPosition.trim() || 'Company Director/CEO',
      signedAt: signatureDate,
      signatureHash: uniqueHash,
    });

    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 2400);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
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
                Official Sign-Off
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Authorize certificates with authentic pen drawing, executive calligraphy, scanned signature, or official vector seal.
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="flex items-center gap-2">
          {currentSignatureUrl ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
              <CheckCircle2 size={13} />
              <span>Signed &amp; Authorized</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
              <UserCheck size={13} />
              <span>Using Preset Vector Seal</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        
        {/* Tool Mode Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
          {[
            { id: 'draw', label: 'Draw with Pen', icon: PenTool, desc: 'Digital Touch & Mouse Pad' },
            { id: 'type', label: 'Type Calligraphy', icon: Type, desc: 'Executive Cursive Script' },
            { id: 'upload', label: 'Upload Scan', icon: Upload, desc: 'Auto-Background Removal' },
            { id: 'preset', label: 'Official Seal Preset', icon: ShieldCheck, desc: 'Authorized DS Tech Mark' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMode(tab.id as any)}
                className={`flex-1 min-w-[130px] px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-[#000E32] dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={14} className={isActive ? 'text-orange-500' : 'text-slate-400'} />
                  <span className="font-extrabold">{tab.label}</span>
                </div>
                <span className="text-[9px] font-normal text-slate-400">{tab.desc}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* MODE 1: DRAW SIGNATURE CANVAS                             */}
        {/* ========================================================= */}
        {activeMode === 'draw' && (
          <div className="space-y-4">
            
            {/* Draw Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              
              {/* Color Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Ink:</span>
                <div className="flex items-center gap-1.5">
                  {INK_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.value)}
                      title={c.label}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        selectedColor === c.value
                          ? 'scale-110 ring-2 ring-orange-500 border-white'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                    >
                      {selectedColor === c.value && <Check size={11} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Stroke:</span>
                {STROKE_WIDTHS.map((sw) => (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => setSelectedStrokeWidth(sw.value)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      selectedStrokeWidth === sw.value
                        ? 'bg-[#000E32] text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {sw.label.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Actions: Undo & Clear */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUndoDraw}
                  disabled={drawHistory.length === 0}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Undo</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearDraw}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Clear Pad</span>
                </button>
              </div>

            </div>

            {/* Interactive Canvas Pad */}
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden shadow-inner touch-none">
              
              {/* Subtle Guide Line */}
              <div className="absolute left-10 right-10 bottom-8 border-b border-dashed border-slate-300 dark:border-slate-800 pointer-events-none flex items-center justify-between">
                <span className="text-[9px] text-slate-300 uppercase tracking-widest font-mono">Sign Here</span>
                <span className="text-[9px] text-slate-300 font-mono">×</span>
              </div>

              {!hasDrawnContent && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none select-none">
                  <Feather size={28} className="text-slate-300 dark:text-slate-700 mb-1 opacity-60" />
                  <p className="text-xs font-semibold">Draw signature with finger, stylus or mouse</p>
                  <p className="text-[10px] text-slate-400">High-resolution smooth digital ink capture</p>
                </div>
              )}

              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-44 cursor-crosshair block relative z-10"
              />
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 2: TYPE CALLIGRAPHY SIGNATURE                        */}
        {/* ========================================================= */}
        {activeMode === 'type' && (
          <div className="space-y-4">
            
            {/* Input Name & Color Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  CEO Signatory Name (Typed)
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Dr. Donald S."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Signature Ink Color
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {INK_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.value)}
                      title={c.label}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        selectedColor === c.value
                          ? 'scale-110 ring-2 ring-orange-500 border-white'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                    >
                      {selectedColor === c.value && <Check size={13} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Font Style Selection */}
            <div>
              <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-2">
                Choose Executive Calligraphy Script Style
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {CURSIVE_FONTS.map((font) => {
                  const isSelected = selectedFont === font.family;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font.family)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 ring-2 ring-orange-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {font.name}
                        </span>
                        {isSelected && <Check size={14} className="text-orange-500" />}
                      </div>

                      <div
                        className="text-2xl truncate py-1 text-slate-800 dark:text-white"
                        style={{ fontFamily: font.family, color: isSelected ? selectedColor : undefined }}
                      >
                        {typedName || 'Donald S.'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 mb-2">
                Live Calligraphy Output
              </span>
              <div
                className="text-4xl text-center py-2 select-none"
                style={{ fontFamily: selectedFont, color: selectedColor }}
              >
                {typedName || 'Dr. Donald S.'}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 3: UPLOAD SIGNATURE SCAN WITH BACKGROUND REMOVAL     */}
        {/* ========================================================= */}
        {activeMode === 'upload' && (
          <div className="space-y-4">
            
            {/* File Drag & Drop / Input */}
            <div
              onClick={() => uploadInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-3xl p-6 text-center bg-slate-50 dark:bg-slate-800/30 transition-colors cursor-pointer"
            >
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 mx-auto flex items-center justify-center mb-3">
                <Upload size={22} />
              </div>

              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Upload Signature Image or Photo
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Supports PNG, JPG, or SVG scans. Our smart filter automatically removes paper background!
              </p>
            </div>

            {/* Upload Adjustments */}
            {uploadedRawImage && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#000E32] dark:text-white flex items-center gap-1.5">
                    <Sliders size={14} className="text-orange-500" />
                    Automatic Background Cleaner
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeBackground}
                      onChange={(e) => setRemoveBackground(e.target.checked)}
                      className="rounded text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Transparent Paper Removal
                    </span>
                  </label>
                </div>

                {removeBackground && (
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                      <span>Paper Brightness Cutoff</span>
                      <span>Threshold: {contrastThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="245"
                      value={contrastThreshold}
                      onChange={(e) => setContrastThreshold(Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                  </div>
                )}

                {/* Cleaned Result Preview */}
                <div className="pt-2 flex justify-center">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs max-w-xs flex items-center justify-center">
                    <img
                      src={uploadCleanedDataUrl || uploadedRawImage}
                      alt="Uploaded Signature"
                      className="max-h-20 object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 4: OFFICIAL PRESET VECTOR SEAL                       */}
        {/* ========================================================= */}
        {activeMode === 'preset' && (
          <div className="p-5 bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-800/40 dark:to-orange-950/10 rounded-2xl border border-orange-200 dark:border-orange-900/40 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#000E32] dark:text-white">
                  DS Tech Official Authorized Corporate Signature
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Pre-configured vector director sign-off with permanent high-security vector strokes.
                </p>
              </div>
            </div>

            {/* Vector Render Preview */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <img
                src={OFFICIAL_CEO_PRESET_SVG}
                alt="Official Preset Signature"
                className="max-h-16 object-contain"
              />
            </div>

            <p className="text-[10px] text-slate-500 italic text-center">
              This signature is automatically verified and accepted across all formal DS Tech employment certificates.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* SIGNATORY METADATA PARAMETERS                             */}
        {/* ========================================================= */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Authorized Signatory Name
              </label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="Dr. Donald S."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Executive Designation
              </label>
              <input
                type="text"
                value={signatoryPosition}
                onChange={(e) => setSignatoryPosition(e.target.value)}
                placeholder="Company Director/CEO"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Authorization Date
              </label>
              <input
                type="text"
                value={signatureDate}
                onChange={(e) => setSignatureDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          
          {onClearSignature && currentSignatureUrl && (
            <button
              type="button"
              onClick={onClearSignature}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reset to Preset
            </button>
          )}

          <button
            type="button"
            onClick={handleApplySignature}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
              appliedSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-600/30'
            }`}
          >
            {appliedSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Signature Applied to Certificate!</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Apply CEO Signature to Certificate</span>
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
};
