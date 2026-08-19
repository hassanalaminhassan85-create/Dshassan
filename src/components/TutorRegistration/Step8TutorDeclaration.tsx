import React, { useRef, useState, useEffect } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  PenTool, 
  Type, 
  RotateCcw, 
  Check, 
  Calendar, 
  User, 
  AlertCircle 
} from 'lucide-react';
import { TutorApplication } from '../../types/tutorRegistration';

interface Step8TutorDeclarationProps {
  data: TutorApplication;
  onChange: (updated: Partial<TutorApplication>) => void;
}

export const Step8TutorDeclaration: React.FC<Step8TutorDeclarationProps> = ({
  data,
  onChange
}) => {
  const [signatureMode, setSignatureMode] = useState<'type' | 'draw'>('type');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize declaration date if not set
  useEffect(() => {
    if (!data.declarationDate) {
      onChange({ declarationDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) });
    }
    if (!data.declarationApplicantName && data.fullName) {
      onChange({ declarationApplicantName: data.fullName });
    }
  }, [data.fullName, data.declarationDate]);

  // Drawing Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange({ signatureData: canvas.toDataURL() });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      onChange({ signatureData: '' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
          <FileCheck2 className="w-4 h-4" />
          <span>Step 8 of 9 • Legal Affirmation & Electronic Signature</span>
        </div>
        <h3 className="text-2xl font-extrabold text-white mt-1">Instructor Declaration & Binding Affirmation</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Please review the official institutional declaration statement and sign your name electronically before final submission.
        </p>
      </div>

      {/* Official Declaration Block */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-bold text-white uppercase tracking-wide">
              Official Instructor Appointment Declaration
            </h4>
            <blockquote className="text-xs sm:text-sm text-slate-300 italic bg-slate-950/80 p-4 rounded-2xl border border-slate-800 leading-relaxed font-serif">
              "I certify that the information provided in this application is accurate, complete, and truthful to the best of my knowledge. I understand that DS Tech Academy may verify the information provided and may conduct further assessments before making an appointment."
            </blockquote>
          </div>
        </div>

        {/* Checkbox Agreement */}
        <label 
          onClick={() => onChange({ agreedToTerms: !data.agreedToTerms })}
          className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 cursor-pointer transition-all"
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border shrink-0 transition-all ${
            data.agreedToTerms ? 'bg-orange-500 border-orange-400 text-white' : 'border-slate-700 bg-slate-900'
          }`}>
            {data.agreedToTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <div className="text-xs text-slate-200 leading-relaxed">
            <strong className="text-white">I confirm and agree:</strong> I have thoroughly read the DSTA faculty declaration above and attest that all statements, upload credentials, and experience records submitted are authentic.
          </div>
        </label>

        {/* Name and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Applicant's Full Name <span className="text-orange-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={data.declarationApplicantName || data.fullName}
                onChange={(e) => onChange({ declarationApplicantName: e.target.value })}
                placeholder="Full Name as stated in Step 2"
                className="w-full px-4 py-3 pl-11 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Declaration Date (Auto-filled)
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={data.declarationDate || new Date().toLocaleDateString()}
                className="w-full px-4 py-3 pl-11 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-400 font-mono cursor-not-allowed"
              />
              <Calendar className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Electronic Signature Box */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Electronic Signature <span className="text-orange-400">*</span>
            </label>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSignatureMode('type')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  signatureMode === 'type'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Type Name</span>
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  signatureMode === 'draw'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw Signature</span>
              </button>
            </div>
          </div>

          {signatureMode === 'type' ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-2">
              <input
                type="text"
                value={data.signatureData.startsWith('data:') ? '' : data.signatureData}
                onChange={(e) => onChange({ signatureData: e.target.value })}
                placeholder="Type your official legal signature here..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-lg font-serif italic text-orange-400 focus:outline-none focus:border-orange-500"
              />
              <p className="text-[10px] text-slate-500">
                Typing your full legal name serves as a legally recognized cryptographic signature under Nigerian Cybercrimes Act.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-3">
              <div className="relative w-full h-32 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Draw your signature with mouse or touch</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Canvas</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
