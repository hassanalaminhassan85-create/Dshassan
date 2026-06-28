import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Sparkles, UserCheck, ShieldAlert, Cpu } from 'lucide-react';

interface PresenceCue {
  id: string;
  message: string;
  type: 'recruiter' | 'ceo' | 'ai' | 'security';
  icon: any;
}

const NEURAL_CUES: PresenceCue[] = [
  {
    id: 'cue-1',
    message: "Lead Recruiter Chioma Nwachukwu is focusing on your React & TypeScript skills.",
    type: 'recruiter',
    icon: UserCheck
  },
  {
    id: 'cue-2',
    message: "Founder & CEO Hassan Al-Amin has opened your 3D Career Constellation node.",
    type: 'ceo',
    icon: Sparkles
  },
  {
    id: 'cue-3',
    message: "Recruiting algorithm is analyzing your Post-Quantum biometric encryption parameters.",
    type: 'security',
    icon: ShieldAlert
  },
  {
    id: 'cue-4',
    message: "Predictive Success Engine predicted a 94.8% long-term culture retention rating.",
    type: 'ai',
    icon: Cpu
  },
  {
    id: 'cue-5',
    message: "Chioma Nwachukwu (HR) has noted your Zero-Knowledge credentials certificate proof.",
    type: 'recruiter',
    icon: UserCheck
  }
];

export const NeuralPresence: React.FC = () => {
  const [activeCue, setActiveCue] = useState<PresenceCue | null>(null);

  useEffect(() => {
    // Show a neural toast 5 seconds after mount, and every 15-20 seconds thereafter
    const showRandomCue = () => {
      const randomIndex = Math.floor(Math.random() * NEURAL_CUES.length);
      setActiveCue(NEURAL_CUES[randomIndex]);

      // Play soft haptic buzz on mobile browsers
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }

      // Hide toast after 6 seconds
      setTimeout(() => {
        setActiveCue(null);
      }, 6000);
    };

    const initialTimeout = setTimeout(showRandomCue, 5000);
    const interval = setInterval(showRandomCue, 18000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {activeCue && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 100, damping: 14 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-start gap-3 text-left relative"
        >
          {/* Border glowing accent line */}
          <div className="absolute inset-0 rounded-2xl border border-indigo-500/20 pointer-events-none animate-pulse" />

          {/* Icon Area */}
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
            {React.createElement(activeCue.icon, { size: 16 })}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-wider text-indigo-400">
                Neural Presence Cue
              </span>
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <p className="text-[10.5px] text-slate-300 font-semibold leading-relaxed">
              {activeCue.message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
