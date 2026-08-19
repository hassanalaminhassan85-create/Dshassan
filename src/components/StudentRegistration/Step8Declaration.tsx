import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Check, Edit3, Trash2, Calendar, FileCheck, CheckCircle2 } from 'lucide-react';

interface Step8DeclarationProps {
  agreedToTerms: boolean;
  declarationApplicantName: string;
  signatureData: string;
  declarationDate: string;
  onChange: (fields: Partial<Step8DeclarationProps>) => void;
}

export const Step8Declaration: React.FC<Step8DeclarationProps> = ({
  agreedToTerms,
  declarationApplicantName,
  signatureData,
  declarationDate,
  onChange
}) => {
  const [signatureMode, setSignatureMode] = useState<'type' | 'draw'>('type');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas drawing handlers
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
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f97316';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange({ signatureData: canvas.toDataURL('image/png') });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange({ signatureData: '' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
          Step 8 of 10
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Applicant Declaration & Code of Conduct
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review the institutional pledge and sign to authenticate your formal enrollment application.
        </p>
      </div>

      {/* Official Declaration Text Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-orange-500/30 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Official Statement of Truth</h4>
            <span className="text-[10px] text-slate-400 font-medium font-mono">DSTA / LEGAL / ENR-2026</span>
          </div>
        </div>

        <blockquote className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed italic">
          "I declare that the information provided in this application is true and accurate. I agree to abide by the rules, regulations, academic requirements, payment policies, attendance requirements, and code of conduct of DS Tech Academy."
        </blockquote>

        {/* Declaration Checkbox */}
        <label className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 cursor-pointer group transition-all">
          <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-all ${
            agreedToTerms ? 'bg-orange-500 border-orange-400 text-white' : 'border-slate-600 bg-slate-900'
          }`}>
            {agreedToTerms && <Check className="w-3.5 h-3.5" />}
          </div>
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => onChange({ agreedToTerms: e.target.checked })}
            className="hidden"
          />
          <span className="text-xs text-slate-200 font-bold group-hover:text-white leading-snug">
            I understand and accept all terms of admission, attendance prerequisites (70% minimum), and the 70/30 fee policy.
          </span>
        </label>
      </div>

      {/* Applicant's Name & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Applicant's Full Legal Name <span className="text-orange-400">*</span>
          </label>
          <input
            type="text"
            value={declarationApplicantName}
            onChange={(e) => onChange({ declarationApplicantName: e.target.value })}
            placeholder="Type your full name as legal acknowledgement"
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Declaration Date (Auto-filled)
          </label>
          <div className="px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-mono text-sm flex items-center justify-between">
            <span>{declarationDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Applicant Electronic Signature <span className="text-orange-400">*</span>
          </label>

          {/* Mode Switcher */}
          <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSignatureMode('type')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                signatureMode === 'type' ? 'bg-orange-500 text-white' : 'text-slate-400'
              }`}
            >
              Type Signature
            </button>
            <button
              type="button"
              onClick={() => setSignatureMode('draw')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                signatureMode === 'draw' ? 'bg-orange-500 text-white' : 'text-slate-400'
              }`}
            >
              Draw Signature
            </button>
          </div>
        </div>

        {signatureMode === 'type' ? (
          <div>
            <input
              type="text"
              value={signatureData.startsWith('data:') ? '' : signatureData}
              onChange={(e) => onChange({ signatureData: e.target.value })}
              placeholder="e.g. /s/ Ibrahim D. Mohammed"
              className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-slate-700 text-orange-400 font-serif italic text-lg focus:outline-none focus:border-orange-500"
            />
            <p className="text-[10px] text-slate-500 mt-1.5">Typing your name here constitutes a legally binding electronic signature.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative border-2 border-dashed border-slate-700 bg-slate-950 rounded-2xl overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 cursor-crosshair touch-none"
              />
              <span className="absolute bottom-2 left-3 text-[10px] text-slate-600 font-mono pointer-events-none">
                Draw inside this box using touch or mouse
              </span>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearCanvas}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Signature</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
