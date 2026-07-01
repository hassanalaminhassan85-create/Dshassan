import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fingerprint, 
  X, 
  Check, 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  AlertTriangle, 
  RefreshCw,
  Cpu,
  Lock
} from 'lucide-react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { apiGetBiometricLogs, apiLogBiometricAttempt, BiometricLogRecord } from '../lib/api';

interface PhoneBiometricPromptProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  actionText?: string;
  mode?: 'register' | 'login' | 'verify';
  userId?: string;
  email?: string;
}

export const PhoneBiometricPrompt: React.FC<PhoneBiometricPromptProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  onClose,
  title = "Biometric Passkey Validation",
  subtitle = "DS Tech Hub • Hardware Security Enclave",
  mode = 'verify',
  userId = 'usr-demo',
  email = 'candidate2026@dstech.com'
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>("Initializing secure biometric handshake...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [securityLogs, setSecurityLogs] = useState<BiometricLogRecord[]>([]);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState<boolean>(false);
  const [isSandbox, setIsSandbox] = useState<boolean>(false);

  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(pattern);
      } catch (e) {
        // Safe catch for iframe sandbox limitations
      }
    }
  };

  const handleDismiss = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const fetchSecurityLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const logs = await apiGetBiometricLogs(userId);
      setSecurityLogs(logs);
    } catch (e) {
      console.error("Could not fetch security logs:", e);
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  // Run the Real WebAuthn Protocol
  const runWebAuthn = async () => {
    try {
      setErrorMessage(null);
      setScanState('scanning');
      setStatusMessage("Contacting device's secure enclave...");
      triggerHaptic(30);

      const isRegistration = mode === 'register';

      if (isRegistration) {
        // 1. Fetch registration options from server
        setStatusMessage("Generating cryptographic credentials...");
        const res = await fetch(`/api/auth/register-options?userId=${userId}&username=${encodeURIComponent(email)}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to generate registration options on backend.");
        }
        const options = await res.json();

        // 2. Trigger native OS/Browser WebAuthn prompt
        setStatusMessage("Please authenticate on your device...");
        const regResp = await startRegistration(options);

        // 3. Verify response with server
        setStatusMessage("Verifying cryptographic signature on ledger...");
        const verifyRes = await fetch('/api/auth/verify-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, response: regResp })
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.verified) {
          throw new Error(verifyData.error || "WebAuthn cryptographic validation failed.");
        }

        setScanState('success');
        setStatusMessage("Passkey registered and stored securely!");
        triggerHaptic(100);
        setTimeout(() => {
          onSuccess();
        }, 1500);

      } else {
        // 1. Fetch authentication options from server
        setStatusMessage("Retrieving passkey challenges...");
        const res = await fetch(`/api/auth/authenticate-options?userId=${userId}&username=${encodeURIComponent(email)}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to generate authentication options on backend.");
        }
        const options = await res.json();

        // 2. Trigger native OS/Browser WebAuthn prompt
        setStatusMessage("Please verify your biometrics...");
        const authResp = await startAuthentication(options);

        // 3. Verify response with server
        setStatusMessage("Authenticating biometric signature...");
        const verifyRes = await fetch('/api/auth/authenticate-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, response: authResp })
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.verified) {
          throw new Error(verifyData.error || "Biometric validation failed.");
        }

        setScanState('success');
        setStatusMessage("Identity verified successfully!");
        triggerHaptic(100);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

      // Re-fetch audit logs to show the new success entry
      await fetchSecurityLogs();

    } catch (err: any) {
      console.error("WebAuthn Failure:", err);
      
      let friendlyError = err.message || "An unexpected error occurred during WebAuthn verification.";
      
      // Map common errors to clear and friendly security warnings
      if (err.name === 'SecurityError' || (err.message && (err.message.includes('publickey-credentials-get') || err.message.includes('publickey-credentials-create') || err.message.includes('Permissions Policy') || err.message.includes('feature is not enabled')))) {
        friendlyError = "Iframe Sandbox Restriction: Your browser blocks biometric scans in previews. Click 'Open in New Tab' in the top right to register/use real passkeys, or click the emerald 'Sandbox Bypass' button below to simulate it inside this sandbox!";
      } else if (err.name === 'NotAllowedError') {
        friendlyError = "Biometric scan canceled by the user, or hardware timeout occurred.";
      } else if (err.name === 'NotSupportedError') {
        friendlyError = "Your browser or hardware does not support WebAuthn / Passkeys.";
      } else if (err.name === 'InvalidStateError') {
        friendlyError = "This device is already registered under your candidate profile.";
      }

      setScanState('failed');
      setErrorMessage(friendlyError);
      setStatusMessage("WebAuthn cryptographic validation failed.");
      triggerHaptic([40, 40]);

      // Log failure event to database for audit trail
      await apiLogBiometricAttempt({
        userId,
        email,
        biometricType: 'passkey',
        status: 'failed',
        message: `WebAuthn ${mode} failure: ${err.name} - ${err.message}`
      });

      await fetchSecurityLogs();
    }
  };

  const runSimulation = async () => {
    try {
      setErrorMessage(null);
      setScanState('scanning');
      setStatusMessage("Simulating secure biometric handshake...");
      triggerHaptic(30);

      const isRegistration = mode === 'register';

      if (isRegistration) {
        setStatusMessage("Contacting sandbox secure enclave...");
        const verifyRes = await fetch('/api/auth/verify-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email, isSimulation: true })
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.verified) {
          throw new Error(verifyData.error || "Simulation failed.");
        }

        setScanState('success');
        setStatusMessage("Simulated Passkey registered securely!");
        triggerHaptic(100);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setStatusMessage("Generating secure cryptographic signature...");
        const verifyRes = await fetch('/api/auth/authenticate-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email, isSimulation: true })
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.verified) {
          throw new Error(verifyData.error || "Simulation failed.");
        }

        setScanState('success');
        setStatusMessage("Identity verified via simulated biometric passkey!");
        triggerHaptic(100);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

      await fetchSecurityLogs();
    } catch (err: any) {
      console.error("Simulation error:", err);
      setScanState('failed');
      setErrorMessage(err.message || "Failed to execute biometric simulation.");
    }
  };

  // Automatically trigger WebAuthn on modal opening
  useEffect(() => {
    if (isOpen) {
      fetchSecurityLogs();
      const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
      setIsSandbox(isInsideIframe);

      if (isInsideIframe) {
        setScanState('idle');
        setStatusMessage("Iframe sandbox preview detected. Secure WebAuthn requires a top-level context (click 'Open in New Tab' above) or a simulated handshake.");
      } else {
        runWebAuthn();
      }
    } else {
      setScanState('idle');
      setErrorMessage(null);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      {/* Container Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-5"
      >
        {/* Left Side: Native Authentication Loader */}
        <div className="md:col-span-3 p-6 flex flex-col justify-between items-center min-h-[420px] text-center border-b md:border-b-0 md:border-r border-white/5">
          {/* Header */}
          <div className="w-full flex justify-between items-center pb-4 border-b border-white/5">
            <div className="text-left">
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                FIDO2 PASSKEY
              </span>
              <h3 className="text-sm font-black text-white mt-1.5 uppercase tracking-wide">{title}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
            </div>
            <button 
              onClick={handleDismiss}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Central Security Enclave Ring & State */}
          <div className="py-8 flex flex-col items-center justify-center space-y-6 flex-1 w-full">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Outer Pulsing Glow */}
              <AnimatePresence>
                {scanState === 'scanning' && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-indigo-500/20 filter blur-xl"
                  />
                )}
              </AnimatePresence>

              {/* Rotating Status Ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  className="stroke-slate-800"
                  strokeWidth="4"
                  fill="transparent"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke={
                    scanState === 'success' ? '#10b981' :
                    scanState === 'failed' ? '#f43f5e' : '#6366f1'
                  }
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="364"
                  animate={{
                    strokeDashoffset: scanState === 'scanning' ? [364, 180, 50] : 0,
                  }}
                  transition={{
                    duration: 3,
                    repeat: scanState === 'scanning' ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
              </svg>

              {/* Icon Holder */}
              <div className="w-24 h-24 rounded-full bg-slate-950/95 border border-white/10 flex items-center justify-center shadow-inner">
                {scanState === 'scanning' && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-indigo-400"
                  >
                    <Fingerprint size={42} className="animate-pulse" />
                  </motion.div>
                )}
                {scanState === 'success' && (
                  <motion.div
                    initial={{ scale: 0.5, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-emerald-400"
                  >
                    <Check size={42} strokeWidth={3} />
                  </motion.div>
                )}
                {scanState === 'failed' && (
                  <motion.div
                    initial={{ scale: 0.5, y: -5 }}
                    animate={{ scale: 1, y: 0 }}
                    className="text-rose-400"
                  >
                    <AlertTriangle size={42} />
                  </motion.div>
                )}
                {scanState === 'idle' && (
                  <div className="text-slate-500 flex flex-col items-center">
                    <Lock size={38} className={isSandbox ? "text-indigo-400 animate-pulse" : ""} />
                  </div>
                )}
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-1.5 max-w-sm px-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wide text-white">
                {scanState === 'scanning' && "Native OS Biometric Active"}
                {scanState === 'success' && "Verification Complete"}
                {scanState === 'failed' && "Enclave Handshake Blocked"}
                {scanState === 'idle' && "Standby Mode"}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                {statusMessage}
              </p>
            </div>

            {/* Cryptographic Error Panel */}
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xs p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[9px] font-mono leading-normal text-center"
              >
                {errorMessage}
              </motion.div>
            )}
          </div>

          {/* Action Footer */}
          <div className="w-full border-t border-white/5 pt-4 flex flex-col gap-2.5">
            <div className="flex gap-3 w-full">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Cancel Handshake
              </button>
              {(scanState === 'failed' || (isSandbox && scanState === 'idle')) && (
                <button
                  onClick={runWebAuthn}
                  className="flex-1 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-500/20"
                >
                  <RefreshCw size={11} /> {scanState === 'failed' ? "Retry WebAuthn" : "Try Real WebAuthn"}
                </button>
              )}
            </div>
            {(scanState === 'failed' || (isSandbox && scanState === 'idle')) && (
              <button
                onClick={runSimulation}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 animate-pulse"
              >
                <Cpu size={11} /> Sandbox Bypass: Simulate Passkey
              </button>
            )}
          </div>
        </div>

        {/* Right Side: High-Fidelity Security Ledger (Audit Logs) */}
        <div className="md:col-span-2 p-6 bg-slate-950/40 flex flex-col justify-between max-h-[460px] overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-orange-500" />
                <span>Enclave Security Audit Ledger</span>
              </h4>
              <button
                onClick={fetchSecurityLogs}
                disabled={isRefreshingLogs}
                className="p-1 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
                title="Refresh ledger"
              >
                <RefreshCw size={11} className={isRefreshingLogs ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Scrollable Logs */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {securityLogs.length === 0 ? (
                <div className="py-8 text-center text-[9px] text-slate-500 uppercase tracking-wider font-mono border border-dashed border-white/5 rounded-xl">
                  No enclave records discovered.
                </div>
              ) : (
                securityLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-2.5 border rounded-xl bg-slate-900/40 flex flex-col gap-1 text-[9px] font-mono leading-relaxed ${
                      log.status === 'success' ? 'border-emerald-500/20' : 'border-rose-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-black uppercase tracking-wide ${log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ● {log.status}
                      </span>
                      <span className="text-[8px] text-slate-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300">{log.message}</p>
                    <div className="pt-1.5 border-t border-white/5 text-[7px] text-slate-500 flex justify-between">
                      <span className="truncate max-w-[120px]" title={log.user_agent}>
                        UA: {log.user_agent.split(' ')[0] || 'Browser'}
                      </span>
                      <span>{new Date(log.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-3 mt-4 flex justify-between items-center text-[8px] text-slate-500 uppercase tracking-widest font-mono">
            <span className="flex items-center gap-1">
              <Cpu size={10} className="text-indigo-400" /> SYSTEM ACTIVE
            </span>
            <span>LEDGER SECURED</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
