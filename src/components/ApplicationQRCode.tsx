import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Info, 
  Smartphone, 
  Sparkles, 
  Maximize2, 
  ShieldCheck, 
  RefreshCw,
  Sliders,
  Printer,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { JobApplication } from '../types';

interface ApplicationQRCodeProps {
  application: JobApplication;
  shareUrl: string;
}

export const ApplicationQRCode: React.FC<ApplicationQRCodeProps> = ({ application, shareUrl }) => {
  const [qrSrc, setQrSrc] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isCopiedId, setIsCopiedId] = useState<boolean>(false);
  const [encodeType, setEncodeType] = useState<'link' | 'id'>('link');
  const [qrColor, setQrColor] = useState<string>('#000E32'); // Midnight Blue
  const [qrLightColor, setQrLightColor] = useState<string>('#FFFFFF');
  const [marginSize, setMarginSize] = useState<number>(2);
  const [qrSize, setQrSize] = useState<number>(256);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isScanningSimulated, setIsScanningSimulated] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Text to encode
  const textToEncode = encodeType === 'link' ? shareUrl : application.id;

  // Generate QR Code data URL dynamically
  useEffect(() => {
    const generateQR = async () => {
      try {
        const options: QRCode.QRCodeToDataURLOptions = {
          width: qrSize,
          margin: marginSize,
          color: {
            dark: qrColor,
            light: qrLightColor
          },
          errorCorrectionLevel: 'H' // High error correction allows logos/damage
        };

        const dataUrl = await QRCode.toDataURL(textToEncode, options);
        setQrSrc(dataUrl);
      } catch (err) {
        console.error('Failed to generate QR Code:', err);
      }
    };

    generateQR();
  }, [textToEncode, qrColor, qrLightColor, marginSize, qrSize]);

  // Handle Download QR
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrSrc;
    link.download = `QR-Applicant-${application.personalInfo?.fullName?.replace(/\s+/g, '-') || 'File'}-${encodeType}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(application.id);
    setIsCopiedId(true);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  // Print QR Code specifically
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>DS Tech HR Scan File - ${application.personalInfo?.fullName || 'Applicant'}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              text-align: center;
              padding: 40px;
              color: #000E32;
            }
            .container {
              border: 2px solid #E2E8F0;
              border-radius: 24px;
              padding: 30px;
              display: inline-block;
              max-width: 400px;
            }
            img {
              width: 250px;
              height: 250px;
              margin: 20px 0;
            }
            h1 { font-size: 22px; margin-bottom: 5px; }
            p { font-size: 13px; color: #64748B; margin-top: 0; }
            .badge {
              background-color: #FFF7ED;
              color: #EA580C;
              border: 1px solid #FFEDD5;
              padding: 4px 12px;
              border-radius: 12px;
              font-weight: bold;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta {
              font-family: monospace;
              background-color: #F8FAFC;
              padding: 8px;
              border-radius: 8px;
              font-size: 12px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="badge">DS Tech HR Portal</span>
            <h1>Scan Applicant Record</h1>
            <p>Scan with any mobile device to retrieve full file immediately</p>
            <img src="${qrSrc}" />
            <div class="meta">
              <strong>Applicant:</strong> ${application.personalInfo?.fullName || 'N/A'}<br/>
              <strong>Role:</strong> ${application.positionSkills?.majorRole || 'N/A'}<br/>
              <strong>File ID:</strong> ${application.id}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Start simulated scan for desktop evaluation
  const runSimulatedScan = () => {
    setIsScanningSimulated(true);
    setSimulationStep(1);
    
    setTimeout(() => {
      setSimulationStep(2); // Parsed Link
    }, 1200);

    setTimeout(() => {
      setSimulationStep(3); // Connecting & Fetching
    }, 2400);

    setTimeout(() => {
      setSimulationStep(4); // Display Metadata
    }, 3600);
  };

  return (
    <div 
      className="bg-slate-900/90 border border-slate-800 text-white p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full shadow-2xl group/qr"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Glowing Core */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/15 rounded-full filter blur-2xl group-hover/qr:bg-orange-500/25 transition-all duration-700 pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/15 rounded-full filter blur-2xl group-hover/qr:bg-indigo-500/25 transition-all duration-700 pointer-events-none" />

      {/* Header and Info */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/20">
              <QrCode size={16} className="group-hover/qr:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none block">
                HR Scan Utility
              </span>
              <span className="text-[11px] font-bold text-slate-400 block mt-0.5 leading-none">
                Mobile Scanner Ready
              </span>
            </div>
          </div>

          {/* Quick simulation trigger */}
          <button
            onClick={runSimulatedScan}
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors border border-slate-700/50"
          >
            <Smartphone size={10} className="text-orange-400" />
            <span>Simulate Scan</span>
          </button>
        </div>

        {/* Dynamic description */}
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Quickly access and view this application on any tablet or smartphone by scanning the QR code below. Great for physical file attachment.
        </p>

        {/* Encode Source Selection Buttons */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setEncodeType('link')}
            className={`py-1 px-2 text-[10px] font-extrabold uppercase tracking-wide rounded-lg transition-all ${
              encodeType === 'link' 
                ? 'bg-orange-600 text-white shadow' 
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            Enc. Share URL
          </button>
          <button
            onClick={() => setEncodeType('id')}
            className={`py-1 px-2 text-[10px] font-extrabold uppercase tracking-wide rounded-lg transition-all ${
              encodeType === 'id' 
                ? 'bg-orange-600 text-white shadow' 
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            Enc. File ID Only
          </button>
        </div>

        {/* QR Code Graphic Frame */}
        <div className="flex flex-col items-center justify-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 relative group/frame">
          <AnimatePresence mode="wait">
            {qrSrc ? (
              <motion.div 
                key={qrSrc}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative p-3 bg-white rounded-xl shadow-lg border border-slate-800"
              >
                <img 
                  src={qrSrc} 
                  alt="Application QR Code" 
                  className="w-36 h-36 object-contain"
                />

                {/* Aesthetic Corner Target Overlays to mimic camera guide */}
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-orange-500 rounded-tl" />
                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-orange-500 rounded-tr" />
                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-orange-500 rounded-bl" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-orange-500 rounded-br" />

                {/* Small Logo Overlay in the center if high contrast dark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md border border-slate-100 shadow-sm flex items-center justify-center w-8 h-8">
                  <div className="w-full h-full bg-[#000E32] rounded flex items-center justify-center text-white text-[8px] font-black">
                    DS
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="w-36 h-36 bg-slate-900 animate-pulse rounded-xl flex items-center justify-center">
                <RefreshCw className="animate-spin text-slate-600" size={20} />
              </div>
            )}
          </AnimatePresence>

          {/* Quick customizer handle inside card */}
          <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] text-slate-400 font-mono">
            <Sliders size={10} className="text-orange-400" />
            <span>ECC Level: High (Type-H)</span>
          </div>

          {/* Hover Frame Actions */}
          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/frame:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-lg transition-all hover:scale-110"
              title="Expand QR Code"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg border border-slate-700 transition-all hover:scale-110"
              title="Download PNG"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg border border-slate-700 transition-all hover:scale-110"
              title="Print Badge"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Foot Actions Panel */}
      <div className="pt-4 mt-4 border-t border-slate-800 relative z-10 flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]" title={textToEncode}>
          {textToEncode}
        </span>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-slate-700/50"
          >
            <Download size={10} />
            <span>Download</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
          >
            <Printer size={10} />
            <span>Print QR</span>
          </button>
        </div>
      </div>

      {/* Expanded Modal View */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode size={18} className="text-orange-400 animate-pulse" />
                  <span className="font-extrabold uppercase tracking-wider text-sm">Enterprise QR badge</span>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Large QR Display */}
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl border border-slate-800">
                <img src={qrSrc} alt="High Res QR" className="w-48 h-48" />
                <span className="text-[10px] font-mono text-slate-400 mt-2 block break-all text-center">
                  {textToEncode}
                </span>
              </div>

              {/* Customizer controls */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block">
                  Interactive Configurator
                </span>

                <div className="space-y-2">
                  {/* Color Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">QR Color Fill</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { color: '#000E32', label: 'Navy' },
                        { color: '#EA580C', label: 'Orange' },
                        { color: '#10B981', label: 'Emerald' },
                        { color: '#1E293B', label: 'Slate' }
                      ].map((item) => (
                        <button
                          key={item.color}
                          onClick={() => setQrColor(item.color)}
                          className={`w-4 h-4 rounded-full border border-white/20 transition-transform ${
                            qrColor === item.color ? 'scale-125 ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900' : ''
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Padding Controller */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Quiet Zone (Margin)</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 4].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setMarginSize(sz)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            marginSize === sz ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sz}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Download / Copy Meta CTAs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download size={13} />
                  Download PNG
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-slate-700/50 flex items-center justify-center gap-1.5"
                >
                  <Printer size={13} />
                  Print QR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Scan Simulator Modal Overlay */}
      <AnimatePresence>
        {isScanningSimulated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-6"
            >
              {/* Animated HUD scanning frame */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="text-orange-400 animate-bounce" size={18} />
                  <span className="font-extrabold uppercase tracking-wider text-xs">HR Scanner Terminal [v2.4]</span>
                </div>
                <button 
                  onClick={() => setIsScanningSimulated(false)}
                  className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Simulator Screens */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 min-h-[220px] flex flex-col justify-between relative overflow-hidden font-mono">
                
                {/* Simulated Green Scan Beam Line */}
                {simulationStep < 4 && (
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34D399] z-20 pointer-events-none"
                  />
                )}

                {/* Step Content */}
                {simulationStep === 1 && (
                  <div className="space-y-3 my-auto text-center">
                    <p className="text-xs text-orange-400 animate-pulse uppercase font-bold">Scanning Camera Feed...</p>
                    <div className="flex justify-center py-2">
                      <QrCode size={40} className="text-slate-600 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-slate-500">Locating 3-Point Finder Patterns</p>
                  </div>
                )}

                {simulationStep === 2 && (
                  <div className="space-y-2 my-auto">
                    <p className="text-xs text-emerald-400 uppercase font-bold">✓ Finders Matched & Hashed</p>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 break-all leading-normal">
                      <strong>Payload URL:</strong><br />
                      {shareUrl}
                    </div>
                    <p className="text-[10px] text-slate-500 text-center animate-pulse mt-2">Decoding Data blocks...</p>
                  </div>
                )}

                {simulationStep === 3 && (
                  <div className="space-y-3 my-auto text-center">
                    <p className="text-xs text-indigo-400 uppercase font-bold">Establishing Secure Ingress Link</p>
                    <div className="flex justify-center">
                      <RefreshCw size={24} className="animate-spin text-indigo-400" />
                    </div>
                    <p className="text-[10px] text-slate-500">Retrieving Application Payload from Firebase Storage Node...</p>
                  </div>
                )}

                {simulationStep === 4 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <UserCheck size={12} />
                      </div>
                      <span className="text-xs text-emerald-400 font-extrabold uppercase">Validated Applicant Secured</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                      <div><strong className="text-slate-500">APPLICANT:</strong> <span className="font-bold text-white">{application.personalInfo?.fullName || 'N/A'}</span></div>
                      <div><strong className="text-slate-500">POSITION:</strong> <span className="text-slate-100">{application.positionSkills?.majorRole || 'N/A'}</span></div>
                      <div><strong className="text-slate-500">EMAIL:</strong> <span className="text-indigo-400">{application.personalInfo?.emailAddress || 'N/A'}</span></div>
                      <div><strong className="text-slate-500">SIGNING DT:</strong> <span className="text-slate-400">{application.declarationDate || 'N/A'}</span></div>
                      <div><strong className="text-slate-500">PORTAL LINK:</strong> <span className="text-orange-400 break-all text-[9px]">{shareUrl}</span></div>
                    </div>

                    <div className="text-[10px] text-slate-500 text-center border-t border-slate-900 pt-2 font-medium">
                      ✓ HR file state matched perfectly with Garki Head Office nodes.
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer controllers */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[9px] text-slate-500 flex items-center gap-1 font-mono">
                  <ShieldCheck size={10} className="text-emerald-500" />
                  E2E ENCRYPTED HANDSHAKE
                </span>

                <button
                  onClick={() => {
                    if (simulationStep === 4) {
                      setSimulationStep(1);
                      runSimulatedScan();
                    } else {
                      setIsScanningSimulated(false);
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  {simulationStep === 4 ? 'Scan Again' : 'Cancel Terminal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
