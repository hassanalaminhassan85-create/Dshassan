import { SERVICES, ServiceItem } from './data';

export interface ServiceSlugMapping {
  id: string;
  slug: string;
  aliases: string[];
}

export const SERVICE_SLUG_MAP: Record<string, ServiceSlugMapping> = {
  svc_web_dev: {
    id: 'svc_web_dev',
    slug: 'website-development',
    aliases: ['web-development', 'website-dev', 'web-dev']
  },
  svc_mobile_software: {
    id: 'svc_mobile_software',
    slug: 'software-and-mobile-app-development',
    aliases: ['mobile-app-development', 'software-mobile-app-development', 'mobile-app-dev', 'app-development']
  },
  svc_landing_pages: {
    id: 'svc_landing_pages',
    slug: 'landing-page-design-and-integration',
    aliases: ['landing-pages', 'landing-page-design']
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
    aliases: ['sponsored-ads-campaign', 'facebook-ads', 'google-ads', 'meta-ads']
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
  const map = SERVICE_SLUG_MAP[service.id];
  if (map) return map.slug;
  return service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getServiceBySlugOrId(slugOrId: string, servicesList: ServiceItem[] = SERVICES): ServiceItem | null {
  if (!slugOrId) return null;
  const normalized = slugOrId.toLowerCase().trim();

  // 1. Check direct ID match
  const directMatch = servicesList.find(s => s.id.toLowerCase() === normalized);
  if (directMatch) return directMatch;

  // 2. Check slug map matches or aliases
  for (const mapKey of Object.keys(SERVICE_SLUG_MAP)) {
    const mapping = SERVICE_SLUG_MAP[mapKey];
    if (mapping.slug === normalized || mapping.aliases.includes(normalized) || mapping.id.toLowerCase() === normalized) {
      const match = servicesList.find(s => s.id === mapping.id);
      if (match) return match;
    }
  }

  // 3. Check fallback slug generated from name
  const fallbackMatch = servicesList.find(s => {
    const generated = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return generated === normalized;
  });

  return fallbackMatch || null;
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
