import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Shield, FileText, Download, Fingerprint, RefreshCw, CheckCircle, ShieldAlert, Cpu, Award } from 'lucide-react';

interface SecurityLedgerVaultProps {
  currentUser?: { id: string; email: string; fullName: string } | null;
  targetRole?: string;
  biometricLinked?: boolean;
}

export const SecurityLedgerVault: React.FC<SecurityLedgerVaultProps> = ({ 
  currentUser, 
  targetRole = "Full-Stack Engineer", 
  biometricLinked = false 
}) => {
  const [zkpStatus, setZkpStatus] = useState<'idle' | 'hashing' | 'verified'>('idle');
  const [zkpHash, setZkpHash] = useState<string>('');
  const [credentialName, setCredentialName] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Trigger device haptics
  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Generate simulated Zero Knowledge Cryptographic proof
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processMockFile = (name: string) => {
    setZkpStatus('hashing');
    setCredentialName(name);
    triggerHaptic([30, 40]);

    setTimeout(() => {
      // Simulate cryptographic hash generation
      const hash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('').toUpperCase();
      setZkpHash(`SHA256-${hash.substring(0, 32)}...`);
      setZkpStatus('verified');
      triggerHaptic(100);
    }, 2500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processMockFile(e.dataTransfer.files[0].name);
    }
  };

  const handleSelectMockCertificate = (certType: string) => {
    processMockFile(`${certType}_Verified_Diploma.pdf`);
  };

  // Generate & Download the portable JSON Career Ledger Passport
  const handleDownloadPassport = () => {
    if (!currentUser) return;
    setIsDownloading(true);
    triggerHaptic([50, 20, 50]);

    setTimeout(() => {
      const ledgerData = {
        title: "DS Tech Digital Passport (2027 v1.0.3)",
        issuer: "DS Tech and Digital Marketing Agency Limited",
        compliance: "EIDAS WebAuthn Multi-Factor Security Protocol",
        timestamp: new Date().toISOString(),
        candidate: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          email: currentUser.email,
          role: targetRole,
          biometricState: biometricLinked ? "BOUND_HARDWARE_KEY_ACTIVE" : "HIGH_SECURITY_VISUAL_SIGN_FALLBACK"
        },
        cryptographicLedger: [
          { index: 1, type: "Onboarding Node Registration", status: "VERIFIED", D1_Transaction_Hash: "0X9A4E2C5B8F7D" },
          { index: 2, type: "WebAuthn Key Challenge", status: biometricLinked ? "VERIFIED_ACTIVE" : "SKIPPED_VISUAL_FALLBACK", D1_Transaction_Hash: "0X3D4F5E6A7B8C" },
          { index: 3, type: "ZKP Credentials Proof", status: zkpStatus === 'verified' ? "BOUND_LEDGER" : "PENDING_INPUT", credential_file: credentialName || "NULL", proof_hash: zkpHash || "NULL" },
          { index: 4, type: "Multimodal Screening Matrix", status: "SECURED_D1", D1_Transaction_Hash: "0XF1E2D3C4B5A6" }
        ],
        e_signing_authority: {
          status: "CONTRACT_READY",
          valid_for_offer: "DS_TECH_2027_EXTRAORDINARY_SCHEME",
          cryptographic_standard: "CRYSTALS-KYBER Post-Quantum Multi-factor Certificate"
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ledgerData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `DSTech_Digital_Passport_${currentUser.fullName.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setIsDownloading(false);
      triggerHaptic(30);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      
      {/* LEFT: Post-Quantum Biometric Vault & Zero-Knowledge Credential Proof */}
      <div className="space-y-6">
        
        {/* Post-Quantum Vault Info */}
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500/10 border-b border-l border-indigo-500/20 text-[9px] font-black text-indigo-400 px-3 py-1 rounded-bl-2xl uppercase">
            CRYSTAL-KYBER ENCLAVE
          </div>

          <div className="flex items-center gap-3 border-b border-white/10 pb-3.5 mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Post-Quantum Cryptography Enclave</h3>
              <p className="text-[9px] text-slate-400 font-medium">Advanced lattice-based cryptographic algorithms</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="bg-black/35 p-3 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-slate-500 font-bold block">ALGORITHM</span>
                <span className="text-white font-black font-mono">Kyber-1024</span>
              </div>
              <div className="bg-black/35 p-3 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-slate-500 font-bold block">SIGNING TYPE</span>
                <span className="text-indigo-400 font-black font-mono">Dilithium-5</span>
              </div>
            </div>

            <div className="bg-black/25 rounded-xl p-3 border border-white/5 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <Fingerprint size={16} className={biometricLinked ? "text-emerald-400" : "text-orange-400"} />
                <span className="text-slate-300 font-medium">WebAuthn Hardware Lock</span>
              </div>
              <span className={`font-black uppercase text-[8px] px-2 py-0.5 rounded border ${
                biometricLinked 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
              }`}>
                {biometricLinked ? "BOUND & SHIELDED" : "UNLINKED"}
              </span>
            </div>

            <p className="text-[9.5px] text-slate-400 leading-normal font-medium">
              Sensitive candidate credentials (bank details, national passport data) are securely encrypted locally inside your device enclave before syncing.
            </p>
          </div>
        </div>

        {/* Zero-Knowledge Credential Proof */}
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-[9px] font-black text-emerald-400 px-3 py-1 rounded-bl-2xl uppercase">
            ZKP Validation Node
          </div>

          <div className="flex items-center gap-3 border-b border-white/10 pb-3.5 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Zero-Knowledge Credentials Proof</h3>
              <p className="text-[9px] text-slate-400 font-medium">Verify credentials without storing files</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {zkpStatus === 'idle' && (
              <motion.div
                key="zkp-idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-white/15 bg-black/35 hover:bg-black/50 transition-all rounded-2xl p-6 text-center space-y-3 cursor-pointer group"
              >
                <FileText size={28} className="mx-auto text-slate-500 group-hover:text-indigo-400 transition-colors" />
                <div className="space-y-1">
                  <p className="text-white font-extrabold text-[11px]">Drag and Drop professional certificates here</p>
                  <p className="text-[9.5px] text-slate-400">PDF, PNG or JSON files supported for zero-knowledge hashing</p>
                </div>
                
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/5" />
                  <span className="flex-shrink mx-3 text-[8px] font-bold text-slate-500 uppercase">Or select demo templates</span>
                  <div className="flex-grow border-t border-white/5" />
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSelectMockCertificate('BS_Computer_Science'); }}
                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-bold text-slate-300 transition-all"
                  >
                    B.Sc. Computer Sci
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSelectMockCertificate('AWS_Architect_Cert'); }}
                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-bold text-slate-300 transition-all"
                  >
                    AWS Cloud Architect
                  </button>
                </div>
              </motion.div>
            )}

            {zkpStatus === 'hashing' && (
              <motion.div
                key="zkp-hashing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-black/40 border border-white/5 rounded-2xl p-8 text-center space-y-4"
              >
                <RefreshCw className="animate-spin text-indigo-400 mx-auto" size={28} />
                <div className="space-y-1">
                  <p className="text-white font-extrabold text-[11px]">Computing SHA3-512 Matrix Hashing Proofs...</p>
                  <p className="text-[9px] font-mono text-indigo-300 break-all bg-black/60 p-2 border border-white/5 rounded-lg">
                    {credentialName}
                  </p>
                </div>
              </motion.div>
            )}

            {zkpStatus === 'verified' && (
              <motion.div
                key="zkp-verified"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-3 relative"
              >
                <Award className="text-emerald-400 mx-auto" size={32} />
                <div className="space-y-1">
                  <h4 className="text-white font-extrabold text-[11px] uppercase tracking-wider">ZKP Ledger Proof Bound</h4>
                  <p className="text-[9.5px] text-emerald-300 leading-normal font-medium">
                    Cryptographic signature successfully built and synced into your passport ledger! No local storage records left.
                  </p>
                </div>
                <div className="bg-black/55 p-2 rounded-lg border border-white/5 font-mono text-[9px] text-indigo-400 break-all select-all">
                  {zkpHash}
                </div>
                <button
                  type="button"
                  onClick={() => setZkpStatus('idle')}
                  className="text-[9px] font-bold text-slate-400 hover:text-white underline transition-colors"
                >
                  Verify Another Certificate
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT: DS Tech Digital Passport (Tamper-Proof Ledger Card) */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-xl pointer-events-none" />
        
        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3.5">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">DS Tech Digital Passport</h3>
              <p className="text-[9px] text-slate-400 font-medium">Cryptographically signed carrier ledger passport</p>
            </div>
          </div>

          {/* Virtual Portrait/Badge and Info card */}
          <div className="bg-black/35 rounded-2xl p-4 border border-white/5 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-indigo-500/5 to-transparent" />
            
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-indigo-600 flex items-center justify-center text-white text-base font-extrabold shadow-md shadow-indigo-500/10 shrink-0">
                {currentUser?.fullName.substring(0, 2).toUpperCase() || "DS"}
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-black text-white">{currentUser?.fullName || "Candidate Passport"}</h4>
                <p className="text-[10px] text-indigo-300 font-mono">{currentUser?.email || "candidate@dstech.com"}</p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">{targetRole}</p>
              </div>
            </div>

            {/* Passport credential indicators */}
            <div className="grid grid-cols-2 gap-2 text-[9px] text-left">
              <div className="bg-slate-900/60 border border-white/5 p-2 rounded-lg">
                <span className="text-slate-500 block uppercase font-black text-[7.5px]">Passport Hash</span>
                <span className="text-white font-bold font-mono">#DST-2027-{currentUser?.id.substring(4).toUpperCase() || "DEMO"}</span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-2 rounded-lg">
                <span className="text-slate-500 block uppercase font-black text-[7.5px]">Biometric Seal</span>
                <span className={`font-bold uppercase ${biometricLinked ? "text-emerald-400" : "text-slate-400"}`}>
                  {biometricLinked ? "ACTIVE" : "VISUAL FALLBACK"}
                </span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-2 rounded-lg col-span-2">
                <span className="text-slate-500 block uppercase font-black text-[7.5px]">ZKP Education Proof</span>
                <span className={`font-bold ${zkpStatus === 'verified' ? "text-emerald-400 font-mono" : "text-slate-400"}`}>
                  {zkpStatus === 'verified' ? zkpHash : "No bound proof credentials"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal font-medium">
            This passport is a tamper-proof career ledger that compiles all your verified milestones. Fully compatible with decentralized verification hubs.
          </p>
        </div>

        <div className="pt-5 border-t border-white/5 flex gap-3 mt-6">
          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDownloadPassport}
            className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-indigo-600 hover:shadow-xl hover:shadow-indigo-500/15 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <RefreshCw size={13} className="animate-spin" /> Compiling...
              </>
            ) : (
              <>
                <Download size={13} /> Download Portable Career Ledger
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
