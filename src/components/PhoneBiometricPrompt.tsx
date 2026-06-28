import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Scan, X, Check, ShieldCheck, KeyRound, Smartphone, Sparkles } from 'lucide-react';

interface PhoneBiometricPromptProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
  actionText?: string;
}

export const PhoneBiometricPrompt: React.FC<PhoneBiometricPromptProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  title = "Biometric Authorization",
  subtitle = "DS Tech Portal • Secure Identity Verification",
  actionText = "Verify Identity"
}) => {
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'faceid'>('fingerprint');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Tap sensor to begin scan");
  const [pinInput, setPinInput] = useState<string>('');
  const [showPinBypass, setShowPinBypass] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Re-usable helper for native haptics or console cues
  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(pattern);
      } catch (e) {
        // Ignore sandbox security errors gracefully
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset states on close
      setScanState('idle');
      setProgress(0);
      setStatusMessage("Tap sensor to begin scan");
      setShowPinBypass(false);
      setPinInput('');
      setPinError(null);
    } else {
      triggerHaptic(20);
    }
  }, [isOpen]);

  // Handle the simulated scanning animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanState === 'scanning') {
      setStatusMessage(biometricType === 'fingerprint' ? "Hold finger on sensor..." : "Position face in frame...");
      setProgress(0);
      
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 4;
          if (next >= 100) {
            clearInterval(interval);
            setScanState('verifying');
            return 100;
          }
          // Dynamic text updates based on progress
          if (next > 75) {
            setStatusMessage("Encrypting biometric token...");
          } else if (next > 40) {
            setStatusMessage(biometricType === 'fingerprint' ? "Analyzing whorl patterns..." : "Scanning 3D facial vectors...");
          } else if (next > 15) {
            setStatusMessage("Reading biometric matrix...");
          }
          return next;
        });
      }, 60);
    }
    return () => clearInterval(interval);
  }, [scanState, biometricType]);

  // Handle verifying and finishing
  useEffect(() => {
    if (scanState === 'verifying') {
      setStatusMessage("Verifying cryptographic keys on Cloudflare D1 Node...");
      triggerHaptic([30, 30]);

      const timer = setTimeout(() => {
        setScanState('success');
        setStatusMessage("Identity successfully verified!");
        triggerHaptic(100);

        // Call success callback after showing the checkmark animation
        const successTimer = setTimeout(() => {
          onSuccess();
        }, 1200);
        return () => clearTimeout(successTimer);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [scanState, onSuccess]);

  const startScan = () => {
    if (scanState === 'idle' || scanState === 'failed') {
      triggerHaptic(40);
      setScanState('scanning');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '2026') {
      triggerHaptic(100);
      setScanState('success');
      setStatusMessage("Passcode accepted! Secure bypass enabled.");
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      triggerHaptic([50, 100, 50]);
      setPinError("Invalid backup passcode (Demo: 2026)");
      setPinInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="phone-biometric-overlay" className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        {/* Background Click to Dismiss */}
        <div className="absolute inset-0" onClick={onCancel} />

        <motion.div
          id="phone-biometric-prompt-card"
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative max-w-sm w-full bg-slate-900/95 border border-white/15 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 text-white text-center z-10"
        >
          {/* Accent light decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/10 rounded-full filter blur-2xl pointer-events-none" />
          
          {/* Close button */}
          <button
            id="close-biometric-prompt"
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="mb-6 pt-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
              <Smartphone size={10} className="text-orange-400 animate-pulse" />
              <span>Simulated Device Security</span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">{title}</h3>
            <p className="text-[11px] text-slate-400 mt-1 px-4">{subtitle}</p>
          </div>

          {!showPinBypass ? (
            <div className="flex flex-col items-center">
              {/* Type selector (FaceID vs TouchID) */}
              {scanState === 'idle' && (
                <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 mb-6 text-xs font-bold uppercase tracking-widest">
                  <button
                    type="button"
                    onClick={() => { setBiometricType('fingerprint'); triggerHaptic(10); }}
                    className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${biometricType === 'fingerprint' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Fingerprint size={12} />
                    <span>Touch ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBiometricType('faceid'); triggerHaptic(10); }}
                    className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${biometricType === 'faceid' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Scan size={12} />
                    <span>Face ID</span>
                  </button>
                </div>
              )}

              {/* Central Scanner Visual Element */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                {/* Outer Progress Rim Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className="stroke-white/5"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className={`${scanState === 'success' ? 'stroke-emerald-500' : 'stroke-orange-500'} transition-all duration-100`}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * progress) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Animated Pulsing Scanner Ring */}
                <AnimatePresence>
                  {scanState === 'scanning' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.4, 0.15] }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="absolute inset-2 rounded-full border-2 border-orange-500 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Center Core Button & Icon */}
                <motion.button
                  id="biometric-trigger-button"
                  type="button"
                  onClick={startScan}
                  disabled={scanState !== 'idle' && scanState !== 'failed'}
                  whileHover={scanState === 'idle' ? { scale: 1.05 } : {}}
                  whileTap={scanState === 'idle' ? { scale: 0.95 } : {}}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative border cursor-pointer ${
                    scanState === 'success'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : scanState === 'scanning'
                      ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 animate-pulse'
                      : scanState === 'verifying'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {scanState === 'success' ? (
                    <motion.div
                      initial={{ scale: 0.5, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex flex-col items-center"
                    >
                      <Check size={40} className="stroke-[3]" />
                    </motion.div>
                  ) : biometricType === 'fingerprint' ? (
                    <div className="relative">
                      <Fingerprint size={42} className={`stroke-[1.5] ${scanState === 'scanning' ? 'text-orange-500 animate-[pulse_1s_infinite]' : ''}`} />
                      {scanState === 'scanning' && (
                        <motion.div
                          animate={{ y: [-15, 20, -15] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="absolute left-0 right-0 h-0.5 bg-orange-400/80 shadow-[0_0_8px_rgba(249,115,22,1)]"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <Scan size={42} className={`stroke-[1.5] ${scanState === 'scanning' ? 'text-orange-500 animate-pulse' : ''}`} />
                      {scanState === 'scanning' && (
                        <motion.div
                          animate={{ y: [-15, 20, -15] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                          className="absolute left-0 right-0 h-0.5 bg-orange-400/80 shadow-[0_0_8px_rgba(249,115,22,1)]"
                        />
                      )}
                    </div>
                  )}

                  {scanState === 'idle' && (
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-2">
                      Tap to Scan
                    </span>
                  )}
                  {scanState === 'scanning' && (
                    <span className="text-[8px] font-black uppercase tracking-wider text-orange-400 mt-2">
                      {progress}% Done
                    </span>
                  )}
                  {scanState === 'verifying' && (
                    <span className="text-[8px] font-black uppercase tracking-wider text-cyan-400 mt-2 animate-pulse">
                      Verifying...
                    </span>
                  )}
                  {scanState === 'success' && (
                    <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 mt-2 font-mono">
                      SECURE MATCH
                    </span>
                  )}
                </motion.button>
              </div>

              {/* Status and Action cues */}
              <div className="mb-6 min-h-[40px] px-4 flex flex-col justify-center">
                <p className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                  scanState === 'success' ? 'text-emerald-400' :
                  scanState === 'verifying' ? 'text-cyan-400' :
                  scanState === 'scanning' ? 'text-orange-400' : 'text-slate-300'
                }`}>
                  {statusMessage}
                </p>
                {scanState === 'idle' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Your real device biometric scan is bypassed for this interactive demo.
                  </p>
                )}
              </div>

              {/* Quick bypass button */}
              <button
                id="bypass-with-passcode"
                type="button"
                onClick={() => { setShowPinBypass(true); triggerHaptic(10); }}
                className="text-[10px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer border border-indigo-500/20 px-3 py-1.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10"
              >
                <KeyRound size={11} />
                <span>Use Backup Passcode</span>
              </button>
            </div>
          ) : (
            /* PIN / PASSCODE BYPASS FORM */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="py-4 px-2"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <KeyRound size={20} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-1">Enter Security Pin</h4>
              <p className="text-[10px] text-slate-400 mb-4">Enter your backup security pin to complete authorized action.</p>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <input
                    id="biometric-pin-input"
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/\D/g, ''));
                      setPinError(null);
                    }}
                    className="w-full text-center tracking-[1.5em] font-mono text-xl py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    autoFocus
                  />
                  {pinError ? (
                    <p className="text-[9px] text-red-400 font-bold mt-1.5 uppercase tracking-wide">{pinError}</p>
                  ) : (
                    <p className="text-[9px] text-slate-500 mt-1.5 uppercase tracking-wide">Demo Pin is <strong className="text-slate-400">2026</strong></p>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    id="cancel-pin-bypass"
                    type="button"
                    onClick={() => { setShowPinBypass(false); setPinInput(''); setPinError(null); triggerHaptic(10); }}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Back to Scan
                  </button>
                  <button
                    id="submit-pin-bypass"
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Submit Pin
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Footer lock note */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            <ShieldCheck size={12} className="text-slate-500" />
            <span>End-to-end encrypted node tunnel</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
