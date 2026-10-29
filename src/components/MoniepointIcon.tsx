import React from 'react';

interface MoniepointIconProps {
  className?: string;
  size?: number;
}

/**
  * Official Moniepoint Brand Icon SVG Asset
  * Preserves official Moniepoint blue brand color (#0052FF) and white M emblem.
  */
export const MoniepointIcon: React.FC<MoniepointIconProps> = ({ 
  className = "w-5 h-5", 
  size = 20 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Moniepoint"
    >
      <rect width="32" height="32" rx="8" fill="#0052FF" />
      {/* Official Moniepoint stylized 'm' emblem */}
      <path 
        d="M8 22V11.5C8 10.6716 8.67157 10 9.5 10C10.0211 10 10.4947 10.2682 10.7645 10.7142L16 19.3688L21.2355 10.7142C21.5053 10.2682 21.9789 10 22.5 10C23.3284 10 24 10.6716 24 11.5V22" 
        stroke="white" 
        strokeWidth="2.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};
