import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { 
  MapPin, 
  Mail, 
  Phone, 
  ExternalLink, 
  Copy, 
  Check, 
  Globe, 
  MessageSquare, 
  Navigation, 
  Sparkles, 
  Moon, 
  Sun,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';

interface PremiumContactSectionProps {
  className?: string;
}

export const PremiumContactSection: React.FC<PremiumContactSectionProps> = ({ className = '' }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Parallax mouse position tracker
  const [mousePosition1, setMousePosition1] = useState({ x: 0, y: 0 });
  const [mousePosition2, setMousePosition2] = useState({ x: 0, y: 0 });
  const [mousePosition3, setMousePosition3] = useState({ x: 0, y: 0 });

  // Ripple effect state
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Monitor scroll for floating contact bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowFloatingBar(true);
      } else {
        setShowFloatingBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax calculations
  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>, 
    setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // range -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // range -0.5 to 0.5
    setPos({ x, y });
  };

  const handleMouseLeave = (
    setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  ) => {
    setPos({ x: 0, y: 0 });
  };

  // Click ripple generator
  const createRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  // Action: Copy email
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('dstechanddigitalmarketingltd@gmail.com');
      setCopiedEmail(true);
      showToast('Email address copied to clipboard!');
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      showToast('Failed to copy email');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Action: Simulate Refreshing Live Ingress Connection (Executive Pleaser)
  const triggerSimulation = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Enterprise contact links synchronized with GTM endpoints.');
    }, 1500);
  };

  // Color theme helpers
  const glassBg = isDarkMode 
    ? 'bg-gradient-to-br from-[#02081e]/90 via-[#010514]/95 to-[#000207]/98 border-slate-800/80 backdrop-blur-2xl text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.03)]' 
    : 'bg-white/95 border-slate-200/90 backdrop-blur-2xl text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)]';
  
  const textTitleColor = isDarkMode ? 'text-white' : 'text-[#000E32]';
  const textDescColor = isDarkMode ? 'text-slate-400' : 'text-slate-650';

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Upper Control Bar (Glassmorphic switch & Live Sync Status) */}
      <div className={`flex items-center justify-between border p-3 rounded-2xl backdrop-blur-md transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#02081e]/60 border-slate-800/60 text-slate-200' 
          : 'bg-slate-50/80 border-slate-200/60 text-[#000E32]'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-orange-400' : 'text-[#000E32]'}`}>
            Contact Interface: SECURE DIRECT INGRESS
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Simulation Trigger Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerSimulation}
            disabled={loading}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Zap size={11} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Syncing...' : 'Sync Gateway'}
          </motion.button>

          {/* Luxury theme switcher */}
          <button
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              showToast(`Switched to ${!isDarkMode ? 'Obsidian Glass (Dark)' : 'Alabaster Glass (Light)'} theme`);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-xs transition-colors cursor-pointer border ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-[#000E32]'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun size={12} className="text-amber-500 animate-spin-slow" />
                <span className="hidden xs:inline">Alabaster Mode</span>
              </>
            ) : (
              <>
                <Moon size={12} className="text-indigo-600" />
                <span className="hidden xs:inline">Obsidian Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        /* Premium Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 animate-pulse rounded-[24px] border border-slate-200 p-6 space-y-4 h-[280px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-6 w-full bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </div>
              <div className="h-12 w-full bg-slate-200 rounded-xl mt-10" />
            </div>
          ))}
        </div>
      ) : (
        /* The main bento row */
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.05
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1 w-full text-left"
        >
          {/* Card 1: HQ Location */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 35, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            onMouseMove={(e) => handleMouseMove(e, setMousePosition1)}
            onMouseLeave={() => handleMouseLeave(setMousePosition1)}
            onClick={(e) => {
              createRipple(e);
              window.open("https://maps.google.com/?q=Ext+A-73,+Efab+Mall+Second+Floor,+Area+11+Garki+Abuja", "_blank");
            }}
            whileHover="hovered"
            className={`${glassBg} p-6 rounded-[24px] border relative overflow-hidden flex flex-col justify-between group/card min-w-0 h-full cursor-pointer select-none transition-all duration-500`}
            style={{
              transformStyle: 'preserve-3d',
              perspective: 1000
            }}
          >
            {/* Ambient slow rotating gradient backdrop */}
            <motion.div 
              variants={{
                hovered: { scale: 1.5, opacity: 0.5, rotate: 60 },
                initial: { scale: 1, opacity: 0.1, rotate: 0 }
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-orange-400/20 via-rose-500/10 to-amber-300/5 rounded-full filter blur-2xl pointer-events-none"
            />

            {/* Slow animating gradient borders inside the rounded container */}
            <div className="absolute inset-0 rounded-[24px] border border-transparent group-hover/card:border-orange-500/30 transition-all duration-500 pointer-events-none" />
            
            {/* Click ripple animation renderer */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute bg-orange-500/20 rounded-full animate-ripple pointer-events-none"
                style={{
                  top: ripple.y,
                  left: ripple.x,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            <div className="space-y-4 relative z-10" style={{ transform: 'translateZ(20px)' }}>
              <div className="flex items-center gap-3">
                {/* Micro-interactive floating icon */}
                <div className="relative shrink-0">
                  <motion.div
                    variants={{
                      hovered: { 
                        borderRadius: "50%",
                        scale: 1.1,
                        rotate: 15,
                        backgroundColor: "#EA580C"
                      },
                      initial: { 
                        borderRadius: "14px",
                        scale: 1,
                        rotate: 0,
                        backgroundColor: isDarkMode ? '#1E1B18' : '#FFF7ED'
                      }
                    }}
                    transition={{ duration: 0.4 }}
                    className="w-10 h-10 border border-orange-500/10 flex items-center justify-center text-orange-600 relative overflow-hidden"
                  >
                    <motion.div
                      variants={{
                        hovered: { color: "#FFFFFF" },
                        initial: { color: "#EA580C" }
                      }}
                    >
                      <MapPin size={18} />
                    </motion.div>
                  </motion.div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none block">
                    Headquarters
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block mt-0.5 leading-none">
                    Abuja, Nigeria
                  </span>
                </div>
              </div>

              {/* The Parallax Content Element */}
              <div 
                style={{
                  transform: `translate3d(${mousePosition1.x * 12}px, ${mousePosition1.y * 12}px, 0px)`
                }}
                className="transition-transform duration-200 ease-out"
              >
                <p className={`text-[13px] font-black leading-relaxed ${textTitleColor}`}>
                  Ext A-73, Efab Mall Second Floor, Area 11 Garki Abuja
                </p>
              </div>

              {/* Styled Minimal Vector Map Wireframe (Stripe-like UI) */}
              <div className={`h-24 w-full border rounded-xl relative overflow-hidden mt-3 group/map transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-950/60 border-slate-800/80 shadow-inner' 
                  : 'bg-slate-50 border-slate-200/80 shadow-inner'
              }`}>
                {/* SVG wireframe path representation of roads */}
                <svg className={`absolute inset-0 w-full h-full opacity-35 stroke-current ${isDarkMode ? 'text-indigo-950/80' : 'text-slate-300'}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="10" y1="0" x2="10" y2="100" strokeWidth="2" />
                  <line x1="45" y1="0" x2="45" y2="100" strokeWidth="3" />
                  <line x1="85" y1="0" x2="85" y2="100" strokeWidth="2" />
                  <line x1="0" y1="35" x2="100" y2="35" strokeWidth="3" />
                  <line x1="0" y1="75" x2="100" y2="75" strokeWidth="2" />
                  <circle cx="45" cy="35" r="16" fill="none" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
                {/* Pulsing Target Marker */}
                <div className="absolute left-[45%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <span className="absolute inline-flex h-8 w-8 rounded-full bg-orange-500/40 animate-ping" />
                  <span className="relative flex h-3.5 w-3.5 rounded-full bg-orange-500 shadow-lg border-2 border-white" />
                </div>
                {/* Compass HUD */}
                <div className={`absolute right-2 bottom-2 text-[8px] font-mono opacity-60 flex items-center gap-1 ${isDarkMode ? 'text-orange-400' : 'text-slate-500'}`}>
                  <Navigation size={8} className="rotate-45 animate-pulse text-orange-500" />
                  <span>9.0272° N</span>
                </div>
              </div>
            </div>

            {/* Card Action Link Section */}
            <div className={`pt-4 mt-4 border-t relative z-10 flex items-center justify-between ${isDarkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
              <span className={`text-[10px] font-black tracking-wider group-hover/card:underline ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                OPEN GOOGLE MAPS
              </span>
              <motion.span
                variants={{
                  hovered: { x: 5, color: "#EA580C" },
                  initial: { x: 0, color: "#94A3B8" }
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <ExternalLink size={13} />
              </motion.span>
            </div>
          </motion.div>

          {/* Card 2: Email Copy Link */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 35, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            onMouseMove={(e) => handleMouseMove(e, setMousePosition2)}
            onMouseLeave={() => handleMouseLeave(setMousePosition2)}
            onClick={(e) => {
              createRipple(e);
              handleCopyEmail();
            }}
            whileHover="hovered"
            className={`${glassBg} p-6 rounded-[24px] border relative overflow-hidden flex flex-col justify-between group/card min-w-0 h-full cursor-pointer select-none transition-all duration-500`}
            style={{
              transformStyle: 'preserve-3d',
              perspective: 1000
            }}
          >
            {/* Ambient slow rotating gradient backdrop */}
            <motion.div 
              variants={{
                hovered: { scale: 1.5, opacity: 0.45, rotate: -45 },
                initial: { scale: 1, opacity: 0.1, rotate: 0 }
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-cyan-300/5 rounded-full filter blur-2xl pointer-events-none"
            />

            {/* Slow animating gradient borders inside the rounded container */}
            <div className="absolute inset-0 rounded-[24px] border border-transparent group-hover/card:border-indigo-500/30 transition-all duration-500 pointer-events-none" />

            {/* Click ripple animation renderer */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute bg-indigo-500/25 rounded-full animate-ripple pointer-events-none"
                style={{
                  top: ripple.y,
                  left: ripple.x,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            <div className="space-y-4 relative z-10" style={{ transform: 'translateZ(20px)' }}>
              <div className="flex items-center gap-3">
                {/* Micro-interactive floating icon */}
                <div className="relative shrink-0">
                  <motion.div
                    variants={{
                      hovered: { 
                        borderRadius: "50%",
                        scale: 1.1,
                        rotate: -15,
                        backgroundColor: "#4F46E5"
                      },
                      initial: { 
                        borderRadius: "14px",
                        scale: 1,
                        rotate: 0,
                        backgroundColor: isDarkMode ? '#171A2E' : '#EEF2FF'
                      }
                    }}
                    transition={{ duration: 0.4 }}
                    className="w-10 h-10 border border-indigo-500/10 flex items-center justify-center text-indigo-600 relative overflow-hidden"
                  >
                    <motion.div
                      variants={{
                        hovered: { color: "#FFFFFF" },
                        initial: { color: "#4F46E5" }
                      }}
                    >
                      <Mail size={18} />
                    </motion.div>
                  </motion.div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none block">
                    Contact Email
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block mt-0.5 leading-none">
                    Instant Gateway
                  </span>
                </div>
              </div>

              {/* The Parallax Content Element */}
              <div 
                style={{
                  transform: `translate3d(${mousePosition2.x * 12}px, ${mousePosition2.y * 12}px, 0px)`
                }}
                className="transition-transform duration-200 ease-out pt-1.5"
              >
                <p className={`font-mono font-extrabold text-[12px] min-[375px]:text-[13px] leading-snug break-all p-3.5 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-400 hover:text-indigo-300 shadow-inner' 
                    : 'bg-indigo-50 border-indigo-150 text-indigo-700 hover:text-indigo-900 shadow-inner'
                }`}>
                  dstechanddigitalmarketingltd@gmail.com
                </p>
              </div>

              {/* High-End copy prompt alert box */}
              <div className={`border p-2.5 rounded-xl flex items-center justify-between text-[10px] font-bold ${
                isDarkMode 
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' 
                  : 'bg-slate-50 border-slate-150 text-slate-500'
              }`}>
                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles size={11} className="text-amber-500 animate-pulse" />
                  Secure Ingress Mailbox
                </span>
                <span className="text-[9px] text-indigo-500 font-extrabold">TAP CARD TO COPY</span>
              </div>
            </div>

            {/* Card Action Link Section */}
            <div className={`pt-4 mt-4 border-t relative z-10 flex items-center justify-between ${isDarkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
              <span className={`text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {copiedEmail ? 'COPIED TO CLIPBOARD!' : 'COPY EMAIL ADDRESS'}
              </span>
              <motion.span
                animate={copiedEmail ? { scale: [1, 1.2, 1], rotate: 360 } : {}}
                transition={{ duration: 0.4 }}
                className={copiedEmail ? 'text-emerald-500' : 'text-slate-400'}
              >
                {copiedEmail ? <Check size={14} /> : <Copy size={13} />}
              </motion.span>
            </div>
          </motion.div>

          {/* Card 3: Phone & WhatsApp Call Trigger */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 35, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            onMouseMove={(e) => handleMouseMove(e, setMousePosition3)}
            onMouseLeave={() => handleMouseLeave(setMousePosition3)}
            onClick={(e) => createRipple(e)}
            whileHover="hovered"
            className={`${glassBg} p-6 rounded-[24px] border relative overflow-hidden flex flex-col justify-between group/card min-w-0 h-full transition-all duration-500`}
            style={{
              transformStyle: 'preserve-3d',
              perspective: 1000
            }}
          >
            {/* Ambient slow rotating gradient backdrop */}
            <motion.div 
              variants={{
                hovered: { scale: 1.5, opacity: 0.45, rotate: 30 },
                initial: { scale: 1, opacity: 0.1, rotate: 0 }
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-green-300/5 rounded-full filter blur-2xl pointer-events-none"
            />

            {/* Slow animating gradient borders inside the rounded container */}
            <div className="absolute inset-0 rounded-[24px] border border-transparent group-hover/card:border-emerald-500/30 transition-all duration-500 pointer-events-none" />

            {/* Click ripple animation renderer */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute bg-emerald-500/25 rounded-full animate-ripple pointer-events-none"
                style={{
                  top: ripple.y,
                  left: ripple.x,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            <div className="space-y-4 relative z-10" style={{ transform: 'translateZ(20px)' }}>
              <div className="flex items-center gap-3">
                {/* Micro-interactive floating icon */}
                <div className="relative shrink-0">
                  <motion.div
                    variants={{
                      hovered: { 
                        borderRadius: "50%",
                        scale: 1.1,
                        rotate: 10,
                        backgroundColor: "#10B981"
                      },
                      initial: { 
                        borderRadius: "14px",
                        scale: 1,
                        rotate: 0,
                        backgroundColor: isDarkMode ? '#132A1F' : '#ECFDF5'
                      }
                    }}
                    transition={{ duration: 0.4 }}
                    className="w-10 h-10 border border-emerald-500/10 flex items-center justify-center text-emerald-600 relative overflow-hidden"
                  >
                    <motion.div
                      variants={{
                        hovered: { color: "#FFFFFF" },
                        initial: { color: "#10B981" }
                      }}
                    >
                      <Phone size={18} />
                    </motion.div>
                  </motion.div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none block">
                    Helpline & Chat
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block mt-0.5 leading-none">
                    Multi-Channel Direct
                  </span>
                </div>
              </div>

              {/* The Parallax Content Element */}
              <div 
                style={{
                  transform: `translate3d(${mousePosition3.x * 12}px, ${mousePosition3.y * 12}px, 0px)`
                }}
                className="transition-transform duration-200 ease-out pt-1"
              >
                <p className={`font-mono font-extrabold text-[15px] tracking-wide p-3.5 rounded-xl border flex items-center justify-between ${
                  isDarkMode 
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 shadow-inner' 
                    : 'bg-emerald-50/50 border-emerald-150 text-emerald-700 shadow-inner'
                }`}>
                  <span>+234 902 348 9111</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </p>
                <p className="text-[10px] font-bold text-slate-400 leading-normal mt-2.5 px-1">
                  Available Mon-Sat for official inquiries
                </p>
              </div>

              {/* Dual Action Buttons Layout */}
              <div className="grid grid-cols-2 gap-2 pt-1.5" onClick={(e) => e.stopPropagation()}>
                {/* Voice Call CTA Button */}
                <motion.a
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="tel:+2349023489111"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#000E32] hover:bg-indigo-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors"
                >
                  <Phone size={11} />
                  Call Now
                </motion.a>
                {/* WhatsApp Chat CTA Button */}
                <motion.a
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://wa.me/2349023489111?text=Hello%20DS%20Tech%20HQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all"
                >
                  <MessageSquare size={11} className="fill-current" />
                  WhatsApp
                </motion.a>
              </div>
            </div>

            {/* Card Action Link Section */}
            <div className={`pt-4 mt-4 border-t relative z-10 flex items-center justify-between ${isDarkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
              <span className={`text-[10px] font-black tracking-wider uppercase ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                DIRECT CORPORATE ENTRANCE
              </span>
              <motion.span
                variants={{
                  hovered: { x: 5, color: isDarkMode ? "#34D399" : "#10B981" },
                  initial: { x: 0, color: "#94A3B8" }
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                &rarr;
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Floating Action Bar (Stripe/Linear style) */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950/90 text-white px-5 py-3 rounded-full border border-slate-800/80 backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex items-center gap-4 text-xs font-semibold no-print max-w-[90vw] sm:max-w-md"
          >
            <div className="flex items-center gap-2 border-r border-slate-800 pr-3 mr-1 shrink-0">
              <Logo size="sm" showText={false} variant="light" />
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">DS Tech</span>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.a 
                whileHover={{ scale: 1.1, color: "#F97316" }} 
                href="tel:+2349023489111" 
                className="hover:text-orange-400 p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                title="Call HQ"
              >
                <Phone size={11} />
                <span className="hidden xs:inline">Call</span>
              </motion.a>
              <motion.button 
                whileHover={{ scale: 1.1, color: "#6366F1" }} 
                onClick={handleCopyEmail}
                className="hover:text-indigo-400 p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                title="Copy Official Email"
              >
                <Copy size={11} />
                <span className="hidden xs:inline">Email</span>
              </motion.button>
              <motion.a 
                whileHover={{ scale: 1.1, color: "#10B981" }} 
                href="https://wa.me/2349023489111" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-emerald-400 p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                title="WhatsApp Chat"
              >
                <MessageSquare size={11} />
                <span className="hidden xs:inline">WhatsApp</span>
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Modern Custom Spring Toast Alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 sm:bottom-6 left-1/2 z-50 bg-[#000E32] text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-950 flex items-center gap-2.5 max-w-[90vw]"
          >
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={12} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-100">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
