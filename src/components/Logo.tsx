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
    xs: { icon: 28, title: 'text-xs', sub: 'text-[7px]' },
    sm: { icon: 42, title: 'text-sm sm:text-[15px]', sub: 'text-[8.5px] sm:text-[9.5px]' },
    md: { icon: 52, title: 'text-base sm:text-lg', sub: 'text-[10px] sm:text-[11px]' },
    lg: { icon: 68, title: 'text-lg sm:text-xl lg:text-[22px]', sub: 'text-[11.5px] sm:text-[13px]' },
  };

  const currentSize = sizeMap[size];
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-slate-900 dark:text-white';
  const subTextColor = isLight ? 'text-orange-400' : 'text-orange-600 dark:text-orange-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2.5 sm:gap-3 select-none cursor-pointer ${className}`}
    >
      {/* Custom Vector representation of the official DS Tech circular logo */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 overflow-visible drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        shapeRendering="geometricPrecision"
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
        </defs>

        {/* Outer Circular Shield (Glossy Royal Blue) */}
        <circle 
          cx="50" 
          cy="50" 
          r="47" 
          fill="url(#blueGlossyGradient)" 
          stroke="url(#silverGradient)" 
          strokeWidth="2.2" 
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

        {/* Stylized Diamond Crown at the Top */}
        <g id="diamond-crown" className="opacity-95">
          <path 
            d="M 50 8 L 59 13.5 L 50 19 L 41 13.5 Z" 
            fill="#FFFFFF" 
            stroke="#EA580C" 
            strokeWidth="0.75" 
            strokeLinejoin="round" 
          />
          <path d="M 41 13.5 L 59 13.5" stroke="#EA580C" strokeWidth="0.75" />
          <path d="M 50 8 L 50 19" stroke="#EA580C" strokeWidth="0.5" />
          <path d="M 45 11 L 50 13.5 L 55 11" stroke="#EA580C" strokeWidth="0.5" fill="none" />
          <path d="M 45 11 L 41 13.5" stroke="#EA580C" strokeWidth="0.5" />
          <path d="M 55 11 L 59 13.5" stroke="#EA580C" strokeWidth="0.5" />
          <path d="M 45 16 L 50 13.5 L 55 16" stroke="#EA580C" strokeWidth="0.5" fill="none" />
        </g>

        {/* Orange Accent Arcs (Left & Right) */}
        <g>
          <path 
            d="M 23 28 A 29 29 0 0 0 23 72" 
            stroke="url(#orangeGradient)" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            fill="none" 
          />
          <path 
            d="M 77 28 A 29 29 0 0 1 77 72" 
            stroke="url(#orangeGradient)" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            fill="none" 
          />
        </g>

        {/* Thin Silver/White Accent Rings inside */}
        <circle 
          cx="50" 
          cy="50" 
          r="38" 
          stroke="#FFFFFF" 
          strokeWidth="0.75" 
          strokeDasharray="4 6"
          fill="none" 
          opacity="0.3" 
        />
        <circle 
          cx="50" 
          cy="50" 
          r="34" 
          stroke="#FFFFFF" 
          strokeWidth="0.5" 
          strokeDasharray="6 4"
          fill="none" 
          opacity="0.2" 
        />

        {/* Main "DS" Text */}
        <text 
          x="50" 
          y="47" 
          fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif" 
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

        {/* Inner Official Text Block */}
        <g id="agency-name-badge">
          <text 
            x="50" 
            y="57" 
            fontFamily="'Inter', system-ui, sans-serif" 
            fontWeight="900" 
            fontSize="4.2" 
            fill="#FFFFFF" 
            textAnchor="middle" 
            letterSpacing="0.6"
            className="select-none"
          >
            TECH AND DIGITAL
          </text>
          
          <text 
            x="50" 
            y="63" 
            fontFamily="'Inter', system-ui, sans-serif" 
            fontWeight="900" 
            fontSize="4.2" 
            fill="url(#goldGradient)" 
            textAnchor="middle" 
            letterSpacing="0.4"
            className="select-none"
          >
            MARKETING AGENCY LTD
          </text>
        </g>

        {/* Slogan Badge Lines */}
        <g id="excellence-slogan">
          <line x1="32" y1="68" x2="68" y2="68" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />

          <text 
            x="50" 
            y="73" 
            fontFamily="'Inter', system-ui, sans-serif" 
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
            fontFamily="'Inter', system-ui, sans-serif" 
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
      </svg>

      {showText && (
        <div className="flex flex-col text-left justify-center leading-tight min-w-0 shrink">
          <span className={`font-black uppercase tracking-[0.05em] font-serif truncate ${currentSize.title} ${textColor}`}>
            DS TECH
          </span>
          <span className={`font-bold uppercase tracking-[0.08em] sm:tracking-[0.14em] font-sans truncate ${currentSize.sub} ${subTextColor} mt-[1px] sm:mt-0.5`}>
            &amp; Digital Marketing Agency
          </span>
        </div>
      )}
    </motion.div>
  );
};
