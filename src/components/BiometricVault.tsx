import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, Fingerprint, Lock, Eye, EyeOff, CheckCircle2, Award, FileText, Zap, RefreshCw, KeyRound, Check } from 'lucide-react';
import { PhoneBiometricPrompt } from './PhoneBiometricPrompt';

interface SensitiveDocument {
  id: string;
  title: string;
  type: string;
  hash: string;
  rawUrl: string;
  status: 'verified' | 'unverified';
}

export const BiometricVault: React.FC<{ application?: any }> = ({ application }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showZkSuccess, setShowZkSuccess] = useState<boolean>(false);
  const [isZkVerifying, setIsZkVerifying] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPinInput, setShowPinInput] = useState<boolean>(false);

  // Sensitive documents to show once unlocked
  const docs: SensitiveDocument[] = [
    { id: 'doc-1', title: 'National Identity Number (NIN) slip', type: 'Identity Slip', hash: 'SHA256: 4f98ba76e2...', rawUrl: application?.personalInfo?.passportPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&fit=crop&q=80', status: 'verified' },
    { id: 'doc-2', title: 'Degree Certificate - B.Sc. Information Technology', type: 'Educational Degree', hash: 'SHA256: b3a792ef8c...', rawUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&fit=crop&q=80', status: 'verified' },
    { id: 'doc-3', title: 'Biometric Encrypted Digital Signature Signature Block', type: 'E-Contract Agreement', hash: 'SHA256: 9ef3a1b4d0...', rawUrl: application?.appointmentSignature || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=150&fit=crop&q=80', status: 'verified' }
  ];

  const handleBiometricAuth = () => {
    setVerificationError(null);
    setIsBiometricPromptOpen(true);
  };

  const handleBiometricSuccess = () => {
    setIsBiometricPromptOpen(false);
    setIsAuthenticated(true);
  };

  const handleZkVerify = () => {
    setIsZkVerifying(true);
    setTimeout(() => {
      setIsZkVerifying(false);
      setShowZkSuccess(true);
    }, 2000);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '2026') {
      setIsAuthenticated(true);
      setShowPinInput(false);
      setVerificationError(null);
    } else {
      setVerificationError('Invalid passcode. Please try again (Demo Passcode: 2026).');
    }
  };

  return (
    <div className="relative rounded-3xl p-6 border border-white/20 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white shadow-2xl overflow-hidden text-left">
      {/* Laser visual decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 w-80 h-80 bg-orange-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-white/10 pb-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-2">
            <Lock size={10} /> Biometric core signature
          </div>
          <h3 className="text-base font-black flex items-center gap-2">
            <Shield className="text-orange-500" size={18} />
            Secure Biometric Vault
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">
            Requires real-time fingerprint or face scan verification for each session access request.
          </p>
        </div>
        
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <EyeOff size={11} className="text-slate-400" /> Lock Vault
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="locked-vault"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center py-8 text-center space-y-5"
          >
            {isScanning ? (
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Visual scan lines */}
                <motion.div
                  animate={{ y: [0, 80, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-4 right-4 h-0.5 bg-orange-500 shadow-lg shadow-orange-500/60 z-10"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/30"
                />
                <Fingerprint size={52} className="text-orange-500 animate-pulse" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                <Lock size={28} />
              </div>
            )}

            <div className="space-y-1 max-w-sm">
              <h4 className="font-extrabold text-sm">{isScanning ? "Contacting Biometric Scanner..." : "Vault Access Restricted"}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Please scan your registered fingerprint / FaceID or use your secure backup passcode to decrypt these candidate credentials.
              </p>
            </div>

            {verificationError && (
              <p className="text-[10px] text-rose-400 font-extrabold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
                {verificationError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isScanning}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-xl hover:shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Fingerprint size={14} /> Scan with FaceID / Fingerprint
              </button>
              
              <button
                type="button"
                onClick={() => setShowPinInput(!showPinInput)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Use Passcode
              </button>
            </div>

            {showPinInput && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handlePinSubmit}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 max-w-xs w-full"
              >
                <input
                  type="password"
                  placeholder="Enter passcode (Demo: 2026)"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xs px-3 py-1.5 text-orange-200 placeholder:text-slate-500 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                >
                  Verify
                </button>
              </motion.form>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="unlocked-vault"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Decrypted sensitive documents grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <div 
                  key={doc.id} 
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-all relative group"
                >
                  <div className="absolute top-4 right-4 bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <CheckCircle2 size={9} /> Decrypted
                  </div>

                  <div className="space-y-2">
                    <div className="p-2 bg-indigo-500/10 rounded-xl w-fit text-indigo-400">
                      <FileText size={15} />
                    </div>
                    <h4 className="text-xs font-black leading-snug text-white group-hover:text-orange-400 transition-colors">{doc.title}</h4>
                    <p className="text-[9px] font-mono text-slate-400 leading-none">{doc.hash}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold">{doc.type}</span>
                    <button
                      type="button"
                      onClick={() => alert("Decrypting original attachment securely... decrypted and matched successfully inside preview.")}
                      className="text-orange-400 hover:text-orange-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={10} /> View Document
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Zero-Knowledge Proof Educational Validation Box */}
            <div className="border border-white/15 rounded-3xl p-5 bg-black/45 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
                    <Zap size={14} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider">Zero-Knowledge Proof (ZKP) Education Validator</h4>
                    <p className="text-[8px] text-slate-400 font-medium">Verify credentials authenticity on-chain without exposing private identifiers.</p>
                  </div>
                </div>

                {!showZkSuccess && (
                  <button
                    type="button"
                    onClick={handleZkVerify}
                    disabled={isZkVerifying}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isZkVerifying ? (
                      <>
                        <RefreshCw size={10} className="animate-spin" /> Verifying Proof...
                      </>
                    ) : (
                      <>
                        <KeyRound size={10} /> Run Cryptographic Proof
                      </>
                    )}
                  </button>
                )}
              </div>

              {showZkSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3.5 text-emerald-400 animate-fade-in text-xs font-semibold">
                  <CheckCircle2 size={20} className="stroke-[2.5] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-white font-extrabold text-xs">ZK-Proof Verified Successfully!</p>
                    <p className="text-[10px] text-emerald-400/90 leading-relaxed font-medium">
                      Educational verification hash matches the authority records at the Ministry of Education. Original academic certification is validated without retaining personal sensitive metadata.
                    </p>
                    <div className="pt-1.5 flex items-center gap-3 font-mono text-[8.5px] text-emerald-500">
                      <span>Proving Key: 0x9a4f...31bc</span>
                      <span>•</span>
                      <span>Verification Key: 0x82ed...884d</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] font-mono text-slate-400">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Anchor Node</span>
                    <span className="text-slate-300 font-bold">University of Abuja Node</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">State Hash Target</span>
                    <span className="text-indigo-300">0x7bf628a19de3b...89cf</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Proof System</span>
                    <span className="text-slate-300">zk-SNARK Groth16</span>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <PhoneBiometricPrompt
        isOpen={isBiometricPromptOpen}
        onSuccess={handleBiometricSuccess}
        onCancel={() => setIsBiometricPromptOpen(false)}
        title="Biometric Document Decryption"
        subtitle="Verify fingerprint or Face ID to unlock sensitive credentials and contracts"
      />
    </div>
  );
};
