import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, WifiOff, Wifi, ShieldCheck, X, Smartphone, 
  Laptop, CheckCircle2, Share, PlusSquare, ArrowRight, 
  Sparkles, Check, Info, Shield, RefreshCw
} from 'lucide-react';
import { Logo } from './Logo';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOfflineToast, setShowOfflineToast] = useState(!navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Detect if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };
    checkStandalone();

    // 2. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Listen for Chromium/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Auto-display bottom installation prompt after a gentle delay for new visitors
      const hasDismissed = sessionStorage.getItem('dstech_pwa_dismissed');
      if (!hasDismissed) {
        const timer = setTimeout(() => {
          setShowPromptBanner(true);
        }, 3500);
        return () => clearTimeout(timer);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowPromptBanner(false);
      setShowFullModal(false);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 6000);
      console.log('DS TECH PWA successfully installed to device!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 4. Custom global event to open PWA modal from anywhere
    const handleOpenInstall = () => {
      setShowFullModal(true);
    };
    window.addEventListener('open-pwa-install', handleOpenInstall);

    // 5. Connectivity detection
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(true);
      const timer = setTimeout(() => setShowOfflineToast(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleOpenInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If iOS or prompt not available yet, show the guided install modal
      setShowFullModal(true);
      return;
    }
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPromptBanner(false);
        setShowFullModal(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('PWA install prompt error:', err);
    }
  };

  const handleDismissBanner = () => {
    setShowPromptBanner(false);
    sessionStorage.setItem('dstech_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* 1. Floating Bottom Install Banner (With Official DS Tech Logo) */}
      <AnimatePresence>
        {showPromptBanner && !isInstalled && (
          <motion.aside
            aria-label="PWA Installation Banner"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:w-[420px] bg-slate-950/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-orange-500/30 text-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(249,115,22,0.3)] p-5 z-[9990] overflow-hidden"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-start gap-4">
              {/* Official DS Tech Circular Vector Logo */}
              <div 
                onClick={() => setShowFullModal(true)} 
                className="shrink-0 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner cursor-pointer hover:border-orange-500/50 transition-colors"
                title="View DS TECH PWA details"
              >
                <Logo size="md" showText={false} variant="light" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1 font-mono">
                    <ShieldCheck size={12} className="text-orange-400" />
                    Official PWA Application
                  </span>
                  <button
                    onClick={handleDismissBanner}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Close install banner"
                  >
                    <X size={15} />
                  </button>
                </div>

                <h4 className="text-sm font-extrabold text-white tracking-tight truncate">
                  DS TECH AND DIGITAL
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5 line-clamp-2">
                  Install the official app on your device for lightning-fast offline loading, live notifications, and native speed.
                </p>

                <div className="flex items-center gap-2 mt-3.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInstallClick}
                    className="flex-1 py-2 px-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Download size={14} className="animate-bounce" />
                    <span>Install Official App</span>
                  </motion.button>
                  
                  <button
                    onClick={() => {
                      setShowPromptBanner(false);
                      setShowFullModal(true);
                    }}
                    className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Guide
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. Comprehensive PWA Installation & Verification Modal */}
      <AnimatePresence>
        {showFullModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden my-auto"
            >
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Close Button */}
              <button
                onClick={() => setShowFullModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close PWA modal"
              >
                <X size={18} />
              </button>

              {/* Modal Header Featuring the Official Logo */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-800/80">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 shadow-lg shrink-0">
                  <Logo size="lg" showText={false} variant="light" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <ShieldCheck size={12} />
                    Verified Progressive Web App
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight truncate">
                    DS TECH AND DIGITAL
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    MARKETING AGENCY LIMITED (CAC RC: 1849204)
                  </p>
                </div>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 py-5">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                    <Wifi size={14} /> Offline First
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Access courses, certificates, and submitted applications without active internet.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold mb-1">
                    <Sparkles size={14} /> Native Speed
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Instant zero-latency launching directly from your home screen or dock.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
                    <Shield size={14} /> Security Vault
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    WebAuthn biometric signing, encrypted QR verification, and statutory trust seals.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                    <Smartphone size={14} /> Auto-Sync
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Background updates guarantee you are always on the newest official portal version.
                  </p>
                </div>
              </div>

              {/* Installation Guide Section */}
              {isInstalled ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-center space-y-2">
                  <div className="inline-flex p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-white">App is Installed & Operational!</h4>
                  <p className="text-xs text-emerald-300/80">
                    You are currently using the official installed PWA on your device with full local caching and offline capabilities.
                  </p>
                </div>
              ) : isIOS ? (
                /* iOS Safari Instructions */
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Smartphone size={14} /> iOS Safari Install Instructions
                  </div>
                  <ol className="text-xs text-slate-300 space-y-2.5">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border border-slate-700">1</span>
                      <span>Tap the <strong>Share</strong> button <Share size={13} className="inline mx-1 text-blue-400" /> in the Safari toolbar at the bottom or top of your screen.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border border-slate-700">2</span>
                      <span>Scroll down in the share menu and select <strong>"Add to Home Screen"</strong> <PlusSquare size={13} className="inline mx-1 text-slate-300" />.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border border-slate-700">3</span>
                      <span>Tap <strong>"Add"</strong> in the top right corner. The official DS TECH logo icon will appear on your Home Screen!</span>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Chromium / Android / Desktop Install Action */
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2.5 cursor-pointer transition-all"
                  >
                    <Download size={18} />
                    <span>Install DS TECH App Directly</span>
                  </motion.button>
                  <p className="text-center text-[11px] text-slate-400">
                    Compatible with Google Chrome, Microsoft Edge, Brave, Samsung Internet, and Android devices.
                  </p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Service Worker: Active
                </span>
                <span>PWA Specification: 2026 Compliant</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Online / Offline Status Banner */}
      <AnimatePresence>
        {showOfflineToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-2.5 text-xs font-bold ${
              isOnline
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi size={15} className="text-emerald-400 animate-pulse" />
                <span>Internet Connection Restored — Synced with DS Tech Cloud</span>
              </>
            ) : (
              <>
                <WifiOff size={15} className="text-rose-400 animate-bounce" />
                <span>Offline Mode Active — Using cached DS Tech PWA data</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Installation Success Toast */}
      <AnimatePresence>
        {installSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl bg-emerald-900/95 border border-emerald-500/50 text-white shadow-2xl flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>DS TECH PWA has been successfully installed on your device!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 5. In-App Install Button component that can be placed in Header or Navigation
export function PWAInstallHeaderButton() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-pwa-install'));
  };

  if (isInstalled) {
    return null;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      type="button"
      className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 via-amber-500/15 to-orange-500/10 hover:from-orange-500 hover:to-amber-500 border border-orange-500/30 hover:border-orange-500 text-orange-600 dark:text-orange-400 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer group"
      title="Install official DS TECH progressive web application"
    >
      <Download size={13} className="text-orange-500 group-hover:text-white transition-colors animate-pulse" />
      <span>Install App</span>
    </motion.button>
  );
}
