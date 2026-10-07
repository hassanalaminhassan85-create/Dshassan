import React from 'react';
import { ManagementRoleCode } from '../../types/management';

interface OfficialRoleSvgProps {
  role: ManagementRoleCode | string;
  size?: number;
  className?: string;
}

export const OfficialRoleSvg: React.FC<OfficialRoleSvgProps> = ({
  role,
  size = 56,
  className = ''
}) => {
  switch (role) {
    case 'CEO':
      return <CeoExecutiveCrestSvg size={size} className={className} />;
    case 'HOD_HR':
      return <HrTalentNetworkSvg size={size} className={className} />;
    case 'HOD_ADMIN':
      return <AdminFacilitiesLogisticsSvg size={size} className={className} />;
    case 'HOD_BUSINESS':
      return <BusinessDevelopmentGrowthSvg size={size} className={className} />;
    case 'HOD_FINANCE':
      return <FinanceTreasuryLedgerSvg size={size} className={className} />;
    case 'HOD_CREATIVE_DIGITAL':
      return <CreativeMediaPrismSvg size={size} className={className} />;
    case 'HOD_IT':
      return <InformationTechCloudSiliconSvg size={size} className={className} />;
    case 'HOD_AI_TECH':
      return <AiCreativeTechNeuralSvg size={size} className={className} />;
    case 'HOD_LEGAL':
      return <LegalComplianceScalesSvg size={size} className={className} />;
    default:
      return <CeoExecutiveCrestSvg size={size} className={className} />;
  }
};

// 1. CEO - Executive Imperial Crown & Leadership Starburst
export const CeoExecutiveCrestSvg: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="ceo-gold-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
      <linearGradient id="ceo-accent" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="50%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <filter id="ceo-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#B45309" floodOpacity="0.4" />
      </filter>
    </defs>
    
    {/* Radiant Octagonal Star Shield */}
    <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#ceo-gold-bg)" />
    <rect x="10" y="10" width="80" height="80" rx="22" stroke="url(#ceo-accent)" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />
    
    {/* Inner Ambient Glow */}
    <circle cx="50" cy="50" r="32" fill="#FEF3C7" fillOpacity="0.12" />

    {/* Imperial Crown Core */}
    <g filter="url(#ceo-glow)">
      {/* Crown base */}
      <path 
        d="M24 64C24 62.9 24.9 62 26 62H74C75.1 62 76 62.9 76 64V68C76 70.2 74.2 72 72 72H28C25.8 72 24 70.2 24 68V64Z" 
        fill="url(#ceo-accent)" 
      />
      {/* Crown jewels on base */}
      <circle cx="34" cy="67" r="2" fill="#92400E" />
      <circle cx="50" cy="67" r="2.5" fill="#DC2626" />
      <circle cx="66" cy="67" r="2" fill="#92400E" />

      {/* 5-Peak Imperial Spikes */}
      <path 
        d="M26 62L28 38L40 50L50 26L60 50L72 38L74 62H26Z" 
        fill="#FFFFFF" 
        fillOpacity="0.95"
      />
      <path 
        d="M30 40L40 50L50 28L60 50L70 40L73 60H27L30 40Z" 
        fill="url(#ceo-accent)" 
      />

      {/* Diamond and Pearls at Crown Peak */}
      <circle cx="50" cy="24" r="4.5" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="28" cy="36" r="3.2" fill="#FFFFFF" stroke="#D97706" strokeWidth="1" />
      <circle cx="72" cy="36" r="3.2" fill="#FFFFFF" stroke="#D97706" strokeWidth="1" />
      <circle cx="40" cy="49" r="2" fill="#FEF3C7" />
      <circle cx="60" cy="49" r="2" fill="#FEF3C7" />

      {/* Central Radiance Star */}
      <path 
        d="M50 40L52 46L58 48L52 50L50 56L48 50L42 48L48 46L50 40Z" 
        fill="#FFFFFF" 
      />
    </g>
  </svg>
);

// 2. HOD, Human Resource Management - Triumvirate Talent Node & Welfare Laurel
export const HrTalentNetworkSvg: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="hr-emerald-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="60%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="hr-mint-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D1FAE5" />
        <stop offset="100%" stopColor="#6EE7B7" />
      </linearGradient>
    </defs>

    {/* Background Rounded Shield */}
    <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#hr-emerald-bg)" />
    <rect x="10" y="10" width="80" height="80" rx="22" stroke="url(#hr-mint-accent)" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

    {/* Welfare Laurel Wreath Circle */}
    <circle cx="50" cy="50" r="34" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.5" />

    {/* Interconnected People Leadership Silhouette */}
    {/* Central Primary Leader */}
    <g>
      <circle cx="50" cy="34" r="8.5" fill="#FFFFFF" />
      <path 
        d="M34 66C34 57 41 50 50 50C59 50 66 57 66 66C66 69 64 71 61 71H39C36 71 34 69 34 66Z" 
        fill="#FFFFFF" 
      />
    </g>

    {/* Left Colleague Figure */}
    <g opacity="0.9">
      <circle cx="28" cy="42" r="6" fill="url(#hr-mint-accent)" />
      <path 
        d="M17 68C17 61 22 55 29 55C32 55 35 56.5 37 59C34 62.5 33 67 33 71H20C18 71 17 70 17 68Z" 
        fill="url(#hr-mint-accent)" 
      />
    </g>

    {/* Right Colleague Figure */}
    <g opacity="0.9">
      <circle cx="72" cy="42" r="6" fill="url(#hr-mint-accent)" />
      <path 
        d="M83 68C83 61 78 55 71 55C68 55 65 56.5 63 59C66 62.5 67 67 67 71H80C82 71 83 70 83 68Z" 
        fill="url(#hr-mint-accent)" 
      />
    </g>

    {/* Verified Heart / Welfare Core Badge */}
    <circle cx="50" cy="58" r="4.5" fill="#059669" />
    <path d="M47.5 58L49.5 60L53 56.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 3. HOD, Administrative Services - Classical Corporate Pediment & Operational Seal
export const AdminFacilitiesLogisticsSvg: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="admin-blue-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="60%" stopColor="#1D4ED8" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
      <linearGradient id="admin-ice-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#93C5FD" />
      </linearGradient>
    </defs>

    {/* Background Rounded Shield */}
    <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#admin-blue-bg)" />
    <rect x="10" y="10" width="80" height="80" rx="22" stroke="url(#admin-ice-accent)" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

    {/* Classical Corporate Pediment / Temple Architecture */}
    {/* Roof Pediment Triangle */}
    <path 
      d="M50 20L22 36H78L50 20Z" 
      fill="#FFFFFF" 
    />
    <path 
      d="M50 24L26 37H74L50 24Z" 
      fill="url(#admin-ice-accent)" 
    />
    {/* Pediment Tympanum Medallion */}
    <circle cx="50" cy="30" r="3" fill="#1D4ED8" />

    {/* Architrave Beam */}
    <rect x="23" y="38" width="54" height="4" rx="1.5" fill="#FFFFFF" />

    {/* 4 Majestic Corporate Pillars */}
    <rect x="27" y="44" width="7" height="22" rx="1.5" fill="url(#admin-ice-accent)" />
    <rect x="40" y="44" width="7" height="22" rx="1.5" fill="#FFFFFF" />
    <rect x="53" y="44" width="7" height="22" rx="1.5" fill="#FFFFFF" />
    <rect x="66" y="44" width="7" height="22" rx="1.5" fill="url(#admin-ice-accent)" />

    {/* Pillar Fluting Accents */}
    <line x1="30.5" y1="46" x2="30.5" y2="64" stroke="#1D4ED8" strokeWidth="0.8" strokeOpacity="0.5" />
    <line x1="43.5" y1="46" x2="43.5" y2="64" stroke="#1D4ED8" strokeWidth="0.8" strokeOpacity="0.5" />
    <line x1="56.5" y1="46" x2="56.5" y2="64" stroke="#1D4ED8" strokeWidth="0.8" strokeOpacity="0.5" />
    <line x1="69.5" y1="46" x2="69.5" y2="64" stroke="#1D4ED8" strokeWidth="0.8" strokeOpacity="0.5" />

    {/* Master Foundation Stylobate Steps */}
    <rect x="20" y="68" width="60" height="4" rx="1.5" fill="#FFFFFF" />
    <rect x="16" y="73" width="68" height="5" rx="2" fill="url(#admin-ice-accent)" />
  </svg>
);

// 4. HOD, Business Development - Commercial Velocity Rocket & Ascendant Graph
export const BusinessDevelopmentGrowthSvg: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="biz-purple-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="60%" stopColor="#6D28D9" />
        <stop offset="100%" stopColor="#4C1D95" />
      </linearGradient>
      <linearGradient id="biz-pink-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5D0FE" />
        <stop offset="100%" stopColor="#C084FC" />
      </linearGradient>
    </defs>

    {/* Background Rounded Shield */}
    <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#biz-purple-bg)" />
    <rect x="10" y="10" width="80" height="80" rx="22" stroke="url(#biz-pink-accent)" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

    {/* Bar Metrics Chart at Base */}
    <rect x="22" y="62" width="8" height="14" rx="2" fill="url(#biz-pink-accent)" opacity="0.6" />
    <rect x="34" y="52" width="8" height="24" rx="2" fill="url(#biz-pink-accent)" opacity="0.8" />
    <rect x="46" y="44" width="8" height="32" rx="2" fill="#FFFFFF" />
    <rect x="58" y="34" width="8" height="42" rx="2" fill="#FFFFFF" />

    {/* Rocket Propulsion Trajectory Arrow */}
    <path 
      d="M20 74C32 68 46 54 62 38L56 34L78 24L74 46L68 40C52 56 38 70 20 74Z" 
      fill="#FDE047" 
    />
    <path 
      d="M60 40L78 24L74 46L68 40" 
      fill="#F59E0B" 
    />

    {/* Velocity Sparks */}
    <circle cx="78" cy="24" r="3.5" fill="#FFFFFF" />
    <circle cx="83" cy="19" r="1.5" fill="#FEF08A" />
    <circle cx="85" cy="30" r="1.5" fill="#FEF08A" />
    <circle cx="68" cy="15" r="1.5" fill="#FEF08A" />
  </svg>
);

// 5. HOD, Accounting and Finance - Treasury Vault Dial, Sovereign Gold Coins & Scales
export const FinanceTreasuryLedgerSvg: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="fin-emerald-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="50%" stopColor="#047857" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="fin-gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>

    {/* Background Rounded Shield */}
    <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#fin-emerald-bg)" />
    <rect x="10" y="10" width="80" height="80" rx="22" stroke="url(#fin-gold-metal)" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

    {/* Treasury Vault Outer Circular Bezel */}
    <circle cx="50" cy="50" r="30" fill="#064E3B" stroke="url(#fin-gold-metal)" strokeWidth="3" />

    {/* Vault Dial Teeth */}
    <circle cx="50" cy="24" r="2" fill="#FDE047" />
    <circle cx="50" cy="76" r="2" fill="#FDE047" />
    <circle cx="24" cy="50" r="2" fill="#FDE047" />
    <circle cx="76" cy="50" r="2" fill="#FDE047" />

    {/* Middle Vault Wheel */}
    <circle cx="50" cy="50" r="20" fill="url(#fin-gold-metal)" />
    <circle cx="50" cy="50" r="16" fill="#047857" />

    {/* Sovereign Currency / Naira Double-Struck Symbol ₦ */}
    <text 
      x="50" 
      y="57" 
      textAnchor="middle" 
      fontFamily="system-ui, sans-serif" 
      fontWeight="900" 
      fontSize="20" 
      fill="#FFFFFF"
    >
      ₦
    </text>

    {/* Gold Bullion Coin Accents */}
    <circle cx="72" cy="30" r="6" fill="url(#fin-gold-metal)" stroke="#FFFFFF" strokeWidth="1" />
    <circle cx="28" cy="70" r="5" fill="url(#fin-gold-metal)" stroke="#FFFFFF" strokeWidth="1" />
  </svg>
);

// 6. HOD, Creative Media and Digital Marketing - Prismatic Aperture & Studio Broadcast Waves
export const CreativeMediaPrismSvg: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="media-sunset-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F43F5E" />
        <stop offset="50%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
      <linearGradient id="media-coral-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE4E6" />
        <stop offset="100%" stopColor="#FDA4AF" />
      </linearGradient>
    </defs>

    {/* Background Rounded Shield */}
    <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#media-sunset-bg)" />
    <rect x="10" y="10" width="80" height="80" rx="22" stroke="url(#media-coral-accent)" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

    {/* Studio Aperture Blades Circle */}
    <circle cx="50" cy="50" r="28" fill="#881337" stroke="#FDA4AF" strokeWidth="1.5" />

    {/* Camera Aperture Blades Hexagonal Pattern */}
    <g stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
      <path d="M50 24L65 38" />
      <path d="M72 42L66 61" />
      <path d="M63 71L43 73" />
      <path d="M35 69L26 53" />
      <path d="M26 43L39 28" />
      <path d="M44 24L58 35" />
    </g>

    {/* Central Chromatic Lens Core */}
    <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
    <circle cx="50" cy="50" r="10" fill="#E11D48" />
    <circle cx="47" cy="47" r="3" fill="#FFFFFF" />

    {/* Broadcast Waves */}
    <path d="M75 22C81 28 85 38 85 50" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M80 16C88 24 93 36 93 50" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

// 7. HOD, Information Technology - Cloud DevOps Infrastructure & Silicon Processor
export const InformationTechCloudSiliconSvg: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="it-cyan-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0284C7" />
        <stop offset="50%" stopColor="#0369A1" />
        <stop offset="100%" stopColor="#075985" />
      </linearGradient>
      <linearGradient id="it-bright-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E0F2FE" />
        <stop offset="100%" stopColor="#38BDF8" />
      </linearGradient>
    </defs>

    {/* Background Rounded Shield */}
    <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#it-cyan-bg)" />
    <rect x="10" y="10" width="80" height="80" rx="22" stroke="url(#it-bright-cyan)" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

    {/* Motherboard Circuit Pins */}
    <g stroke="#38BDF8" strokeWidth="2" strokeLinecap="round">
      <line x1="50" y1="16" x2="50" y2="28" />
      <line x1="40" y1="18" x2="40" y2="28" />
      <line x1="60" y1="18" x2="60" y2="28" />

      <line x1="50" y1="72" x2="50" y2="84" />
      <line x1="40" y1="72" x2="40" y2="82" />
      <line x1="60" y1="72" x2="60" y2="82" />

      <line x1="16" y1="50" x2="28" y2="50" />
      <line x1="18" y1="40" x2="28" y2="40" />
      <line x1="18" y1="60" x2="28" y2="60" />

      <line x1="72" y1="50" x2="84" y2="50" />
      <line x1="72" y1="40" x2="82" y2="40" />
      <line x1="72" y1="60" x2="82" y2="60" />
    </g>

    {/* Central Quad Silicon Microprocessor */}
    <rect x="28" y="28" width="44" height="44" rx="8" fill="#0C4A6E" stroke="#E0F2FE" strokeWidth="2" />
    <rect x="34" y="34" width="32" height="32" rx="4" fill="#0284C7" />

    {/* Developer Code Tag Glyph < /> */}
    <path 
      d="M44 44L39 50L44 56" 
      stroke="#FFFFFF" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M56 44L61 50L56 56" 
      stroke="#FFFFFF" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <line 
      x1="52" 
      y1="42" 
      x2="48" 
      y2="58" 
      stroke="#38BDF8" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
  </svg>
);

// 8. HOD, AI and Creative Technology - Quantum Neural Synapse & GenAI Brain
export const AiCreativeTechNeuralSvg: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="ai-indigo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="50%" stopColor="#4338CA" />
        <stop offset="100%" stopColor="#312E81" />
      </linearGradient>
      <linearGradient id="ai-neon-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2DD4BF" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
    </defs>

    {/* Background Rounded Shield */}
    <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#ai-indigo-bg)" />
    <rect x="10" y="10" width="80" height="80" rx="22" stroke="url(#ai-neon-cyan)" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

    {/* Quantum Orbital Ring Ellipse */}
    <ellipse cx="50" cy="50" rx="34" ry="14" transform="rotate(-30 50 50)" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 4" />
    <ellipse cx="50" cy="50" rx="34" ry="14" transform="rotate(30 50 50)" stroke="#2DD4BF" strokeWidth="1.5" strokeDasharray="4 4" />

    {/* Neural Synaptic Mesh Lines */}
    <g stroke="#C7D2FE" strokeWidth="1.8" opacity="0.8">
      <line x1="50" y1="32" x2="32" y2="46" />
      <line x1="50" y1="32" x2="68" y2="46" />
      <line x1="32" y1="46" x2="38" y2="66" />
      <line x1="68" y1="46" x2="62" y2="66" />
      <line x1="38" y1="66" x2="62" y2="66" />
      <line x1="50" y1="32" x2="50" y2="52" />
      <line x1="32" y1="46" x2="50" y2="52" />
      <line x1="68" y1="46" x2="50" y2="52" />
      <line x1="38" y1="66" x2="50" y2="52" />
      <line x1="62" y1="66" x2="50" y2="52" />
    </g>

    {/* Glowing Synaptic Node Spheres */}
    <circle cx="50" cy="32" r="5" fill="#2DD4BF" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="32" cy="46" r="4.5" fill="#818CF8" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="68" cy="46" r="4.5" fill="#818CF8" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="38" cy="66" r="4.5" fill="#A5B4FC" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="62" cy="66" r="4.5" fill="#A5B4FC" stroke="#FFFFFF" strokeWidth="1.5" />

    {/* Central Spark Brain Star (GenAI) */}
    <circle cx="50" cy="52" r="7.5" fill="#FFFFFF" />
    <path 
      d="M50 46L51.5 50.5L56 52L51.5 53.5L50 58L48.5 53.5L44 52L48.5 50.5L50 46Z" 
      fill="#4F46E5" 
    />
  </svg>
);

// 9. HOD, Legal and Compliance - Supreme Scales of Justice, CAC Seal & Sovereign Law
export const LegalComplianceScalesSvg: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="legal-amber-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="50%" stopColor="#92400E" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="legal-gold-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>

    {/* Background Rounded Shield */}
    <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#legal-amber-bg)" />
    <rect x="10" y="10" width="80" height="80" rx="22" stroke="url(#legal-gold-accent)" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

    {/* Upright Pillar of Justice Sword & Stand */}
    <line x1="50" y1="20" x2="50" y2="72" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="22" r="4" fill="url(#legal-gold-accent)" />
    
    {/* Base Pedestal */}
    <path d="M38 72H62L65 76H35L38 72Z" fill="#FFFFFF" />

    {/* Balance Beam */}
    <line x1="24" y1="36" x2="76" y2="36" stroke="url(#legal-gold-accent)" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="36" r="3" fill="#FFFFFF" />

    {/* Left Scale Strings & Pan */}
    <line x1="26" y1="37" x2="18" y2="52" stroke="#FEF3C7" strokeWidth="1.2" />
    <line x1="26" y1="37" x2="34" y2="52" stroke="#FEF3C7" strokeWidth="1.2" />
    <path 
      d="M16 52C16 58 36 58 36 52H16Z" 
      fill="#FFFFFF" 
    />

    {/* Right Scale Strings & Pan */}
    <line x1="74" y1="37" x2="66" y2="52" stroke="#FEF3C7" strokeWidth="1.2" />
    <line x1="74" y1="37" x2="82" y2="52" stroke="#FEF3C7" strokeWidth="1.2" />
    <path 
      d="M64 52C64 58 84 58 84 52H64Z" 
      fill="#FFFFFF" 
    />

    {/* Corporate CAC Red Wax Seal at lower right */}
    <circle cx="72" cy="70" r="7" fill="#DC2626" stroke="#FEF2F2" strokeWidth="1" />
    <circle cx="72" cy="70" r="4.5" fill="#991B1B" />
    <text x="72" y="72" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#FFFFFF">RC</text>
  </svg>
);
