import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Eye, Sparkles, Wifi, Radio } from 'lucide-react';
import { apiSubscribeToRealtimeSync } from '../lib/api';

interface Reviewer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  action: string;
  color: string;
}

const DEMO_REVIEWERS: Reviewer[] = [
  { id: 'rev-1', name: 'Alhaji Hassan', role: 'Chief Executive Officer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80', action: 'reviewing biometric credentials', color: 'from-orange-500 to-amber-500' },
  { id: 'rev-2', name: 'Chioma Nwachukwu', role: 'Head of Recruitment & HR', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=80', action: 'checking guarantor signatures', color: 'from-indigo-500 to-pink-500' },
  { id: 'rev-3', name: 'Tunde Oyelowo', role: 'Technical Lead Assessor', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80', action: 'running AI cognitive matching', color: 'from-blue-500 to-purple-500' },
];

export const RealTimePresence: React.FC = () => {
  const [activeReviewers, setActiveReviewers] = useState<Reviewer[]>([]);
  const [liveSessionsCount, setLiveSessionsCount] = useState<number>(3);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  useEffect(() => {
    // Staggered introduction of active reviewer avatars for futuristic multi-reviewer illusion
    const timers: NodeJS.Timeout[] = [];
    
    DEMO_REVIEWERS.forEach((rev, idx) => {
      const t = setTimeout(() => {
        setActiveReviewers(prev => {
          if (prev.some(p => p.id === rev.id)) return prev;
          return [...prev, rev];
        });
        setLiveSessionsCount(c => c + 1);
        setSyncLogs(prev => [`📡 ${rev.name} (${rev.role}) connected to system`, ...prev.slice(0, 4)]);
      }, (idx + 1) * 2000);
      timers.push(t);
    });

    // Random actions or session joins to make it look hyper-alive!
    const interval = setInterval(() => {
      const actions = [
        'downloaded generated agreement PDF',
        'verified credential hash with Zero-Knowledge Proof',
        'completed FaceID document decryption key validation',
        'issued a high-security endorsement seal',
        'reviewed live career matches list',
      ];
      const randomReviewer = DEMO_REVIEWERS[Math.floor(Math.random() * DEMO_REVIEWERS.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      setSyncLogs(prev => [
        `✨ ${randomReviewer.name} ${randomAction}`,
        ...prev.slice(0, 4)
      ]);
    }, 8000);

    // Subscribe to actual real-time broadcast via SSE
    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = apiSubscribeToRealtimeSync((event) => {
        if (event && event.type) {
          setSyncLogs(prev => [
            `⚡ [Cross-Device Sync] Event detected: ${event.type}`,
            ...prev.slice(0, 4)
          ]);
          // Haptic Feedback Trigger Simulation
          if (navigator.vibrate) {
            navigator.vibrate(20);
          }
        }
      });
    } catch (e) {
      console.warn("SSE Subscription fallback activated");
    }

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="relative rounded-3xl p-5 border border-white/20 bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden group">
      {/* Holographic glowing borders */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-60 pointer-events-none" />
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl group-hover:translate-x-12 group-hover:translate-y-12 transition-all duration-1000 pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left: Presence Header */}
        <div className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
            <Radio size={11} className="animate-pulse text-indigo-400" />
            2026 Vision presence
          </div>
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <Users size={16} className="text-orange-400" />
            Active Recruitment Board
          </h4>
          <p className="text-[10px] text-slate-300 max-w-xs font-medium">
            Multiple administrative nodes are viewing candidate profiles simultaneously.
          </p>
        </div>

        {/* Center: Active Avatar Stack */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex -space-x-3.5 overflow-hidden">
            <AnimatePresence>
              {activeReviewers.map((rev) => (
                <motion.div
                  key={rev.id}
                  initial={{ width: 0, opacity: 0, scale: 0.5 }}
                  animate={{ width: 'auto', opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="relative group/avatar"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-slate-950 overflow-hidden shadow-lg relative cursor-pointer">
                    <img src={rev.avatar} alt={rev.name} className="w-full h-full object-cover" />
                    {/* Ring indicator */}
                    <div className="absolute inset-0 ring-2 ring-indigo-400 rounded-full animate-pulse opacity-75" />
                  </div>
                  
                  {/* Glassmorphism tooltip */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl opacity-0 scale-90 group-hover/avatar:opacity-100 group-hover/avatar:scale-100 transition-all duration-300 pointer-events-none z-50 text-left">
                    <p className="text-[10.5px] font-black text-white leading-none">{rev.name}</p>
                    <p className="text-[8px] font-bold text-orange-400 uppercase tracking-wider mt-0.5">{rev.role}</p>
                    <div className="h-px bg-white/10 my-1.5" />
                    <p className="text-[8.5px] text-slate-400 italic font-medium leading-tight">Currently {rev.action}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-xs font-black text-slate-400 shadow-lg">
              +{liveSessionsCount}
            </div>
          </div>

          <div className="text-left space-y-0.5">
            <span className="text-[11px] font-extrabold text-white block">
              {activeReviewers.length + liveSessionsCount} Global Observers
            </span>
            <span className="text-[8.5px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live SSE Sync Enabled
            </span>
          </div>
        </div>

        {/* Right: Holographic System Logs Feed */}
        <div className="w-full md:w-64 bg-black/45 rounded-2xl border border-white/5 p-3 font-mono text-[9px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
            <span className="text-[8px] uppercase tracking-wider text-indigo-400 font-extrabold">Device Synchronization log</span>
            <Wifi size={10} className="text-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1 max-h-[50px] overflow-hidden text-left">
            <AnimatePresence initial={false}>
              {syncLogs.map((log, idx) => (
                <motion.div
                  key={`${log}-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="truncate text-slate-300 flex items-center gap-1"
                >
                  <span className="text-orange-400 font-black">›</span> {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
