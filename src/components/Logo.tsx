import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'dark',
}) => {
  const sizeMap = {
    xs: { icon: 32, text: 'text-[9px]' },
    sm: { icon: 54, text: 'text-[10px] min-[375px]:text-[11.5px] min-[440px]:text-[13px] sm:text-[14.5px]' },
    md: { icon: 68, text: 'text-[12px] min-[375px]:text-base sm:text-lg md:text-xl' },
    lg: { icon: 88, text: 'text-[14px] min-[375px]:text-lg sm:text-xl lg:text-2xl' },
  };

  const currentSize = sizeMap[size];
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#000E32] dark:text-white';
  const subTextColor = isLight ? 'text-orange-400' : 'text-orange-600';

  // Interactive container variants with high animation (spring bounce + hover float)
  const containerVariants = {
    initial: { scale: 0.85, opacity: 0, y: -10 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 14
      }
    },
    hover: {
      scale: 1.06,
      y: -3,
      transition: { type: "spring", stiffness: 400, damping: 15 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`flex items-center gap-2 select-none cursor-pointer ${className}`}
    >
      {/* Custom Vector representation of the official DS Tech circular logo */}
      <motion.svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 overflow-visible drop-shadow-lg"
      >
        <defs>
          {/* Rich glossy metallic gradients */}
          <radialGradient id="blueGlossyGradient" cx="50%" cy="40%" r="50%" fx="50%" fy="30%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="60%" stopColor="#0B3C9B" />
            <stop offset="100%" stopColor="#000E32" />
          </radialGradient>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="silverGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Shield (Glossy Royal Blue) with slow ambient pulse */}
        <motion.circle 
          cx="50" 
          cy="50" 
          r="47" 
          fill="url(#blueGlossyGradient)" 
          stroke="url(#silverGradient)" 
          strokeWidth="2.5" 
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          style={{ originX: "50px", originY: "50px" }}
        />

        {/* Outer Highlight Ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="44" 
          stroke="#FFFFFF" 
          strokeWidth="0.5" 
          strokeDasharray="2 2"
          opacity="0.5" 
        />

        {/* Stylized Diamond Crown at the Top (Faceted) - Floating and Glowing */}
        <motion.g 
          id="diamond-crown" 
          className="opacity-95"
          animate={{ 
            y: [0, -3, 0],
            scale: [1, 1.06, 1],
            filter: [
              "drop-shadow(0 1px 1px rgba(234, 88, 12, 0.4))",
              "drop-shadow(0 2px 5px rgba(251, 191, 36, 0.8))",
              "drop-shadow(0 1px 1px rgba(234, 88, 12, 0.4))"
            ]
          }}
          transition={{ 
            duration: 2.8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ originX: "50px", originY: "14px" }}
        >
          {/* Diamond Outer Shape */}
          <path 
            d="M 50 8 L 59 13.5 L 50 19 L 41 13.5 Z" 
            fill="#FFFFFF" 
            stroke="#EA580C" 
            strokeWidth="0.75" 
            strokeLinejoin="round" 
          />
          {/* Facet lines */}
          <path d="M 41 13.5 L 59 13.5" stroke="#EA580C" strokeWidth="0.75" />
          <path d="M 50 8 L 50 19" stroke="#EA580C" strokeWidth="0.5" />
          <path d="M 45 11 L 50 13.5 L 55 11" stroke="#EA580C" strokeWidth="0.5" fill="none" />
          <path d="M 45 11 L 41 13.5" stroke="#EA580C" strokeWidth="0.5" />
          <path d="M 55 11 L 59 13.5" stroke="#EA580C" strokeWidth="0.5" />
          <path d="M 45 16 L 50 13.5 L 55 16" stroke="#EA580C" strokeWidth="0.5" fill="none" />
        </motion.g>

        {/* Orange Accent Arcs (Left & Right) with opposite continuous rotation and thickness pulse */}
        <motion.path 
          d="M 23 28 A 29 29 0 0 0 23 72" 
          stroke="url(#orangeGradient)" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          fill="none" 
          animate={{ 
            rotate: [0, 360],
            strokeWidth: [3, 4.2, 3]
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 16, ease: "linear" },
            strokeWidth: { repeat: Infinity, duration: 3, ease: "easeInOut" }
          }}
          style={{ originX: "50px", originY: "50px" }}
        />
        <motion.path 
          d="M 77 28 A 29 29 0 0 1 77 72" 
          stroke="url(#orangeGradient)" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          fill="none" 
          animate={{ 
            rotate: [0, -360],
            strokeWidth: [3, 4.2, 3]
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 16, ease: "linear" },
            strokeWidth: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1.5 }
          }}
          style={{ originX: "50px", originY: "50px" }}
        />

        {/* Thin Silver/White Accent Rings inside - Dual spinning dashed cyber lines */}
        <motion.circle 
          cx="50" 
          cy="50" 
          r="38" 
          stroke="#FFFFFF" 
          strokeWidth="0.75" 
          strokeDasharray="4 6"
          fill="none" 
          opacity="0.3" 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
          style={{ originX: "50px", originY: "50px" }}
        />
        <motion.circle 
          cx="50" 
          cy="50" 
          r="34" 
          stroke="#FFFFFF" 
          strokeWidth="0.5" 
          strokeDasharray="6 4"
          fill="none" 
          opacity="0.2" 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          style={{ originX: "50px", originY: "50px" }}
        />

        {/* Main "DS" Text (Centered, Bold, Modern display) - Ambient Pulse */}
        <motion.g 
          id="ds-brand-text"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{ originX: "50px", originY: "47px" }}
        >
          <text 
            x="50" 
            y="47" 
            fontFamily="'Space Grotesk', 'Inter', sans-serif" 
            fontWeight="900" 
            fontSize="26" 
            fill="#FFFFFF" 
            textAnchor="middle" 
            letterSpacing="-1"
            className="select-none tracking-tighter"
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.4))"
          >
            DS
          </text>
        </motion.g>

        {/* Inner Official Text Block - Gentle Breathing animation */}
        <motion.g 
          id="agency-name-badge"
          animate={{ y: [0, -0.5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          {/* "TECH AND DIGITAL" subtext */}
          <text 
            x="50" 
            y="57" 
            fontFamily="'Inter', sans-serif" 
            fontWeight="900" 
            fontSize="4.2" 
            fill="#FFFFFF" 
            textAnchor="middle" 
            letterSpacing="0.6"
            className="select-none"
          >
            TECH AND DIGITAL
          </text>
          
          {/* "MARKETING AGENCY LTD" subtext in Gold/Orange */}
          <text 
            x="50" 
            y="63" 
            fontFamily="'Inter', sans-serif" 
            fontWeight="900" 
            fontSize="4.2" 
            fill="url(#goldGradient)" 
            textAnchor="middle" 
            letterSpacing="0.4"
            className="select-none"
          >
            MARKETING AGENCY LTD
          </text>
        </motion.g>

        {/* Slogan Badge Lines (At bottom inside the badge) */}
        <g id="excellence-slogan">
          {/* Divider Line */}
          <line x1="32" y1="68" x2="68" y2="68" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />

          {/* Slogan texts */}
          <text 
            x="50" 
            y="73" 
            fontFamily="'Inter', sans-serif" 
            fontWeight="500" 
            fontSize="2.8" 
            fill="#CBD5E1" 
            textAnchor="middle" 
            letterSpacing="0.2"
            className="select-none"
          >
            EMPOWERING BRANDS WITH
          </text>
          <text 
            x="50" 
            y="77" 
            fontFamily="'Inter', sans-serif" 
            fontWeight="800" 
            fontSize="3.1" 
            fill="#FFFFFF" 
            textAnchor="middle" 
            letterSpacing="0.2"
            className="select-none"
          >
            TECH &amp; DIGITAL EXCELLENCE
          </text>
        </g>
      </motion.svg>

      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="flex flex-col text-left justify-center leading-none min-w-0 max-w-full overflow-hidden"
        >
          <div className="flex flex-col gap-0.5">
            <span className={`font-black tracking-tight uppercase ${
              size === 'sm' ? 'text-xs min-[360px]:text-sm sm:text-[15px]' :
              size === 'md' ? 'text-sm sm:text-base md:text-lg' :
              'text-lg sm:text-xl lg:text-[22px]'
            } ${textColor} leading-none font-serif tracking-wide`}>
              DS TECH
            </span>
            <span className={`font-extrabold tracking-widest uppercase ${
              size === 'sm' ? 'text-[7px] min-[360px]:text-[8px] sm:text-[9.5px]' :
              size === 'md' ? 'text-[8.5px] sm:text-[10px] md:text-[11px]' :
              'text-[10px] sm:text-[11.5px] lg:text-[13px]'
            } ${subTextColor} leading-none tracking-widest font-sans`}>
              &amp; Digital Marketing Agency
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
