import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowLeft, Eye, EyeOff, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface AdminAuthGateProps {
  onAuthSuccess: (admin: { email: string; fullName: string }) => void;
  onBackToPortal: () => void;
  theme?: string;
  language?: string;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onAuthSuccess,
  onBackToPortal,
  theme = 'light',
  language = 'en',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg("Please enter the admin secret key.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Login via secure backend endpoint using password
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@dstech.com', password }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg("Admin secret verified. Initializing secure workspace...");
        setTimeout(() => {
          onAuthSuccess({ email: data.email, fullName: data.fullName || 'Administrator' });
        }, 1200);
        return;
      }

      const errData = await res.json().catch(() => ({ error: 'Invalid admin secret key.' }));
      throw new Error(errData.error || 'Incorrect admin secret key.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      {/* Premium dark mode ambient backdrop glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#000E32]/30 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Decorative tech grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 relative z-10 animate-fade-in text-center">
        
        {/* BRANDING HEADER */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Logo size="md" variant="light" showText={true} />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-wide uppercase font-serif">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-400">
              Enter your secure credentials to coordinate enterprise nodes
            </p>
          </div>
        </div>

        {/* FEEDBACK NOTIFICATIONS */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-950/30 border border-red-900/50 text-red-300 p-3 rounded-2xl text-xs flex items-start gap-2.5 text-left"
            >
              <ShieldAlert size={15} className="shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 p-3 rounded-2xl text-xs flex items-start gap-2.5 text-left"
            >
              <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
              Admin Secret Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin secret key..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/20 transition-all font-mono"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold uppercase tracking-widest text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-orange-950/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Decrypting...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-amber-200" />
                  <span>Authorized Dashboard Access</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onBackToPortal}
              className="w-full px-5 py-3 border border-slate-800/80 hover:bg-slate-900/60 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              disabled={loading}
            >
              <ArrowLeft size={13} />
              <span>Back to Portal</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
