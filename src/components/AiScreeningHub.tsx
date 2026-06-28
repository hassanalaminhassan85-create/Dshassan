import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, VideoOff, RefreshCw, Volume2, Sparkles, AlertCircle, Play, Square, Activity, CheckCircle, ShieldCheck } from 'lucide-react';

interface ScreeningMetric {
  name: string;
  value: number; // 0 to 100
  color: string;
}

const INTERVIEW_QUESTIONS = [
  "Explain your direct experience with distributed edge computing architectures and database replication in Cloudflare D1 nodes.",
  "How do you design secure WebAuthn authentication pipelines that fallback gracefully in constrained iframe runtime environments?",
  "Describe a scenario where you leveraged Gemini Multimodal models to automate complex, high-consequence candidate credential checks.",
  "What is your strategy for ensuring data compliance and ledger immutability when dealing with decentralized candidate passports?"
];

export const AiScreeningHub: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [screeningStatus, setScreeningStatus] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [metrics, setMetrics] = useState<ScreeningMetric[]>([
    { name: 'Vocal Sentiment', value: 72, color: 'bg-indigo-500' },
    { name: 'Technical Competency', value: 81, color: 'bg-emerald-500' },
    { name: 'Confidence Vector', value: 68, color: 'bg-orange-500' },
    { name: 'Pacing Consistency', value: 75, color: 'bg-purple-500' }
  ]);
  const [logText, setLogText] = useState<string>("Ready to initiate 2027 Multimodal Screening Node.");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Trigger device haptics
  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Handle camera start/stop
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera hardware access skipped or unavailable:", err);
      setCameraError("Camera permission blocked or hardware in use. Activating spatial hologram projection simulation.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Simulate real-time fluctuating telemetry when recording
  useEffect(() => {
    if (screeningStatus !== 'recording') return;

    const interval = setInterval(() => {
      // Fluctuate values gently
      setMetrics(prev => prev.map(m => {
        const variance = Math.floor(Math.random() * 9) - 4; // -4 to +4
        const newValue = Math.max(30, Math.min(100, m.value + variance));
        return { ...m, value: newValue };
      }));

      // Random status logs
      const logs = [
        "Analyzing voice frequency coefficients...",
        "Evaluating micro-expressions...",
        "Validating semantic response vectors...",
        "Cross-referencing D1 skills database...",
        "Vibe match score stabilizing...",
      ];
      setLogText(logs[Math.floor(Math.random() * logs.length)]);
    }, 1500);

    return () => clearInterval(interval);
  }, [screeningStatus]);

  const handleStartScreening = async () => {
    triggerHaptic([30, 50, 30]);
    setIsPlaying(true);
    setScreeningStatus('recording');
    setLogText("Multimodal connection active. Real-time stream running.");
    await startCamera();
  };

  const handleStopScreening = () => {
    triggerHaptic(50);
    setScreeningStatus('processing');
    setLogText("Compiling sentiment streams and generating competency seals...");
    stopCamera();

    setTimeout(() => {
      setScreeningStatus('done');
      setLogText("Screening verified! Competency report pushed securely to the Admin Recruiting Ledger.");
      triggerHaptic([40, 20, 40]);
    }, 3000);
  };

  const handleResetScreening = () => {
    setIsPlaying(false);
    setScreeningStatus('idle');
    setCurrentQuestionIdx(0);
    setLogText("Ready to initiate 2027 Multimodal Screening Node.");
    setMetrics([
      { name: 'Vocal Sentiment', value: 72, color: 'bg-indigo-500' },
      { name: 'Technical Competency', value: 81, color: 'bg-emerald-500' },
      { name: 'Confidence Vector', value: 68, color: 'bg-orange-500' },
      { name: 'Pacing Consistency', value: 75, color: 'bg-purple-500' }
    ]);
    stopCamera();
    triggerHaptic(10);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < INTERVIEW_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      triggerHaptic(20);
      setLogText("Evaluating context for Question 0" + (currentQuestionIdx + 2) + "...");
    } else {
      handleStopScreening();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full bg-slate-950/80 border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col lg:flex-row gap-6">
      
      {/* Immersive Video Feed Side */}
      <div className="flex-1 space-y-4">
        <div className="relative aspect-video bg-black/80 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
          
          {/* Laser scanners and scanning indicators */}
          {screeningStatus === 'recording' && (
            <div className="absolute inset-x-0 h-0.5 bg-indigo-500 shadow-lg shadow-indigo-500/50 animate-bounce z-20 pointer-events-none" />
          )}

          {cameraStream ? (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
            />
          ) : (
            /* Hologram Simulation when real camera is inactive */
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4 relative overflow-hidden bg-gradient-to-b from-indigo-950/10 via-black to-slate-950/40">
              
              {/* Spinning grid indicators */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
              
              <div className="relative w-24 h-24 flex items-center justify-center">
                {screeningStatus === 'recording' ? (
                  <>
                    <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping" />
                    <div className="absolute inset-2 rounded-full border border-indigo-500/40 animate-spin-slow" />
                    <Activity className="text-indigo-400 animate-pulse" size={40} />
                  </>
                ) : (
                  <VideoOff className="text-slate-600" size={44} />
                )}
              </div>
              
              <div className="space-y-1 z-10 max-w-sm">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {screeningStatus === 'recording' ? "Multimodal Streaming Link Active" : "Multimodal Feed Terminated"}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {cameraError || "Camera feed will render inside this cryptographically sealed sandboxed environment upon initialization."}
                </p>
              </div>
            </div>
          )}

          {/* Screening watermark tags */}
          <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-black/60 border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-mono text-indigo-400 z-10">
            <span className={`w-1.5 h-1.5 rounded-full ${screeningStatus === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span>STREAM_INGRESS_092</span>
          </div>

          <div className="absolute bottom-3 right-4 bg-black/60 border border-white/10 px-2.5 py-1 rounded-lg text-[8px] font-mono text-slate-400 z-10">
            SECURE SHA3-512 TUNNEL
          </div>
        </div>

        {/* Question and Controller Board */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-wider text-orange-400">
              Interactive AI Interview screening
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              QUESTION {currentQuestionIdx + 1} OF {INTERVIEW_QUESTIONS.length}
            </span>
          </div>

          <p className="text-[12px] font-black text-white leading-relaxed bg-black/45 p-4 rounded-xl border border-white/5 text-left">
            "{INTERVIEW_QUESTIONS[currentQuestionIdx]}"
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {screeningStatus === 'idle' && (
              <button
                type="button"
                onClick={handleStartScreening}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play size={13} /> Begin Screening
              </button>
            )}

            {screeningStatus === 'recording' && (
              <>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} /> Skip / Next Question
                </button>
                <button
                  type="button"
                  onClick={handleStopScreening}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Square size={13} /> End
                </button>
              </>
            )}

            {(screeningStatus === 'processing' || screeningStatus === 'done') && (
              <button
                type="button"
                onClick={handleResetScreening}
                className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 border border-white/5 text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Reset Screening Terminal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Competency Telemetry Panel */}
      <div className="w-full lg:w-80 bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-5">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Activity size={14} className="text-indigo-400" />
              Multimodal Metrics
            </h3>
            <p className="text-[9px] text-slate-400 font-medium">Real-time Gemini response telemetries</p>
          </div>

          <div className="space-y-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <span>{metric.name}</span>
                  <span className="text-white font-mono">{metric.value}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ type: "spring", stiffness: 60 }}
                    className={`h-full ${metric.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Animated waveform representing visual voice capture */}
          {screeningStatus === 'recording' && (
            <div className="space-y-1.5 bg-black/45 p-3.5 rounded-xl border border-white/5">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider block">Live Microphone Capture Stream</span>
              <div className="flex items-end justify-center gap-1 h-8 pt-1">
                {[...Array(12)].map((_, idx) => (
                  <motion.div 
                    key={idx}
                    animate={{ height: [4, Math.random() * 24 + 4, 4] }}
                    transition={{ repeat: Infinity, duration: 0.6 + idx * 0.05, ease: "easeInOut" }}
                    className="w-1.5 bg-indigo-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Final Certificate Stamp */}
          {screeningStatus === 'done' && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-center space-y-2 relative"
            >
              <div className="absolute top-2 right-2 text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded">
                VERIFIED
              </div>
              <ShieldCheck className="text-emerald-400 mx-auto" size={24} />
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider">AI Seal Generated</h4>
                <p className="text-[9.5px] text-emerald-400/80 font-medium">Competency assessment securely hashed & synced.</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Live system logging console */}
        <div className="pt-4 border-t border-white/5 mt-5">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">System Terminal Console</span>
          <div className="bg-black/85 border border-white/5 font-mono text-[9px] text-indigo-400 p-2.5 rounded-lg leading-normal break-words">
            &gt; {logText}
          </div>
        </div>

      </div>
    </div>
  );
};
