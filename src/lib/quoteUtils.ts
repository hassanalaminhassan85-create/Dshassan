import { SERVICES, ServiceItem } from './data';

export interface ServiceSlugMapping {
  id: string;
  slug: string;
  aliases: string[];
}

export const SERVICE_SLUG_MAP: Record<string, ServiceSlugMapping> = {
  // THE 26 CORE CATALOGUE SERVICES
  svc_01: {
    id: 'svc_01',
    slug: 'sponsored-ads-campaign-management',
    aliases: ['ads-management', 'sponsored-ads', 'sponsored-ads-campaign', 'meta-ads', 'google-ads', 'facebook-ads', 'ads-campaign']
  },
  svc_02: {
    id: 'svc_02',
    slug: 'digital-marketing-monthly-packages',
    aliases: ['digital-marketing', 'digital-marketing-packages', 'online-marketing', 'monthly-marketing']
  },
  svc_03: {
    id: 'svc_03',
    slug: 'professional-training-consultancy',
    aliases: ['professional-training', 'training-consultancy', 'consultancy-training', 'consultancy', 'training', 'professional-training-and-consultancy']
  },
  svc_04: {
    id: 'svc_04',
    slug: 'content-creation-and-presentation',
    aliases: ['content-creation', 'content-presentation', 'pitch-decks', 'corporate-presentations']
  },
  svc_05: {
    id: 'svc_05',
    slug: 'social-media-management',
    aliases: ['social-media', 'social-media-mgmt', 'social-media-marketing']
  },
  svc_06: {
    id: 'svc_06',
    slug: 'website-design-and-development',
    aliases: ['website-design', 'website-development', 'web-development', 'web-dev', 'website-dev']
  },
  svc_07: {
    id: 'svc_07',
    slug: 'software-and-mobile-app-design',
    aliases: ['software-and-mobile-app-development', 'mobile-app-development', 'software-development', 'mobile-app-design', 'app-development']
  },
  svc_08: {
    id: 'svc_08',
    slug: 'project-design-and-management',
    aliases: ['project-management', 'project-design', 'agile-project-management', 'project-governance']
  },
  svc_09: {
    id: 'svc_09',
    slug: 'content-creation-presentation-portfolio',
    aliases: ['company-profiles', 'corporate-lookbooks', 'content-portfolio']
  },
  svc_10: {
    id: 'svc_10',
    slug: 'software-mobile-app-architecture',
    aliases: ['software-architecture', 'cloud-architecture', 'enterprise-app-architecture']
  },
  svc_11: {
    id: 'svc_11',
    slug: 'web-portals-and-systems-architecture',
    aliases: ['web-portals', 'systems-architecture', 'saas-portals', 'client-portals']
  },
  svc_12: {
    id: 'svc_12',
    slug: 'portfolio-design-package',
    aliases: ['portfolio-design', 'personal-portfolio', 'portfolio-website']
  },
  svc_13: {
    id: 'svc_13',
    slug: 'strategic-project-blueprinting',
    aliases: ['project-blueprinting', 'strategic-blueprinting', 'technical-feasibility']
  },
  svc_14: {
    id: 'svc_14',
    slug: 'business-plan-design',
    aliases: ['business-plan', 'financial-model', 'investor-business-plan']
  },
  svc_15: {
    id: 'svc_15',
    slug: 'social-media-campaigns-mastery',
    aliases: ['social-media-campaigns', 'viral-campaigns', 'influencer-marketing']
  },
  svc_16: {
    id: 'svc_16',
    slug: 'beginners-training',
    aliases: ['beginner-training', 'entry-level-training', 'foundational-training', 'coding-for-beginners']
  },
  svc_17: {
    id: 'svc_17',
    slug: 'exclusive-and-advanced-trainings',
    aliases: ['exclusive-advanced-trainings', 'advanced-training', 'executive-tech-training']
  },
  svc_18: {
    id: 'svc_18',
    slug: 'customer-care-service-management',
    aliases: ['customer-care', 'customer-service', 'support-desk-management']
  },
  svc_19: {
    id: 'svc_19',
    slug: 'ds-ict-support-and-smart-tech',
    aliases: ['ict-support', 'smart-tech', 'smart-technology', 'cctv-biometrics', 'network-setup']
  },
  svc_20: {
    id: 'svc_20',
    slug: 'ds-branding-and-graphic-designs',
    aliases: ['branding-and-graphic-designs', 'graphic-designs', 'corporate-branding', 'logo-design']
  },
  svc_21: {
    id: 'svc_21',
    slug: 'ds-software-app-designing',
    aliases: ['software-app-designing', 'ui-ux-design', 'figma-prototyping']
  },
  svc_22: {
    id: 'svc_22',
    slug: 'ai-content-creation-packages',
    aliases: ['ai-content-creation', 'ai-content', 'generative-ai-content']
  },
  svc_23: {
    id: 'svc_23',
    slug: 'ai-chatbot-development-package',
    aliases: ['ai-chatbot-development', 'ai-chatbot', 'whatsapp-chatbot']
  },
  svc_24: {
    id: 'svc_24',
    slug: 'business-data-analytics',
    aliases: ['data-analytics', 'business-analytics', 'bi-dashboards']
  },
  svc_25: {
    id: 'svc_25',
    slug: 'cybersecurity-services',
    aliases: ['cybersecurity', 'cyber-security', 'security-assessment', 'penetration-testing']
  },
  svc_26: {
    id: 'svc_26',
    slug: 'cac-tax-and-scuml-certificate-registration',
    aliases: ['cac-registration', 'scuml-clearance', 'tax-clearance', 'cac-tax-scuml', 'business-incorporation']
  },

  // NAMED ALIASES
  svc_web_dev: {
    id: 'svc_web_dev',
    slug: 'website-development',
    aliases: ['web-development', 'website-dev', 'web-dev', 'web-development-price-list', 'website-development-price-list']
  },
  svc_mobile_software: {
    id: 'svc_mobile_software',
    slug: 'software-and-mobile-app-development',
    aliases: ['mobile-app-development', 'software-mobile-app-development', 'mobile-app-dev', 'app-development', 'software-development']
  },
  svc_landing_pages: {
    id: 'svc_landing_pages',
    slug: 'landing-page-design-and-integration',
    aliases: ['landing-pages', 'landing-page-design', 'landing-page-integration']
  },
  svc_portfolio_design: {
    id: 'svc_portfolio_design',
    slug: 'portfolio-design',
    aliases: ['portfolio-web-design', 'online-portfolio']
  },
  svc_ai_automation: {
    id: 'svc_ai_automation',
    slug: 'ai-integration-and-workflow-automation',
    aliases: ['ai-automation', 'ai-integration', 'workflow-automation']
  },
  svc_ads_management: {
    id: 'svc_ads_management',
    slug: 'ads-management',
    aliases: ['sponsored-ads-campaign', 'sponsored-ads-campaign-management']
  },
  svc_seo: {
    id: 'svc_seo',
    slug: 'search-engine-optimization-seo',
    aliases: ['search-engine-optimization', 'seo', 'seo-optimization']
  },
  svc_content_presentation: {
    id: 'svc_content_presentation',
    slug: 'content-creation-and-presentation',
    aliases: ['content-presentation', 'pitch-deck-design']
  },
  svc_ai_content: {
    id: 'svc_ai_content',
    slug: 'ai-generated-content-creation',
    aliases: ['ai-content', 'ai-copywriting']
  },
  svc_video_editing: {
    id: 'svc_video_editing',
    slug: 'video-editing',
    aliases: ['video-post-production', 'video-editing-services']
  },
  svc_digital_marketing: {
    id: 'svc_digital_marketing',
    slug: 'digital-marketing',
    aliases: ['digital-marketing-monthly-packages', 'online-marketing']
  },
  svc_social_media_mgmt: {
    id: 'svc_social_media_mgmt',
    slug: 'social-media-management',
    aliases: ['social-media-mgmt', 'social-media-marketing']
  },
  svc_graphic_branding: {
    id: 'svc_graphic_branding',
    slug: 'graphic-designs-and-corporate-branding',
    aliases: ['graphic-branding', 'corporate-branding', 'logo-design']
  },
  svc_project_mgmt: {
    id: 'svc_project_mgmt',
    slug: 'project-management',
    aliases: ['agile-project-management', 'project-governance']
  },
  svc_cybersecurity: {
    id: 'svc_cybersecurity',
    slug: 'cybersecurity-services',
    aliases: ['cybersecurity', 'cyber-security', 'security-audit']
  },
  svc_event_videography: {
    id: 'svc_event_videography',
    slug: 'event-coverage-and-videography',
    aliases: ['event-videography', 'event-coverage']
  }
};

export function getServiceSlug(service: ServiceItem): string {
  if (!service) return 'website-development';
  if (service.id && SERVICE_SLUG_MAP[service.id]) {
    return SERVICE_SLUG_MAP[service.id].slug;
  }
  // Check if any mapping matches service name exactly
  const lowerName = (service.name || '').toLowerCase().trim();
  for (const mapKey of Object.keys(SERVICE_SLUG_MAP)) {
    const mapping = SERVICE_SLUG_MAP[mapKey];
    if (mapping.slug === lowerName || mapping.aliases.includes(lowerName)) {
      return mapping.slug;
    }
  }
  return (service.name || 'service').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function cleanServiceSlug(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.toLowerCase().trim();
  // Strip query params or hash if attached
  const qIdx = cleaned.indexOf('?');
  if (qIdx !== -1) cleaned = cleaned.substring(0, qIdx);
  const hIdx = cleaned.indexOf('#');
  if (hIdx !== -1) cleaned = cleaned.substring(0, hIdx);

  // Strip leading route prefixes if included
  cleaned = cleaned.replace(/^\/(?:quote|quotes|service|services|quotation)\//i, '');

  // Strip common noisy suffixes
  cleaned = cleaned
    .replace(/-(?:price-list|pricelist|pricing|price|quotation|quote|packages|plans|rates|cost|details)$/i, '')
    .trim();

  return cleaned;
}

/**
 * Universal Fail-Safe Service Synthesizer
 * Guarantees that any custom, newly-added, or unrecognized service slug will ALWAYS
 * resolve into a fully-functional, beautiful ServiceItem for quotation and invoicing.
 */
export function synthesizeServiceFromSlug(slugOrId: string): ServiceItem {
  const cleaned = cleanServiceSlug(slugOrId) || 'custom-service';
  // Humanize title: replace dashes/underscores, capitalize words
  const words = cleaned.split(/[-_]+/).filter(Boolean);
  const formattedTitle = words.map(w => {
    const lower = w.toLowerCase();
    if (lower === 'and' || lower === 'or' || lower === 'for' || lower === 'of') return lower;
    if (lower === 'seo' || lower === 'cac' || lower === 'ict' || lower === 'ai' || lower === 'ui' || lower === 'ux' || lower === 'tin' || lower === 'api') return lower.toUpperCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');

  const lower = cleaned.toLowerCase();
  let category: ServiceItem['category'] = 'business';
  let defaultPrice = '₦100,000 – ₦3,500,000+';

  if (lower.includes('train') || lower.includes('consult') || lower.includes('course') || lower.includes('academy') || lower.includes('mentorship')) {
    category = 'training';
    defaultPrice = '₦80,000 – ₦1,500,000+';
  } else if (lower.includes('web') || lower.includes('site') || lower.includes('landing') || lower.includes('portal')) {
    category = 'web';
    defaultPrice = '₦150,000 – ₦5,000,000+';
  } else if (lower.includes('app') || lower.includes('software') || lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) {
    category = 'software';
    defaultPrice = '₦250,000 – ₦25,000,000+';
  } else if (lower.includes('ad') || lower.includes('market') || lower.includes('seo') || lower.includes('video') || lower.includes('media') || lower.includes('social')) {
    category = 'marketing';
    defaultPrice = '₦50,000 – ₦1,500,000+';
  } else if (lower.includes('ai') || lower.includes('bot') || lower.includes('automati') || lower.includes('gpt')) {
    category = 'ai';
    defaultPrice = '₦120,000 – ₦8,000,000+';
  } else if (lower.includes('brand') || lower.includes('logo') || lower.includes('graphic') || lower.includes('design')) {
    category = 'branding';
    defaultPrice = '₦50,000 – ₦2,000,000+';
  } else if (lower.includes('cac') || lower.includes('scuml') || lower.includes('tax') || lower.includes('tin') || lower.includes('legal') || lower.includes('complianc')) {
    category = 'compliance';
    defaultPrice = '₦45,000 – ₦600,000+';
  } else if (lower.includes('ict') || lower.includes('cyber') || lower.includes('secur') || lower.includes('tech') || lower.includes('cctv')) {
    category = 'ict';
    defaultPrice = '₦150,000 – ₦10,000,000+';
  }

  const finalName = formattedTitle || 'Specialized Corporate Service';

  return {
    id: cleaned,
    name: finalName,
    price: defaultPrice,
    description: `Bespoke agency execution and dedicated project delivery for ${finalName}. Submit your custom scope, timeline, and budget for an immediate quotation review.`,
    image: `/assets/services/${category === 'training' ? 'svc_03.jpg' : category === 'web' ? 'svc_06.jpg' : category === 'software' ? 'svc_07.jpg' : category === 'ai' ? 'svc_23.jpg' : category === 'branding' ? 'svc_20.jpg' : category === 'compliance' ? 'svc_26.jpg' : category === 'ict' ? 'svc_25.jpg' : 'svc_01.jpg'}`,
    url: `https://wa.me/2349023489111?text=${encodeURIComponent(`Hello DS Tech Agency, I would like to request an immediate official quotation for: ${finalName}`)}`,
    category,
    deliverables: [
      'Tailored Project Blueprint & Specification',
      'Milestone Tracking & Agile Governance',
      'Official CAC Corporate SLA Contract',
      'Dedicated Project Manager & QA'
    ]
  };
}

export function getServiceBySlugOrId(slugOrId: string, servicesList: ServiceItem[] = SERVICES): ServiceItem {
  if (!slugOrId) {
    return servicesList[0] || SERVICES[0] || synthesizeServiceFromSlug('website-development');
  }

  const rawNormalized = slugOrId.toLowerCase().trim();
  const cleanedNormalized = cleanServiceSlug(slugOrId);

  // Combine provided servicesList with default SERVICES and any custom services stored in localStorage
  const combinedMap = new Map<string, ServiceItem>();
  
  // 1. Seed with hardcoded SERVICES
  for (const s of SERVICES) {
    if (s && s.id) combinedMap.set(s.id.toLowerCase(), s);
  }

  // 2. Overlay with runtime servicesList
  if (Array.isArray(servicesList)) {
    for (const s of servicesList) {
      if (s && s.id) combinedMap.set(s.id.toLowerCase(), s);
    }
  }

  // 3. Overlay with localStorage 'admin_services' if in client environment
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('admin_services');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const s of parsed) {
            if (s && s.id) combinedMap.set(s.id.toLowerCase(), s);
          }
        }
      }
    } catch (e) {}
  }

  const allAvailable = Array.from(combinedMap.values());

  // Check 1: Direct ID Match (raw or cleaned)
  let directMatch = allAvailable.find(s => s.id.toLowerCase() === rawNormalized || s.id.toLowerCase() === cleanedNormalized);
  if (directMatch) return directMatch;

  // Check 2: Match against SERVICE_SLUG_MAP (slug, aliases, or mapKey)
  for (const candidate of [rawNormalized, cleanedNormalized]) {
    if (!candidate) continue;
    for (const mapKey of Object.keys(SERVICE_SLUG_MAP)) {
      const mapping = SERVICE_SLUG_MAP[mapKey];
      if (
        mapping.slug === candidate ||
        mapping.aliases.includes(candidate) ||
        mapping.id.toLowerCase() === candidate
      ) {
        // Try to find in allAvailable
        const match = allAvailable.find(s => s.id.toLowerCase() === mapping.id.toLowerCase());
        if (match) return match;

        // If mapped ID has another corresponding entry
        const matchBySlug = allAvailable.find(s => getServiceSlug(s) === mapping.slug);
        if (matchBySlug) return matchBySlug;
      }
    }
  }

  // Check 3: Match against dynamically generated slug from service name
  for (const candidate of [rawNormalized, cleanedNormalized]) {
    if (!candidate) continue;
    const fallbackMatch = allAvailable.find(s => {
      const generated = getServiceSlug(s);
      return generated === candidate;
    });
    if (fallbackMatch) return fallbackMatch;
  }

  // Check 4: Substring / Partial Fuzzy Matching
  for (const candidate of [cleanedNormalized, rawNormalized]) {
    if (!candidate || candidate.length < 3) continue;
    
    // Check against allAvailable names and IDs
    const partialItemMatch = allAvailable.find(s => {
      const sSlug = getServiceSlug(s);
      const sName = (s.name || '').toLowerCase();
      return candidate.includes(sSlug) || sSlug.includes(candidate) || candidate.includes(sName) || sName.includes(candidate);
    });
    if (partialItemMatch) return partialItemMatch;

    for (const mapKey of Object.keys(SERVICE_SLUG_MAP)) {
      const mapping = SERVICE_SLUG_MAP[mapKey];
      const matchFound =
        candidate.includes(mapping.slug) ||
        mapping.slug.includes(candidate) ||
        mapping.aliases.some(alias => candidate.includes(alias) || alias.includes(candidate));

      if (matchFound) {
        const match = allAvailable.find(s => s.id.toLowerCase() === mapping.id.toLowerCase());
        if (match) return match;
      }
    }
  }

  // Check 5: Semantic keyword matching
  for (const candidate of [cleanedNormalized, rawNormalized]) {
    if (candidate.includes('train') || candidate.includes('consult')) {
      const match = allAvailable.find(s => s.id === 'svc_03' || s.category === 'training');
      if (match) return match;
    }
    if (candidate.includes('ad') || candidate.includes('sponsor')) {
      const match = allAvailable.find(s => s.id === 'svc_01' || s.id === 'svc_ads_management');
      if (match) return match;
    }
    if (candidate.includes('web') || candidate.includes('site')) {
      const match = allAvailable.find(s => s.id === 'svc_06' || s.id === 'svc_web_dev');
      if (match) return match;
    }
    if (candidate.includes('app') || candidate.includes('software')) {
      const match = allAvailable.find(s => s.id === 'svc_07' || s.id === 'svc_mobile_software');
      if (match) return match;
    }
    if (candidate.includes('brand') || candidate.includes('logo')) {
      const match = allAvailable.find(s => s.id === 'svc_20' || s.id === 'svc_graphic_branding');
      if (match) return match;
    }
    if (candidate.includes('cac') || candidate.includes('scuml') || candidate.includes('tax')) {
      const match = allAvailable.find(s => s.id === 'svc_26');
      if (match) return match;
    }
    if (candidate.includes('cyber') || candidate.includes('security')) {
      const match = allAvailable.find(s => s.id === 'svc_25' || s.id === 'svc_cybersecurity');
      if (match) return match;
    }
    if (candidate.includes('ai') || candidate.includes('bot')) {
      const match = allAvailable.find(s => s.id === 'svc_23' || s.id === 'svc_ai_automation');
      if (match) return match;
    }
  }

  // Check 6: Universal Fail-Safe Synthesis
  // Guarantees that any custom, newly-added, or unknown service slug NEVER shows an error screen!
  return synthesizeServiceFromSlug(slugOrId);
}

export interface QuotationSubmissionPayload {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  fullName: string;
  phone: string;
  email?: string;
  company?: string;
  preferredDeliveryTime: string;
  customTimelineText?: string;
  proposedBudget?: string;
  description: string;
  serviceSpecificFields: Record<string, any>;
  amountPaid?: string;
  paymentMethod?: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'closed';
}

export function saveQuotationRecord(payload: QuotationSubmissionPayload): void {
  try {
    const existingRaw = localStorage.getItem('dstech_quotations');
    const existing: QuotationSubmissionPayload[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift(payload);
    localStorage.setItem('dstech_quotations', JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to persist quotation record locally:', e);
  }
}
