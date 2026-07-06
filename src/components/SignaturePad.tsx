import React, { useRef, useState, useEffect } from 'react';
import { Pen, Type, Upload, RotateCcw, Paintbrush, FileImage, Undo2 } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string, type: 'draw' | 'type' | 'upload') => void;
  initialValue?: string;
  initialType?: 'draw' | 'type' | 'upload';
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  initialValue = '',
  initialType = 'draw',
}) => {
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>(initialType);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<string>('#0F172A'); // Slate/Black
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [typedName, setTypedName] = useState<string>('');
  const [selectedFont, setSelectedFont] = useState<string>('font-handwriting-1');
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    initialType === 'upload' ? initialValue : null
  );

  // For Undo functionality in Canvas
  const [history, setHistory] = useState<string[]>([]);

  // Signature fonts options
  const handwritingFonts = [
    { id: 'font-handwriting-1', name: 'Classic Calligraphy', className: 'font-["Playfair_Display",_cursive] italic tracking-wide font-medium' },
    { id: 'font-handwriting-2', name: 'Casual Script', className: 'font-["Caveat",_cursive] tracking-wider' },
    { id: 'font-handwriting-3', name: 'Elegant Brush', className: 'font-["Sacramento",_cursive] font-semibold text-3xl' },
    { id: 'font-handwriting-4', name: 'Sophisticated', className: 'font-["Great_Vibes",_cursive] text-4xl' },
  ];

  // Initialize Canvas
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      // If initial value exists and is of draw type, load it
      if (initialType === 'draw' && initialValue) {
        const image = new Image();
        image.src = initialValue;
        image.onload = () => {
          ctx?.drawImage(image, 0, 0);
          saveToHistory();
        };
      }
    }
  }, [mode]);

  // Coordinates helper for touch and mouse
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Standardize scaling if the internal canvas size is different from Client CSS size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = lineWidth;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      triggerSave();
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHistory([]);
        onSave('', 'draw');
      }
    }
  };

  const saveToHistory = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setHistory(prev => [...prev, dataUrl]);
    }
  };

  const undoLast = () => {
    if (history.length <= 1) {
      clearCanvas();
      return;
    }

    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const prevState = newHistory[newHistory.length - 1];
    setHistory(newHistory);

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const image = new Image();
        image.src = prevState;
        image.onload = () => {
          ctx.drawImage(image, 0, 0);
          onSave(prevState, 'draw');
        };
      }
    }
  };

  const triggerSave = () => {
    if (!canvasRef.current) return;
    // Debounce or immediately save the canvas details standard base64 URL
    const dataUrl = canvasRef.current.toDataURL();
    onSave(dataUrl, 'draw');
  };

  // Type signature side effects
  useEffect(() => {
    if (mode === 'type') {
      // Create a temporary off-screen Canvas to render the elegant typography signature as image URL
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx && typedName.trim()) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = penColor;
        // Select custom font family representation based on font mapping
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const fontName = selectedFont === 'font-handwriting-1' 
          ? 'italic 34px "Playfair Display", Georgia, serif'
          : selectedFont === 'font-handwriting-2'
          ? '42px "Caveat", "Comic Sans MS", cursive'
          : selectedFont === 'font-handwriting-3'
          ? '54px "Sacramento", cursive'
          : '54px "Great Vibes", cursive';
        
        ctx.font = fontName;
        ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
        
        // Add tiny certificate watermark or line to make it extremely valid
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 110);
        ctx.lineTo(470, 110);
        ctx.stroke();

        onSave(canvas.toDataURL(), 'type');
      } else {
        onSave('', 'type');
      }
    }
  }, [typedName, selectedFont, penColor, mode]);

  // Handle uploaded images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImage(base64String);
        onSave(base64String, 'upload');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-inner p-4 flex flex-col gap-4">
      {/* Mode Select Tabs */}
      <div className="flex gap-2 bg-slate-200/60 p-1.5 rounded-xl self-center max-w-sm w-full shadow-sm">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            mode === 'draw'
              ? 'bg-white text-slate-900 shadow'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <Pen size={14} />
          Draw Sign
        </button>
        <button
          type="button"
          onClick={() => setMode('type')}
          className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            mode === 'type'
              ? 'bg-white text-slate-900 shadow'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <Type size={14} />
          Type Sign
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            mode === 'upload'
              ? 'bg-white text-slate-900 shadow'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <Upload size={14} />
          Upload Image
        </button>
      </div>

      {/* Signature Toolbar controls */}
      {mode !== 'upload' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 border border-slate-100 rounded-xl">
          {/* Colors */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pen:
            </span>
            <div className="flex gap-1.5">
              {[
                { value: '#000000', label: 'Black' },
                { value: '#1E3A8A', label: 'Navy Blue' },
                { value: '#991B1B', label: 'Crimson' },
              ].map(color => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  onClick={() => setPenColor(color.value)}
                  className={`w-6 h-6 rounded-full border transition-transform duration-300 ${
                    penColor === color.value ? 'scale-125 border-slate-700 ring-2 ring-slate-200' : 'border-slate-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width (only draw mode) */}
          {mode === 'draw' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Weight:
              </span>
              <div className="flex gap-1 bg-white p-0.5 rounded-lg">
                {[
                  { value: 1.5, label: 'Fine' },
                  { value: 3, label: 'Medium' },
                  { value: 5, label: 'Bold' },
                ].map(sizeOpt => (
                  <button
                    key={sizeOpt.value}
                    type="button"
                    onClick={() => setLineWidth(sizeOpt.value)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all duration-300 ${
                      lineWidth === sizeOpt.value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {sizeOpt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Tools */}
          {mode === 'draw' && (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={undoLast}
                disabled={history.length === 0}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200"
                title="Undo last stroke"
              >
                <Undo2 size={16} />
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-1 text-xs font-semibold"
                title="Clear all"
              >
                <RotateCcw size={14} />
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Surface Frame */}
      <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner flex flex-col justify-center items-center min-h-[160px]">
        {mode === 'draw' && (
          <canvas
            ref={canvasRef}
            width={580}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair touch-none bg-white block"
          />
        )}

        {mode === 'type' && (
          <div className="w-full p-6 flex flex-col gap-4">
            <input
              type="text"
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              placeholder="Type your full name here..."
              maxLength={40}
              className="w-full text-center px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:border-slate-400 focus:outline-none transition-all duration-200 text-lg font-medium text-slate-800"
            />

            {typedName.trim() && (
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Select Calligraphy Style:
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {handwritingFonts.map(font => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font.id)}
                      className={`p-3 border rounded-xl text-center flex flex-col items-center justify-center min-h-[70px] bg-white hover:bg-white transition-all duration-300 ${
                        selectedFont === font.id
                          ? 'border-indigo-500 ring-2 ring-indigo-50/70 bg-indigo-50/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-[#0F172A] ${font.className}`} style={{ color: penColor }}>
                        {typedName}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-1 font-sans">{font.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'upload' && (
          <div className="w-full p-6 flex flex-col items-center justify-center text-center">
            {uploadedImage && uploadedImage.trim() !== '' ? (
              <div className="relative group max-w-sm w-full bg-white border rounded-xl p-4 flex flex-col items-center">
                <img
                  src={uploadedImage}
                  alt="Uploaded Signature"
                  className="max-h-[140px] max-w-full object-contain filter select-none pointer-events-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage(null);
                    onSave('', 'upload');
                  }}
                  className="mt-3 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-semibold rounded-lg self-center border border-red-100 transition-colors duration-200"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="w-full max-w-md border-2 border-dashed border-slate-300 hover:border-slate-400 cursor-pointer p-6 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white transition-all duration-300 hover:bg-white">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="p-3 bg-white rounded-full text-slate-600 group-hover:scale-110 transition-transform duration-300">
                  <FileImage size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    Upload Signature Photo
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    PNG with transparent background (recommended)
                  </span>
                </div>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Guide/Agreement Info */}
      <div className="text-[10px] text-slate-400 text-center leading-relaxed px-4">
        This is an electronic signature tool. By completing this, you authorize it to be placed on your job application documents as a secure digital identifier.
      </div>
    </div>
  );
};
