import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Sparkles, Bot, X, MessageSquare, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';

export interface PageContext {
  route: string;
  pageTitle: string;
  section?: string;
  programmeOrCourse?: string;
  pricing?: string;
  userRole?: string;
  userData?: any;
  workflowState?: string;
  additionalInfo?: string;
}

interface FloatingAiLauncherProps {
  onClick: () => void;
  isModalOpen: boolean;
  pageContext?: PageContext;
}

export const FloatingAiLauncher: React.FC<FloatingAiLauncherProps> = ({
  onClick,
  isModalOpen,
  pageContext
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initial position offset state loaded from sessionStorage if available
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = sessionStorage.getItem('dstech_ai_launcher_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      // fallback
    }
    return { x: 0, y: 0 };
  });

  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Bounds constraint for viewport
  const [dragConstraints, setDragConstraints] = useState<{ top: number; left: number; right: number; bottom: number }>({
    top: -600,
    left: -1200,
    right: 0,
    bottom: 0
  });

  useEffect(() => {
    const updateConstraints = () => {
      if (typeof window === 'undefined') return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // The default position is fixed bottom-6 right-6 (24px padding + ~56px size)
      // So max movement left is -(vw - 80), max movement up is -(vh - 80)
      setDragConstraints({
        top: -(vh - 90),
        left: -(vw - 90),
        right: 10,
        bottom: 10
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setHasMoved(false);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    const newPos = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    };
    setPosition(newPos);
    try {
      sessionStorage.setItem('dstech_ai_launcher_pos', JSON.stringify(newPos));
    } catch (e) {}

    // Check if movement distance was significant enough to count as a drag
    const dist = Math.hypot(info.offset.x, info.offset.y);
    if (dist > 6) {
      setHasMoved(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMoved) {
      setHasMoved(false);
      return;
    }
    onClick();
  };

  // Safe page title for floating badge context
  const displayContext = pageContext?.programmeOrCourse 
    || pageContext?.pageTitle 
    || 'DS TECH AI Workspace';

  return (
    <>
      {/* Invisible container covering full viewport to constrain dragging accurately */}
      <div 
        ref={constraintsRef} 
        className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" 
        style={{ pointerEvents: 'none' }}
      />

      <div 
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 select-none touch-none"
        style={{ touchAction: 'none' }}
      >
        {/* Contextual Floating Tooltip on Hover or Initial Hint */}
        <AnimatePresence>
          {isHovered && !isModalOpen && !isDragging && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-950/95 dark:bg-slate-900/95 text-white border border-slate-800/80 shadow-2xl backdrop-blur-xl pointer-events-none text-xs font-medium"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                  DS TECH AI Copilot
                  <Sparkles className="w-3 h-3 text-orange-400 inline" />
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                  {displayContext}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Draggable Circular Floating Button */}
        <motion.div
          drag
          dragControls={dragControls}
          dragConstraints={constraintsRef}
          dragElastic={0.08}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onPointerDown={handlePointerDown}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.92 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={isModalOpen ? "Close AI Assistant" : "Open DS TECH AI Assistant"}
          title={isModalOpen ? "Close AI Workspace" : `Open DS TECH AI Assistant (${displayContext})`}
          className={`relative group cursor-grab active:cursor-grabbing flex items-center justify-center transition-all duration-300 ${
            isModalOpen
              ? 'w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-950 text-white border border-orange-500/60 shadow-2xl shadow-orange-500/20'
              : 'w-14 h-14 rounded-full bg-slate-950/95 dark:bg-slate-900/95 text-white border border-orange-500/50 hover:border-orange-400 shadow-xl shadow-slate-950/50 hover:shadow-2xl hover:shadow-orange-500/30'
          }`}
        >
          {/* Subtle Ambient Idle Breathing Aura Glow */}
          {!isModalOpen && (
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-500/25 via-indigo-500/20 to-blue-500/25 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />
          )}

          {/* Glossy Inner Border Ring */}
          <div className="absolute inset-0.5 rounded-full border border-white/10 pointer-events-none" />

          {/* Button Icon Content */}
          <AnimatePresence mode="wait">
            {isModalOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center text-slate-200 group-hover:text-white"
              >
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center justify-center"
              >
                {/* Custom Branding Emblem: Logo size xs + glowing status dot */}
                <div className="relative flex items-center justify-center">
                  <Logo size="xs" showText={false} variant="light" className="scale-90" />
                  
                  {/* Active AI Status Indicator Dot */}
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950" />
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};
