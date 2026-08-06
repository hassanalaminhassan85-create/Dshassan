// Dynamic Media & SVG Visual Generator Utility
// Eliminates external/Unsplash image dependencies by generating high-quality vector artwork & avatars.

// Color themes based on category
const CATEGORY_THEMES: Record<string, { bg1: string; bg2: string; text: string; badgeBg: string; accent: string }> = {
  marketing: { bg1: '#0f172a', bg2: '#be123c', text: '#fecdd3', badgeBg: '#881337', accent: '#fb7185' },
  web: { bg1: '#0f172a', bg2: '#0284c7', text: '#e0f2fe', badgeBg: '#0369a1', accent: '#38bdf8' },
  software: { bg1: '#090d16', bg2: '#4338ca', text: '#e0e7ff', badgeBg: '#3730a3', accent: '#818cf8' },
  ai: { bg1: '#030712', bg2: '#0d9488', text: '#ccfbf1', badgeBg: '#115e59', accent: '#2dd4bf' },
  business: { bg1: '#111827', bg2: '#b45309', text: '#fef3c7', badgeBg: '#78350f', accent: '#fbbf24' },
  branding: { bg1: '#0f172a', bg2: '#7e22ce', text: '#f3e8ff', badgeBg: '#6b21a8', accent: '#c084fc' },
  ict: { bg1: '#0b0f19', bg2: '#1d4ed8', text: '#dbeafe', badgeBg: '#1e40af', accent: '#60a5fa' },
  training: { bg1: '#0a101d', bg2: '#047857', text: '#d1fae5', badgeBg: '#065f46', accent: '#34d399' },
  compliance: { bg1: '#111827', bg2: '#c2410c', text: '#ffedd5', badgeBg: '#9a3412', accent: '#fb923c' },
  default: { bg1: '#0f172a', bg2: '#334155', text: '#f1f5f9', badgeBg: '#1e293b', accent: '#94a3b8' }
};

// Generates an inline SVG Data URI for any service, project, blog, course, or card
export function generateDynamicSvgUrl(
  title: string,
  category: string = 'default',
  type: string = 'card',
  width: number = 800,
  height: number = 500
): string {
  const normCat = (category || 'default').toLowerCase().trim();
  const theme = CATEGORY_THEMES[normCat] || CATEGORY_THEMES.default;
  const safeTitle = (title || 'DS Tech Asset').replace(/[<>&'"]/g, '');
  const badgeLabel = (category || type).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}" />
      <stop offset="100%" stop-color="${theme.bg2}" />
    </linearGradient>
    <linearGradient id="overlayGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#000000" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="${theme.accent}" stroke-opacity="0.15" stroke-width="1" />
    </pattern>
  </defs>
  
  <!-- Base Gradient Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  
  <!-- Tech Grid Overlay -->
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <!-- Geometric Accent Circles & Glowing Nodes -->
  <circle cx="${width * 0.85}" cy="${height * 0.25}" r="140" fill="${theme.accent}" opacity="0.12" />
  <circle cx="${width * 0.85}" cy="${height * 0.25}" r="80" stroke="${theme.accent}" stroke-width="2" fill="none" opacity="0.25" />
  <circle cx="${width * 0.15}" cy="${height * 0.85}" r="100" fill="${theme.bg2}" opacity="0.2" />
  
  <!-- Tech Lines / Abstract Art -->
  <path d="M ${width * 0.5} 0 L ${width} ${height * 0.5}" stroke="${theme.accent}" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.3" />
  <path d="M 0 ${height * 0.3} L ${width * 0.6} ${height}" stroke="${theme.accent}" stroke-width="1" opacity="0.2" />
  
  <!-- Bottom Shadow Gradient -->
  <rect width="100%" height="100%" fill="url(#overlayGrad)" />

  <!-- Badge Pillar -->
  <g transform="translate(36, 40)">
    <rect width="${Math.max(100, badgeLabel.length * 9 + 20)}" height="26" rx="13" fill="${theme.badgeBg}" opacity="0.9" />
    <text x="${(Math.max(100, badgeLabel.length * 9 + 20)) / 2}" y="17" fill="${theme.text}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">${badgeLabel}</text>
  </g>
  
  <!-- Title & Branding -->
  <g transform="translate(36, ${height - 60})">
    <text x="0" y="0" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" opacity="0.98">${safeTitle.length > 42 ? safeTitle.substring(0, 40) + '...' : safeTitle}</text>
    <text x="0" y="24" fill="${theme.text}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" letter-spacing="1.5" opacity="0.85">DS TECH DIGITAL ENTERPRISE HUB</text>
  </g>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Generates dynamic avatar SVG Data URI for user profiles, testimonials, and staff
export function generateAvatarSvgUrl(name: string, role: string = 'Team Member', width: number = 200): string {
  const safeName = (name || 'DS Tech Staff').trim();
  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'DS';

  // Deterministic color palette pick based on name hash
  const colors = [
    { bg1: '#1e1b4b', bg2: '#4338ca', accent: '#818cf8', text: '#e0e7ff' },
    { bg1: '#064e3b', bg2: '#047857', accent: '#34d399', text: '#d1fae5' },
    { bg1: '#831843', bg2: '#be123c', accent: '#fb7185', text: '#fecdd3' },
    { bg1: '#0c4a6e', bg2: '#0284c7', accent: '#38bdf8', text: '#e0f2fe' },
    { bg1: '#581c87', bg2: '#7e22ce', accent: '#c084fc', text: '#f3e8ff' },
    { bg1: '#78350f', bg2: '#d97706', accent: '#fbbf24', text: '#fef3c7' }
  ];
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = (hash << 5) - hash + safeName.charCodeAt(i);
  }
  const theme = colors[Math.abs(hash) % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${width}" width="${width}" height="${width}">
  <defs>
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}" />
      <stop offset="100%" stop-color="${theme.bg2}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="${width / 2}" fill="url(#avatarGrad)" />
  <circle cx="${width / 2}" cy="${width / 2}" r="${width * 0.44}" fill="none" stroke="${theme.accent}" stroke-width="3" stroke-dasharray="6 4" opacity="0.6" />
  <text x="50%" y="54%" fill="${theme.text}" font-family="system-ui, -apple-system, sans-serif" font-size="${width * 0.36}" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">${initials}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
