import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, WifiOff, Wifi, Sparkles, X, ShieldCheck } from 'lucide-react';

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(true);
      setTimeout(() => setShowOfflineBanner(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <>
      {/* PWA Install Banner */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-96 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-orange-500/30 text-white rounded-3xl shadow-2xl p-5 z-[9999] overflow-hidden"
          >
            {/* Background glowing gradients */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                <Sparkles size={22} className="text-white animate-spin-slow" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                    <ShieldCheck size={12} /> DS Tech Official PWA
                  </span>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <h4 className="text-sm font-extrabold text-white mb-1">
                  Install DS Tech App
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Install our Progressive Web App for lightning-fast offline access, instant notifications, and immersive desktop experience.
                </p>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInstallClick}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} /> Install PWA Now
                  </motion.button>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online / Offline Status Toast */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-2xl shadow-xl backdrop-blur-xl border flex items-center gap-2 text-xs font-bold ${
              isOnline
                ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-900/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi size={14} className="text-emerald-400 animate-pulse" />
                <span>Back Online! Synchronizing offline data...</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-rose-400 animate-bounce" />
                <span>Offline Mode Active. Cached PWA operational.</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
