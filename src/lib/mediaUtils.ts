// Dynamic Media & Visual Generator Utility
// High-Resolution Local Static Service Images + Bespoke Vectors
// Ensures 100% instant load speed on Cloudflare Pages, zero loading delays, zero broken images.
import { getServiceBespokeSvgUrl, SERVICE_SVGS } from './serviceSvgs';

// Local High-Performance Static Images Dictionary (100% Cloudflare Edge Cached)
export const SERVICE_NICHE_IMAGES: Record<string, string> = {
  // Services from Firestore (svc_01 to svc_26)
  svc_01: "/assets/services/svc_01.jpg", // Sponsored Ads Campaign Management
  svc_02: "/assets/services/svc_02.jpg", // Digital Marketing Monthly Packages
  svc_03: "/assets/services/svc_03.jpg", // Professional Training & Consultancy
  svc_04: "/assets/services/svc_04.jpg", // Content Creation and Presentation
  svc_05: "/assets/services/svc_05.jpg", // Social Media Management
  svc_06: "/assets/services/svc_06.jpg", // Website Design and Development
  svc_07: "/assets/services/svc_07.jpg", // Software and Mobile App Design
  svc_08: "/assets/services/svc_08.jpg", // Project Design and Management
  svc_09: "/assets/services/svc_09.jpg", // Content Creation & Presentation Portfolio
  svc_10: "/assets/services/svc_10.jpg", // Software & Mobile App Architecture
  svc_11: "/assets/services/svc_11.jpg", // Web Portals and Systems Architecture
  svc_12: "/assets/services/svc_12.jpg", // Portfolio Design Package
  svc_13: "/assets/services/svc_13.jpg", // Strategic Project Blueprinting
  svc_14: "/assets/services/svc_14.jpg", // Business Plan Design
  svc_15: "/assets/services/svc_15.jpg", // Social Media Campaigns Mastery
  svc_16: "/assets/services/svc_16.jpg", // Beginners Training
  svc_17: "/assets/services/svc_17.jpg", // Exclusive and Advanced Trainings
  svc_18: "/assets/services/svc_18.jpg", // Customer Care Service Management
  svc_19: "/assets/services/svc_19.jpg", // DS ICT SUPPORT & SMART TECH
  svc_20: "/assets/services/svc_20.jpg", // DS BRANDING AND GRAPHIC DESIGNS
  svc_21: "/assets/services/svc_21.jpg", // DS SOFTWARE APP DESIGNING
  svc_22: "/assets/services/svc_22.jpg", // AI Content Creation Packages
  svc_23: "/assets/services/svc_23.jpg", // AI Chatbot Development Package
  svc_24: "/assets/services/svc_24.jpg", // Business Data Analytics
  svc_25: "/assets/services/svc_25.jpg", // CYBERSECURITY SERVICES
  svc_26: "/assets/services/svc_26.jpg", // CAC, Tax and SCUML Certificate Registration

  // Named Service IDs (svc_web_dev, etc.)
  svc_web_dev: "/assets/services/svc_web_dev.jpg",
  svc_mobile_software: "/assets/services/svc_mobile_software.jpg",
  svc_landing_pages: "/assets/services/svc_landing_pages.jpg",
  svc_portfolio_design: "/assets/services/svc_portfolio_design.jpg",
  svc_ai_automation: "/assets/services/svc_ai_automation.jpg",
  svc_ads_management: "/assets/services/svc_ads_management.jpg",
  svc_seo: "/assets/services/svc_seo.jpg",
  svc_content_presentation: "/assets/services/svc_content_presentation.jpg",
  svc_ai_content: "/assets/services/svc_ai_content.jpg",
  svc_video_editing: "/assets/services/svc_video_editing.jpg",
  svc_digital_marketing: "/assets/services/svc_digital_marketing.jpg",
  svc_social_media_mgmt: "/assets/services/svc_social_media_mgmt.jpg",
  svc_graphic_branding: "/assets/services/svc_graphic_branding.jpg",
  svc_project_mgmt: "/assets/services/svc_project_mgmt.jpg",
  svc_cybersecurity: "/assets/services/svc_cybersecurity.jpg",
  svc_event_videography: "/assets/services/svc_event_videography.jpg"
};

// Fallback images per category (all served from local edge assets)
export const CATEGORY_NICHE_IMAGES: Record<string, string> = {
  marketing: "/assets/services/svc_01.jpg",
  web: "/assets/services/svc_06.jpg",
  software: "/assets/services/svc_07.jpg",
  ai: "/assets/services/svc_23.jpg",
  branding: "/assets/services/svc_20.jpg",
  business: "/assets/services/svc_08.jpg",
  training: "/assets/services/svc_03.jpg",
  ict: "/assets/services/svc_25.jpg",
  compliance: "/assets/services/svc_26.jpg",
  default: "/assets/services/svc_02.jpg"
};

// Returns an instant, high-res local image aligned directly to the service
export function getPolishedServiceImage(service: { id?: string; name?: string; category?: string; image?: string }): string {
  // 1. If an actual custom file was uploaded locally (/uploads/ or /assets/services/), use it
  if (service?.image && (service.image.startsWith('/uploads/') || service.image.startsWith('/assets/services/'))) {
    return service.image;
  }

  // 2. Direct ID Match in our local static photo registry
  if (service?.id && SERVICE_NICHE_IMAGES[service.id]) {
    return SERVICE_NICHE_IMAGES[service.id];
  }

  // 3. Intelligent Semantic Title Keyword Match
  const nameLower = (service?.name || '').toLowerCase();

  if (nameLower.includes('sponsored') || nameLower.includes('ads') || nameLower.includes('campaign management')) {
    return SERVICE_NICHE_IMAGES.svc_01;
  }
  if (nameLower.includes('digital marketing') || nameLower.includes('monthly package')) {
    return SERVICE_NICHE_IMAGES.svc_02;
  }
  if (nameLower.includes('consultancy') || nameLower.includes('professional training') || nameLower.includes('trainings')) {
    return SERVICE_NICHE_IMAGES.svc_03;
  }
  if (nameLower.includes('presentation') || nameLower.includes('content creation')) {
    return SERVICE_NICHE_IMAGES.svc_04;
  }
  if (nameLower.includes('social media')) {
    return SERVICE_NICHE_IMAGES.svc_05;
  }
  if (nameLower.includes('website design') || nameLower.includes('web dev')) {
    return SERVICE_NICHE_IMAGES.svc_06;
  }
  if (nameLower.includes('mobile app') || nameLower.includes('app design') || nameLower.includes('software and mobile')) {
    return SERVICE_NICHE_IMAGES.svc_07;
  }
  if (nameLower.includes('project design') || nameLower.includes('project management')) {
    return SERVICE_NICHE_IMAGES.svc_08;
  }
  if (nameLower.includes('portfolio')) {
    return SERVICE_NICHE_IMAGES.svc_12;
  }
  if (nameLower.includes('business plan')) {
    return SERVICE_NICHE_IMAGES.svc_14;
  }
  if (nameLower.includes('customer care')) {
    return SERVICE_NICHE_IMAGES.svc_18;
  }
  if (nameLower.includes('ict') || nameLower.includes('smart technology')) {
    return SERVICE_NICHE_IMAGES.svc_19;
  }
  if (nameLower.includes('branding') || nameLower.includes('graphic design')) {
    return SERVICE_NICHE_IMAGES.svc_20;
  }
  if (nameLower.includes('ai content')) {
    return SERVICE_NICHE_IMAGES.svc_22;
  }
  if (nameLower.includes('chatbot') || nameLower.includes('ai chat') || nameLower.includes('ai automation')) {
    return SERVICE_NICHE_IMAGES.svc_23;
  }
  if (nameLower.includes('analytics') || nameLower.includes('data analytics')) {
    return SERVICE_NICHE_IMAGES.svc_24;
  }
  if (nameLower.includes('cyber') || nameLower.includes('cybersecurity') || nameLower.includes('security')) {
    return SERVICE_NICHE_IMAGES.svc_25;
  }
  if (nameLower.includes('cac') || nameLower.includes('scuml') || nameLower.includes('tax') || nameLower.includes('registration')) {
    return SERVICE_NICHE_IMAGES.svc_26;
  }
  if (nameLower.includes('video') || nameLower.includes('videography') || nameLower.includes('editing')) {
    return SERVICE_NICHE_IMAGES.svc_video_editing;
  }
  if (nameLower.includes('seo') || nameLower.includes('search engine')) {
    return SERVICE_NICHE_IMAGES.svc_seo;
  }

  // 4. Category-specific local fallback image
  const cat = (service?.category || '').toLowerCase();
  return CATEGORY_NICHE_IMAGES[cat] || CATEGORY_NICHE_IMAGES.default;
}

// Fallback emergency image in case an asset fails to load
export function getEmergencyFallbackImage(category?: string): string {
  const cat = (category || '').toLowerCase();
  return CATEGORY_NICHE_IMAGES[cat] || CATEGORY_NICHE_IMAGES.default;
}

// Color themes based on category for avatars & certificates
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
  <rect width="100%" height="100%" fill="url(#grid)" />
  <circle cx="${width * 0.85}" cy="${height * 0.25}" r="140" fill="${theme.accent}" opacity="0.12" />
  <circle cx="${width * 0.85}" cy="${height * 0.25}" r="80" stroke="${theme.accent}" stroke-width="2" fill="none" opacity="0.25" />
  <circle cx="${width * 0.15}" cy="${height * 0.85}" r="100" fill="${theme.bg2}" opacity="0.2" />
  <rect width="100%" height="100%" fill="url(#overlayGrad)" />

  <g transform="translate(36, 40)">
    <rect width="${Math.max(100, badgeLabel.length * 9 + 20)}" height="26" rx="13" fill="${theme.badgeBg}" opacity="0.9" />
    <text x="${(Math.max(100, badgeLabel.length * 9 + 20)) / 2}" y="17" fill="${theme.text}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">${badgeLabel}</text>
  </g>
  
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

export { getServiceBespokeSvgUrl };
