import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, Zap, Award, BookOpen } from 'lucide-react';

interface ConstellationNode {
  id: string;
  label: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  z: number; // -50 to 50 (spatial simulation)
  category: 'core' | 'advanced' | 'future';
  desc: string;
  skills: string[];
}

const CONST_NODES: ConstellationNode[] = [
  {
    id: 'node-1',
    label: 'D1 Cloud-Native SQL',
    x: 25, y: 30, z: -10,
    category: 'core',
    desc: 'Ultra-fast edge relational storage managing application telemetry and secure user preferences.',
    skills: ['SQLite', 'Cloudflare D1', 'Schema Scaling']
  },
  {
    id: 'node-2',
    label: 'Post-Quantum Vault',
    x: 45, y: 20, z: 20,
    category: 'advanced',
    desc: 'Kyber-1024 hardware-locked cryptographic key enclaves for high-trust application seals.',
    skills: ['Crystals-Kyber', 'Dilithium-5', 'WebAuthn API']
  },
  {
    id: 'node-3',
    label: 'Multimodal Screening Hub',
    x: 75, y: 40, z: -25,
    category: 'advanced',
    desc: 'Real-time video/voice emotion and accuracy analytics utilizing camera streams and audio waveform models.',
    skills: ['Gemini 1.5 Pro', 'MediaStream', 'Confidence Analysis']
  },
  {
    id: 'node-4',
    label: 'Zero-Knowledge Ledger',
    x: 60, y: 70, z: 15,
    category: 'future',
    desc: 'Educational credential verification without document uploads or sensitive database logging.',
    skills: ['ZKP Framework', 'SHA3-512 Hash', 'Verified Passport']
  },
  {
    id: 'node-5',
    label: 'Autonomous Negotiator',
    x: 35, y: 80, z: -5,
    category: 'future',
    desc: 'AI negotiation framework mapping benefits, salary ranges, and remote-hybrid status models.',
    skills: ['Game Theory AI', 'Contract Seals', 'Interactive Counter-offer']
  },
  {
    id: 'node-6',
    label: 'Universal Continuity Bridge',
    x: 15, y: 60, z: 30,
    category: 'core',
    desc: 'Cross-device haptic notification sync matching mobile phone vibrations to milestone dashboard events.',
    skills: ['Navigator Vibrate', 'SSE Streams', 'QR Match Bridge']
  }
];

export const CareerConstellation: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(CONST_NODES[0]);
  const [rotationX, setRotationX] = useState<number>(0);
  const [rotationY, setRotationY] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Simulated continuous gentle rotation when not dragging
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setRotationY(prev => (prev + 0.15) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setRotationY(prev => prev + dx * 0.4);
    setRotationX(prev => Math.max(-45, Math.min(45, prev - dy * 0.4)));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const triggerNodeHaptic = (node: ConstellationNode) => {
    setSelectedNode(node);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col md:flex-row gap-6">
      {/* Visual background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none" />
      
      {/* 3D Simulation Canvas area */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 min-h-[300px] h-[340px] bg-black/60 border border-white/5 rounded-2xl relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
          <Compass size={11} className="animate-spin-slow" />
          <span>Spatial Constellation (WebXR Mode)</span>
        </div>

        <div className="absolute top-3 right-4 text-[8px] font-mono text-slate-500">
          DRAG TO ROTATE NEXUS GRID
        </div>

        {/* Outer orbital rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
          <div className="w-56 h-56 rounded-full border border-dashed border-indigo-500 animate-spin-slow" />
          <div className="absolute w-80 h-80 rounded-full border border-indigo-400 animate-reverse-spin" />
        </div>

        {/* Interactive nodes */}
        <div className="absolute inset-0 flex items-center justify-center">
          {CONST_NODES.map((node) => {
            // Apply 3D coordinate mapping based on rotation X/Y
            const radX = (rotationX * Math.PI) / 180;
            const radY = ((rotationY + (node.x * 3.6)) * Math.PI) / 180;

            // Simple 3D projection formulas
            const cosX = Math.cos(radX);
            const sinX = Math.sin(radX);
            const cosY = Math.cos(radY);
            const sinY = Math.sin(radY);

            // Coordinates after rotation
            const rotX = node.x - 50;
            const rotY = node.y - 50;
            const rotZ = node.z;

            const projX = rotX * cosY - rotZ * sinY;
            const tempY = rotX * sinY + rotZ * cosY;
            const projY = rotY * cosX - tempY * sinX;
            const depth = rotY * sinX + tempY * cosX;

            // Perspective scale factor
            const scale = 1 + depth / 150;
            const posX = 50 + projX * scale;
            const posY = 50 + projY * scale;

            // Hide nodes if they are rotated too far back
            const isBehind = depth < -80;

            return (
              <motion.button
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerNodeHaptic(node);
                }}
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  zIndex: Math.round(100 + depth),
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  opacity: isBehind ? 0.3 : 1
                }}
                className={`absolute p-2 rounded-full flex flex-col items-center group transition-colors duration-300`}
                type="button"
              >
                {/* Node Ring and Pulse */}
                <div className={`relative w-4 h-4 rounded-full flex items-center justify-center ${
                  selectedNode?.id === node.id 
                    ? 'bg-orange-500 ring-4 ring-orange-500/30' 
                    : node.category === 'core' 
                    ? 'bg-indigo-500 ring-2 ring-indigo-500/20' 
                    : node.category === 'advanced'
                    ? 'bg-purple-500 ring-2 ring-purple-500/20'
                    : 'bg-emerald-500 ring-2 ring-emerald-500/20'
                }`}>
                  {selectedNode?.id === node.id && (
                    <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-60" />
                  )}
                </div>

                {/* Node label */}
                <span className={`mt-2 text-[9px] font-black tracking-wide bg-slate-950/90 border px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md ${
                  selectedNode?.id === node.id 
                    ? 'text-orange-400 border-orange-500/50' 
                    : 'text-slate-300 border-white/5 group-hover:text-white group-hover:border-indigo-500/30'
                }`}>
                  {node.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details side panel */}
      <div className="w-full md:w-80 bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full filter blur-xl pointer-events-none" />
        
        {selectedNode ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                selectedNode.category === 'core' 
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                  : selectedNode.category === 'advanced'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {selectedNode.category} module
              </span>
              <h3 className="text-base font-black text-white pt-1">{selectedNode.label}</h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              {selectedNode.desc}
            </p>

            <div className="space-y-2">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Associated Ledger Signatures</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.skills.map((skill, idx) => (
                  <span key={idx} className="bg-white/5 border border-white/5 text-[9px] font-mono font-bold text-indigo-300 px-2 py-0.5 rounded-md">
                    #{skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
            <BookOpen size={24} className="text-slate-600 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-wider">Select a constellation node to analyze parameters</p>
          </div>
        )}

        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase mt-4">
          <span>Active Hub Alignment</span>
          <span className="text-emerald-400 flex items-center gap-1 font-mono">
            <Zap size={10} className="text-emerald-400" /> SYNCED (2027)
          </span>
        </div>
      </div>
    </div>
  );
};
