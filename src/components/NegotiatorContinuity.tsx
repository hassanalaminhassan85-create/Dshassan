import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, ShieldCheck, RefreshCw, Sparkles, Smartphone, Landmark, QrCode } from 'lucide-react';

export const NegotiatorContinuity: React.FC = () => {
  const [salary, setSalary] = useState<number>(120); // In thousands USD
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [equity, setEquity] = useState<number>(0.1); // Equity percentage
  
  const [negotiationStatus, setNegotiationStatus] = useState<'idle' | 'analyzing' | 'accepted' | 'countered'>('idle');
  const [responseMsg, setResponseMsg] = useState<string>("State your desired compensation and terms. The Autonomous Negotiator Agent will verify boundaries instantly.");
  const [compactHash, setCompactHash] = useState<string>('');

  // Device Continuity variables
  const [continuityActive, setContinuityActive] = useState<boolean>(false);
  const [continuityStatus, setContinuityStatus] = useState<string>("Mobile standby. Scan to bind wearable and mobile sensors.");

  // Trigger device haptics
  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleNegotiate = () => {
    setNegotiationStatus('analyzing');
    setResponseMsg("Consulting recruitment cost models and predicting long-term ROI metrics...");
    triggerHaptic([30, 60, 30]);

    setTimeout(() => {
      // Logic for autonomous response
      if (salary <= 145) {
        setNegotiationStatus('accepted');
        setResponseMsg(`Terms verified successfully! Automated recruiting contract parameters match. A compensation of $${salary},000/yr with ${equity}% equity is fully approved.`);
        const hash = Array.from({ length: 40 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('').toUpperCase();
        setCompactHash(`AGREE-SEAL-0X${hash.substring(0, 16)}`);
        triggerHaptic(120);
      } else {
        setNegotiationStatus('countered');
        setResponseMsg(`Your requested compensation of $${salary},000 exceeds our standard budget metrics for this level. Our Autonomous Counter-proposal is $145,000/yr with ${Math.min(0.2, equity + 0.05)}% equity. Do you accept this counter-offer?`);
        triggerHaptic([40, 20]);
      }
    }, 2000);
  };

  const handleAcceptCounter = () => {
    setSalary(145);
    setEquity(prev => Math.min(0.2, prev + 0.05));
    setNegotiationStatus('accepted');
    setResponseMsg("Counter-offer terms accepted! Compact seal generated securely.");
    const hash = Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
    setCompactHash(`AGREE-SEAL-0X${hash.substring(0, 16)}`);
    triggerHaptic(100);
  };

  // Start simulated Desktop-to-Mobile continuity sync
  const handleContinuitySync = () => {
    setContinuityActive(true);
    setContinuityStatus("Bridging channels... Initializing wearable haptic triggers...");
    triggerHaptic([100, 50, 100]);

    setTimeout(() => {
      setContinuityStatus("UNIVERSAL CONTINUITY SYNCED! Zero-latency desktop-to-mobile bridge fully active. Milestones will trigger physical device vibrations.");
      triggerHaptic(200);
    }, 2500);
  };

  const handleTestHapticBridge = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // Fun milestone pattern: buzz-silent-buzz-silent-buzz-buzz
      navigator.vibrate([100, 50, 100, 50, 200, 50, 200]);
    }
    alert("Haptic Bridge signal sent! Your mobile device should now buzz in sync with this desktop milestone event.");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      
      {/* LEFT: Autonomous Negotiator */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 bg-orange-500/10 border-b border-l border-orange-500/20 text-[9px] font-black text-orange-400 px-3 py-1 rounded-bl-2xl uppercase">
          AI Salary Arbitrage
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3.5">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
              <Coins size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Autonomous Compensation Negotiator</h3>
              <p className="text-[9px] text-slate-400 font-medium">Real-time contract valuation & arbitrage</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Sliders and radio options */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Annual Base Salary</span>
                <span className="text-white font-mono font-black">${salary},000 USD</span>
              </div>
              <input
                type="range"
                min="80"
                max="220"
                step="5"
                value={salary}
                disabled={negotiationStatus === 'analyzing' || negotiationStatus === 'accepted'}
                onChange={e => setSalary(Number(e.target.value))}
                className="w-full accent-orange-500 bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Equity Stock Share Option</span>
                <span className="text-white font-mono font-black">{equity}% Options</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={equity}
                disabled={negotiationStatus === 'analyzing' || negotiationStatus === 'accepted'}
                onChange={e => setEquity(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Operational Work Mode</span>
              <div className="grid grid-cols-3 gap-2">
                {['remote', 'hybrid', 'onsite'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    disabled={negotiationStatus === 'analyzing' || negotiationStatus === 'accepted'}
                    onClick={() => setWorkMode(mode as any)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      workMode === mode 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                        : 'bg-black/35 border-white/5 hover:border-white/10 text-slate-400'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Response Text box */}
            <div className="bg-black/45 p-3 rounded-xl border border-white/5 text-[10px] leading-relaxed text-slate-300">
              <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Agent Feedback</span>
              "{responseMsg}"
            </div>
          </div>
        </div>

        {/* Buttons and outputs */}
        <div className="pt-5 border-t border-white/5 mt-5">
          <AnimatePresence mode="wait">
            {negotiationStatus === 'idle' && (
              <button
                type="button"
                onClick={handleNegotiate}
                className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-indigo-600 hover:shadow-xl text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Submit Terms To AI Agent
              </button>
            )}

            {negotiationStatus === 'analyzing' && (
              <div className="py-2 flex items-center justify-center gap-2 text-indigo-400 text-[10px] font-bold uppercase">
                <RefreshCw className="animate-spin" size={13} /> Arbitrating range parameters...
              </div>
            )}

            {negotiationStatus === 'countered' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAcceptCounter}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Accept Counter-Offer
                </button>
                <button
                  type="button"
                  onClick={() => setNegotiationStatus('idle')}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Reject
                </button>
              </div>
            )}

            {negotiationStatus === 'accepted' && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck size={14} /> Compact Seal Locked
                </div>
                <div className="font-mono text-[9px] text-emerald-300 bg-black/60 py-1.5 px-2 rounded-lg border border-white/5 overflow-hidden select-all break-words">
                  {compactHash}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* RIGHT: Universal Continuity Bridge & Haptic Sync */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 bg-indigo-500/10 border-b border-l border-indigo-500/20 text-[9px] font-black text-indigo-400 px-3 py-1 rounded-bl-2xl uppercase">
          Universal Bridge
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Smartphone size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Universal Device Continuity Bridge</h3>
              <p className="text-[9px] text-slate-400 font-medium">Synced desktop, mobile & wearable sensor networks</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!continuityActive ? (
              <motion.div
                key="continuity-idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center p-4 space-y-4"
              >
                <div className="relative p-2.5 bg-white rounded-2xl border border-white/10 shadow-xl">
                  <QrCode size={100} className="text-slate-950" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Scan Continuity QR Code</h4>
                  <p className="text-[9.5px] text-slate-400 leading-normal max-w-xs">
                    Link your smartphone's native vibration and tactile sensors instantly to establish the real-time recruitment haptic bridge.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleContinuitySync}
                  className="py-2 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Activate Haptic Bridge Link
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="continuity-active"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-black/35 rounded-2xl p-5 border border-white/5 space-y-4 text-center"
              >
                <Smartphone className="text-indigo-400 mx-auto animate-bounce" size={40} />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Cross-Device Haptic Sync Bound</h4>
                  <p className="text-[9.5px] text-indigo-300 leading-normal font-medium bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
                    {continuityStatus}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTestHapticBridge}
                    className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-indigo-600 hover:shadow-lg text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Test Live Haptic Burst
                  </button>
                  <button
                    type="button"
                    onClick={() => setContinuityActive(false)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-4 border-t border-white/5 text-center text-[9px] text-slate-500 font-bold uppercase mt-5">
          Continuity Layer v1.0.9 • Multi-factor Haptic Seal
        </div>

      </div>

    </div>
  );
};
