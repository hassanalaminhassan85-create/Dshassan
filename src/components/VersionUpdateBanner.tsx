import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, X, ArrowUpRight } from 'lucide-react';
import { 
  initDeploymentFreshnessMonitoring, 
  applyDeploymentUpdate, 
  DeploymentVersionInfo 
} from '../lib/versionManager';

export const VersionUpdateBanner: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<DeploymentVersionInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Listen for custom event or callback
    const handleUpdateEvent = (e: Event) => {
      const customEvent = e as CustomEvent<DeploymentVersionInfo>;
      if (customEvent.detail) {
        setUpdateInfo(customEvent.detail);
        setDismissed(false);
      }
    };

    window.addEventListener('dstech-update-available', handleUpdateEvent);

    const cleanup = initDeploymentFreshnessMonitoring((version) => {
      setUpdateInfo(version);
      setDismissed(false);
    });

    return () => {
      cleanup();
      window.removeEventListener('dstech-update-available', handleUpdateEvent);
    };
  }, []);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    await applyDeploymentUpdate(updateInfo?.buildId);
  };

  if (!updateInfo || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-lg"
      >
        <div className="bg-gradient-to-r from-slate-950/95 via-amber-950/90 to-slate-950/95 border border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  New Version Deployed
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-[10px] font-mono text-amber-300">
                  v{updateInfo.version}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                A fresh production update is ready. Click to refresh instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleApplyUpdate}
              disabled={isUpdating}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isUpdating ? 'animate-spin' : ''} />
              <span>{isUpdating ? 'Updating...' : 'Update'}</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="Dismiss update notification"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
