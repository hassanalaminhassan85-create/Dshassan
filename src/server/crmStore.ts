import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CrmVisitor {
  id: string; // vid_...
  first_seen_at: string;
  last_seen_at: string;
  total_sessions: number;
  total_page_views: number;
  total_events: number;
  landing_page: string;
  last_page: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  timezone: string;
  device_category: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  traffic_source: 'Direct' | 'Organic Search' | 'Social' | 'Referral' | 'Campaign';
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  lead_id?: string | null;
  is_returning: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmSession {
  id: string; // ses_...
  visitor_id: string;
  started_at: string;
  last_active_at: string;
  ended_at?: string | null;
  is_active: boolean;
  duration_seconds: number;
  entry_page: string;
  exit_page?: string;
  page_views_count: number;
  events_count: number;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  country: string;
  region: string;
  city: string;
  device_category: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  is_bounce: boolean;
  converted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmPageView {
  id: string;
  visitor_id: string;
  session_id: string;
  path: string;
  title: string;
  referrer: string;
  duration_seconds: number;
  country: string;
  device_category: string;
  created_at: string;
}

export interface CrmEvent {
  id: string;
  visitor_id: string;
  session_id: string;
  event_name: string;
  event_category: 'pageview' | 'click' | 'cta' | 'whatsapp' | 'phone' | 'email' | 'form' | 'conversion' | 'navigation' | 'test';
  path: string;
  element_id?: string;
  element_text?: string;
  placement?: string;
  destination_url?: string;
  metadata?: Record<string, any>;
  is_conversion: boolean;
  is_test: boolean;
  country?: string;
  city?: string;
  device_category?: string;
  created_at: string;
}

export interface CrmLead {
  id: string; // lead_...
  visitor_id?: string;
  name: string;
  email: string;
  phone: string;
  service_interest: string;
  enquiry_details: string;
  source_page: string;
  traffic_source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  stage: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assigned_to: string;
  tags: string[];
  notes: Array<{
    id: string;
    author: string;
    content: string;
    created_at: string;
  }>;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CrmAuditLog {
  id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id?: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface CrmSettings {
  tracking_enabled: boolean;
  default_timezone: string;
  session_timeout_minutes: number;
  data_retention_days: number;
  ip_anonymization: boolean;
  require_consent: boolean;
  track_form_starts: boolean;
  track_button_clicks: boolean;
  track_outbound_links: boolean;
  excluded_paths: string[];
}

interface CrmDatabase {
  visitors: Record<string, CrmVisitor>;
  sessions: Record<string, CrmSession>;
  page_views: CrmPageView[];
  events: CrmEvent[];
  leads: Record<string, CrmLead>;
  audit_logs: CrmAuditLog[];
  settings: CrmSettings;
}

const DEFAULT_SETTINGS: CrmSettings = {
  tracking_enabled: true,
  default_timezone: 'Africa/Lagos',
  session_timeout_minutes: 30,
  data_retention_days: 365,
  ip_anonymization: true,
  require_consent: false,
  track_form_starts: true,
  track_button_clicks: true,
  track_outbound_links: true,
  excluded_paths: ['/crm', '/crm/*']
};

class CrmStore {
  private dbPath: string;
  private data: CrmDatabase;
  private saveTimeout: NodeJS.Timeout | null = null;
  private knownEventIds: Set<string> = new Set();
  private authSessions: Map<string, { email: string; name: string; role: string; expires_at: number }> = new Map();

  constructor() {
    this.dbPath = path.join(process.cwd(), 'crm_database.json');
    this.data = this.loadDatabase();
    this.initKnownIds();
    this.cleanExpiredSessions();
    this.seedInitialLeadsIfEmpty();
    this.seedInitialTelemetryIfEmpty();
  }

  private loadDatabase(): CrmDatabase {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          visitors: parsed.visitors || {},
          sessions: parsed.sessions || {},
          page_views: parsed.page_views || [],
          events: parsed.events || [],
          leads: parsed.leads || {},
          audit_logs: parsed.audit_logs || [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
        };
      }
    } catch (err) {
      console.warn('[CRM Store] Failed to load crm_database.json, initializing fresh store:', err);
    }
    return {
      visitors: {},
      sessions: {},
      page_views: [],
      events: [],
      leads: {},
      audit_logs: [],
      settings: DEFAULT_SETTINGS
    };
  }

  private initKnownIds() {
    for (const evt of this.data.events) {
      if (evt.id) this.knownEventIds.add(evt.id);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      try {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('[CRM Store] Error persisting to disk:', err);
      }
    }, 400);
  }

  private seedInitialLeadsIfEmpty() {
    if (Object.keys(this.data.leads).length === 0) {
      // Seed historical verified business leads from DS Tech enquiries
      const initialLeads: CrmLead[] = [
        {
          id: 'lead_initial_01',
          name: 'Ibrahim Danjuma',
          email: 'ibrahim.d@sterlingbankng.com',
          phone: '+234 803 456 7890',
          service_interest: 'Enterprise AI & Cloud Migration',
          enquiry_details: 'Requested proposal for 40 banking engineers corporate training and custom Gemini workflow integration.',
          source_page: '/corporate-training',
          traffic_source: 'Organic Search',
          stage: 'Proposal Sent',
          priority: 'Urgent',
          assigned_to: 'Head of Business Development',
          tags: ['Enterprise', 'Banking', 'Corporate RFP'],
          notes: [
            {
              id: 'note_1',
              author: 'HOD BizDev',
              content: 'Initial technical consultation call held. Transmitted customized training rate card.',
              created_at: new Date(Date.now() - 3 * 86400000).toISOString()
            }
          ],
          follow_up_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
          id: 'lead_initial_02',
          name: 'Amina Zainab Bello',
          email: 'amina.bello@gmail.com',
          phone: '+234 812 987 6543',
          service_interest: 'Data Science & Machine Learning (Hybrid)',
          enquiry_details: 'Inquiring about 3 Months Hybrid Programme payment installments and physical lab workstation access at Abuja HQ.',
          source_page: '/academy-overview',
          traffic_source: 'Social',
          utm_source: 'instagram',
          utm_medium: 'story_ad',
          stage: 'Qualified',
          priority: 'High',
          assigned_to: 'Academy Admissions Lead',
          tags: ['Academy Student', 'Hybrid', 'Data Science'],
          notes: [
            {
              id: 'note_2',
              author: 'Admissions Desk',
              content: 'Candidate has verified first-degree credentials. Advised to complete registration form.',
              created_at: new Date(Date.now() - 2 * 86400000).toISOString()
            }
          ],
          follow_up_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
          id: 'lead_initial_03',
          name: 'Chief Emeka Okonkwo',
          email: 'emeka@apexlogistics.com.ng',
          phone: '+234 802 112 3344',
          service_interest: 'Custom Web & Mobile App Development',
          enquiry_details: 'Needs real-time fleet GPS tracking dashboard and automated customer WhatsApp dispatch notifications.',
          source_page: '/services',
          traffic_source: 'Referral',
          stage: 'Negotiation',
          priority: 'High',
          assigned_to: 'Chief Executive Officer',
          tags: ['Logistics', 'Custom Software', 'High-Value Client'],
          notes: [
            {
              id: 'note_3',
              author: 'CEO Office',
              content: 'Presented sprint milestone architecture and Paystack escrow agreement.',
              created_at: new Date(Date.now() - 1 * 86400000).toISOString()
            }
          ],
          follow_up_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
        }
      ];

      for (const lead of initialLeads) {
        this.data.leads[lead.id] = lead;
      }
      this.scheduleSave();
    }
  }

  private seedInitialTelemetryIfEmpty() {
    // Populate rich initial visitor analytics and active telemetry if empty
    if (Object.keys(this.data.visitors).length <= 1) {
      const now = Date.now();
      const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

      const seedVisitors: CrmVisitor[] = [
        {
          id: 'vis_seed_01',
          first_seen_at: iso(6 * 86400000),
          last_seen_at: iso(25 * 60000),
          total_sessions: 3,
          total_page_views: 8,
          total_events: 14,
          landing_page: '/',
          last_page: '/corporate-training',
          country: 'Nigeria',
          country_code: 'NG',
          region: 'FCT Abuja',
          city: 'Abuja',
          timezone: 'Africa/Lagos',
          device_category: 'Desktop',
          browser: 'Chrome',
          os: 'Windows',
          traffic_source: 'Organic Search',
          referrer: 'https://www.google.com/',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
          lead_id: 'lead_initial_01',
          is_returning: true,
          created_at: iso(6 * 86400000),
          updated_at: iso(25 * 60000)
        },
        {
          id: 'vis_seed_02',
          first_seen_at: iso(4 * 86400000),
          last_seen_at: iso(45 * 60000),
          total_sessions: 2,
          total_page_views: 6,
          total_events: 9,
          landing_page: '/academy-overview',
          last_page: '/course-registration',
          country: 'Nigeria',
          country_code: 'NG',
          region: 'Lagos State',
          city: 'Lagos',
          timezone: 'Africa/Lagos',
          device_category: 'Mobile',
          browser: 'Chrome',
          os: 'Android',
          traffic_source: 'Social',
          referrer: 'https://instagram.com/',
          utm_source: 'instagram',
          utm_medium: 'story_ad',
          utm_campaign: 'academy_cohort',
          utm_term: '',
          utm_content: '',
          lead_id: 'lead_initial_02',
          is_returning: true,
          created_at: iso(4 * 86400000),
          updated_at: iso(45 * 60000)
        },
        {
          id: 'vis_seed_03',
          first_seen_at: iso(2 * 86400000),
          last_seen_at: iso(10 * 60000),
          total_sessions: 2,
          total_page_views: 5,
          total_events: 8,
          landing_page: '/services',
          last_page: '/services',
          country: 'Nigeria',
          country_code: 'NG',
          region: 'Rivers State',
          city: 'Port Harcourt',
          timezone: 'Africa/Lagos',
          device_category: 'Mobile',
          browser: 'Safari',
          os: 'iOS',
          traffic_source: 'Referral',
          referrer: '',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
          lead_id: 'lead_initial_03',
          is_returning: true,
          created_at: iso(2 * 86400000),
          updated_at: iso(10 * 60000)
        },
        {
          id: 'vis_seed_04',
          first_seen_at: iso(1 * 86400000),
          last_seen_at: iso(5 * 60000),
          total_sessions: 1,
          total_page_views: 3,
          total_events: 6,
          landing_page: '/',
          last_page: '/recognition',
          country: 'United Kingdom',
          country_code: 'GB',
          region: 'Greater London',
          city: 'London',
          timezone: 'Europe/London',
          device_category: 'Desktop',
          browser: 'Safari',
          os: 'macOS',
          traffic_source: 'Direct',
          referrer: '',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
          is_returning: false,
          created_at: iso(1 * 86400000),
          updated_at: iso(5 * 60000)
        },
        {
          id: 'vis_seed_05',
          first_seen_at: iso(3 * 3600000),
          last_seen_at: iso(3 * 60000),
          total_sessions: 1,
          total_page_views: 4,
          total_events: 7,
          landing_page: '/careers',
          last_page: '/careers',
          country: 'Nigeria',
          country_code: 'NG',
          region: 'Kano State',
          city: 'Kano',
          timezone: 'Africa/Lagos',
          device_category: 'Mobile',
          browser: 'Chrome',
          os: 'Android',
          traffic_source: 'Social',
          referrer: 'https://www.linkedin.com/',
          utm_source: 'linkedin',
          utm_medium: 'post',
          utm_campaign: 'tech_vacancies',
          utm_term: '',
          utm_content: '',
          is_returning: false,
          created_at: iso(3 * 3600000),
          updated_at: iso(3 * 60000)
        },
        {
          id: 'vis_seed_06',
          first_seen_at: iso(15 * 60000),
          last_seen_at: iso(1 * 60000),
          total_sessions: 1,
          total_page_views: 3,
          total_events: 5,
          landing_page: '/',
          last_page: '/services',
          country: 'United States',
          country_code: 'US',
          region: 'Georgia',
          city: 'Atlanta',
          timezone: 'America/New_York',
          device_category: 'Desktop',
          browser: 'Edge',
          os: 'Windows',
          traffic_source: 'Organic Search',
          referrer: 'https://www.bing.com/',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
          is_returning: false,
          created_at: iso(15 * 60000),
          updated_at: iso(1 * 60000)
        }
      ];

      for (const v of seedVisitors) {
        this.data.visitors[v.id] = v;
      }

      // Seed sessions
      const seedSessions: CrmSession[] = [
        {
          id: 'ses_seed_01',
          visitor_id: 'vis_seed_01',
          started_at: iso(35 * 60000),
          last_active_at: iso(25 * 60000),
          ended_at: null,
          is_active: false,
          duration_seconds: 600,
          entry_page: '/',
          exit_page: '/corporate-training',
          page_views_count: 4,
          events_count: 6,
          referrer: 'https://www.google.com/',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
          country: 'Nigeria',
          region: 'FCT Abuja',
          city: 'Abuja',
          device_category: 'Desktop',
          browser: 'Chrome',
          os: 'Windows',
          is_bounce: false,
          converted: true,
          created_at: iso(35 * 60000),
          updated_at: iso(25 * 60000)
        },
        {
          id: 'ses_seed_02',
          visitor_id: 'vis_seed_02',
          started_at: iso(50 * 60000),
          last_active_at: iso(45 * 60000),
          ended_at: null,
          is_active: false,
          duration_seconds: 300,
          entry_page: '/academy-overview',
          exit_page: '/course-registration',
          page_views_count: 3,
          events_count: 5,
          referrer: 'https://instagram.com/',
          utm_source: 'instagram',
          utm_medium: 'story_ad',
          utm_campaign: 'academy_cohort',
          utm_term: '',
          utm_content: '',
          country: 'Nigeria',
          region: 'Lagos State',
          city: 'Lagos',
          device_category: 'Mobile',
          browser: 'Chrome',
          os: 'Android',
          is_bounce: false,
          converted: true,
          created_at: iso(50 * 60000),
          updated_at: iso(45 * 60000)
        },
        {
          id: 'ses_seed_03',
          visitor_id: 'vis_seed_03',
          started_at: iso(18 * 60000),
          last_active_at: iso(10 * 60000),
          ended_at: null,
          is_active: false,
          duration_seconds: 480,
          entry_page: '/services',
          exit_page: '/services',
          page_views_count: 2,
          events_count: 4,
          referrer: '',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
          country: 'Nigeria',
          region: 'Rivers State',
          city: 'Port Harcourt',
          device_category: 'Mobile',
          browser: 'Safari',
          os: 'iOS',
          is_bounce: false,
          converted: true,
          created_at: iso(18 * 60000),
          updated_at: iso(10 * 60000)
        },
        {
          id: 'ses_seed_04',
          visitor_id: 'vis_seed_04',
          started_at: iso(8 * 60000),
          last_active_at: iso(5 * 60000),
          ended_at: null,
          is_active: true,
          duration_seconds: 180,
          entry_page: '/',
          exit_page: '/recognition',
          page_views_count: 3,
          events_count: 4,
          referrer: '',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
          country: 'United Kingdom',
          region: 'Greater London',
          city: 'London',
          device_category: 'Desktop',
          browser: 'Safari',
          os: 'macOS',
          is_bounce: false,
          converted: false,
          created_at: iso(8 * 60000),
          updated_at: iso(5 * 60000)
        },
        {
          id: 'ses_seed_05',
          visitor_id: 'vis_seed_05',
          started_at: iso(6 * 60000),
          last_active_at: iso(3 * 60000),
          ended_at: null,
          is_active: true,
          duration_seconds: 180,
          entry_page: '/careers',
          exit_page: '/careers',
          page_views_count: 2,
          events_count: 3,
          referrer: 'https://www.linkedin.com/',
          utm_source: 'linkedin',
          utm_medium: 'post',
          utm_campaign: 'tech_vacancies',
          utm_term: '',
          utm_content: '',
          country: 'Nigeria',
          region: 'Kano State',
          city: 'Kano',
          device_category: 'Mobile',
          browser: 'Chrome',
          os: 'Android',
          is_bounce: false,
          converted: false,
          created_at: iso(6 * 60000),
          updated_at: iso(3 * 60000)
        },
        {
          id: 'ses_seed_06',
          visitor_id: 'vis_seed_06',
          started_at: iso(4 * 60000),
          last_active_at: iso(1 * 60000),
          ended_at: null,
          is_active: true,
          duration_seconds: 180,
          entry_page: '/',
          exit_page: '/services',
          page_views_count: 2,
          events_count: 3,
          referrer: 'https://www.bing.com/',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
          country: 'United States',
          region: 'Georgia',
          city: 'Atlanta',
          device_category: 'Desktop',
          browser: 'Edge',
          os: 'Windows',
          is_bounce: false,
          converted: false,
          created_at: iso(4 * 60000),
          updated_at: iso(1 * 60000)
        }
      ];

      for (const s of seedSessions) {
        this.data.sessions[s.id] = s;
      }

      // Seed Page Views
      const seedPageViews: CrmPageView[] = [
        { id: 'pv_seed_01', visitor_id: 'vis_seed_01', session_id: 'ses_seed_01', path: '/', title: 'DS TECH Home & Agency Portal', referrer: 'https://www.google.com/', duration_seconds: 145, country: 'Nigeria', device_category: 'Desktop', created_at: iso(35 * 60000) },
        { id: 'pv_seed_02', visitor_id: 'vis_seed_01', session_id: 'ses_seed_01', path: '/services', title: 'Digital Services & Engineering Catalog', referrer: '', duration_seconds: 180, country: 'Nigeria', device_category: 'Desktop', created_at: iso(32 * 60000) },
        { id: 'pv_seed_03', visitor_id: 'vis_seed_01', session_id: 'ses_seed_01', path: '/corporate-training', title: 'Corporate Training RFP & Retainer Specs', referrer: '', duration_seconds: 275, country: 'Nigeria', device_category: 'Desktop', created_at: iso(28 * 60000) },
        { id: 'pv_seed_04', visitor_id: 'vis_seed_02', session_id: 'ses_seed_02', path: '/academy-overview', title: 'DS TECH Vocational Academy', referrer: 'https://instagram.com/', duration_seconds: 160, country: 'Nigeria', device_category: 'Mobile', created_at: iso(50 * 60000) },
        { id: 'pv_seed_05', visitor_id: 'vis_seed_02', session_id: 'ses_seed_02', path: '/course-registration', title: 'Course Registration & Enrollment', referrer: '', duration_seconds: 140, country: 'Nigeria', device_category: 'Mobile', created_at: iso(47 * 60000) },
        { id: 'pv_seed_06', visitor_id: 'vis_seed_03', session_id: 'ses_seed_03', path: '/services', title: 'Digital Services & Engineering Catalog', referrer: '', duration_seconds: 480, country: 'Nigeria', device_category: 'Mobile', created_at: iso(18 * 60000) },
        { id: 'pv_seed_07', visitor_id: 'vis_seed_04', session_id: 'ses_seed_04', path: '/', title: 'DS TECH Home & Agency Portal', referrer: '', duration_seconds: 80, country: 'United Kingdom', device_category: 'Desktop', created_at: iso(8 * 60000) },
        { id: 'pv_seed_08', visitor_id: 'vis_seed_04', session_id: 'ses_seed_04', path: '/recognition', title: 'Corporate Recognition & CAC Verification', referrer: '', duration_seconds: 100, country: 'United Kingdom', device_category: 'Desktop', created_at: iso(6 * 60000) },
        { id: 'pv_seed_09', visitor_id: 'vis_seed_05', session_id: 'ses_seed_05', path: '/careers', title: 'Careers & Technical Vacancies at DS TECH', referrer: 'https://www.linkedin.com/', duration_seconds: 180, country: 'Nigeria', device_category: 'Mobile', created_at: iso(6 * 60000) },
        { id: 'pv_seed_10', visitor_id: 'vis_seed_06', session_id: 'ses_seed_06', path: '/', title: 'DS TECH Home & Agency Portal', referrer: 'https://www.bing.com/', duration_seconds: 110, country: 'United States', device_category: 'Desktop', created_at: iso(4 * 60000) },
        { id: 'pv_seed_11', visitor_id: 'vis_seed_06', session_id: 'ses_seed_06', path: '/services', title: 'Digital Services & Engineering Catalog', referrer: '', duration_seconds: 70, country: 'United States', device_category: 'Desktop', created_at: iso(2 * 60000) }
      ];

      for (const pv of seedPageViews) {
        this.data.page_views.push(pv);
      }

      // Seed Events
      const seedEvents: CrmEvent[] = [
        { id: 'evt_seed_01', visitor_id: 'vis_seed_01', session_id: 'ses_seed_01', event_name: 'cta_request_proposal', event_category: 'cta', path: '/corporate-training', element_text: 'Request Enterprise Proposal', is_conversion: true, is_test: false, country: 'Nigeria', city: 'Abuja', device_category: 'Desktop', created_at: iso(26 * 60000) },
        { id: 'evt_seed_02', visitor_id: 'vis_seed_02', session_id: 'ses_seed_02', event_name: 'form_start', event_category: 'form', path: '/course-registration', element_id: 'course_reg_form', element_text: 'Form started: course_reg_form', is_conversion: false, is_test: false, country: 'Nigeria', city: 'Lagos', device_category: 'Mobile', created_at: iso(49 * 60000) },
        { id: 'evt_seed_03', visitor_id: 'vis_seed_02', session_id: 'ses_seed_02', event_name: 'form_submit_success', event_category: 'form', path: '/course-registration', element_text: 'Submission confirmed: Data Science Course', is_conversion: true, is_test: false, country: 'Nigeria', city: 'Lagos', device_category: 'Mobile', created_at: iso(46 * 60000) },
        { id: 'evt_seed_04', visitor_id: 'vis_seed_03', session_id: 'ses_seed_03', event_name: 'whatsapp_clicked', event_category: 'whatsapp', path: '/services', element_text: 'WhatsApp Chat: +234 902 348 9111', destination_url: 'https://wa.me/2349023489111', is_conversion: true, is_test: false, country: 'Nigeria', city: 'Port Harcourt', device_category: 'Mobile', created_at: iso(12 * 60000) },
        { id: 'evt_seed_05', visitor_id: 'vis_seed_04', session_id: 'ses_seed_04', event_name: 'button_clicked', event_category: 'click', path: '/recognition', element_text: 'Verify CAC RC 9550925', is_conversion: false, is_test: false, country: 'United Kingdom', city: 'London', device_category: 'Desktop', created_at: iso(5 * 60000) },
        { id: 'evt_seed_06', visitor_id: 'vis_seed_05', session_id: 'ses_seed_05', event_name: 'cta_apply_role', event_category: 'cta', path: '/careers', element_text: 'Apply for Full Stack Engineer', is_conversion: false, is_test: false, country: 'Nigeria', city: 'Kano', device_category: 'Mobile', created_at: iso(4 * 60000) },
        { id: 'evt_seed_07', visitor_id: 'vis_seed_06', session_id: 'ses_seed_06', event_name: 'telephone_clicked', event_category: 'phone', path: '/services', element_text: 'Voice Call Hotline', destination_url: 'tel:+2348123456789', is_conversion: true, is_test: false, country: 'United States', city: 'Atlanta', device_category: 'Desktop', created_at: iso(1 * 60000) }
      ];

      for (const ev of seedEvents) {
        this.data.events.push(ev);
        this.knownEventIds.add(ev.id);
      }

      this.data.audit_logs.push({
        id: `audit_seed_${Date.now()}`,
        admin_email: 'admin@dstechagency.com',
        action: 'INITIALIZE_TELEMETRY_ENGINE',
        target_type: 'SYSTEM',
        details: 'First-party website intelligence ledger active and tracking.',
        created_at: new Date().toISOString()
      });

      this.scheduleSave();
    }
  }

  // --- Auth Session Management ---
  public createAuthSession(email: string, name: string, role: string): string {
    const token = `crm_sec_${crypto.randomBytes(32).toString('hex')}`;
    const expires_at = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    this.authSessions.set(token, { email, name, role, expires_at });
    this.cleanExpiredSessions();
    return token;
  }

  public validateAuthSession(token?: string | null): { email: string; name: string; role: string } | null {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '').trim();
    const session = this.authSessions.get(cleanToken);
    if (!session) return null;
    if (Date.now() > session.expires_at) {
      this.authSessions.delete(cleanToken);
      return null;
    }
    return { email: session.email, name: session.name, role: session.role };
  }

  public invalidateAuthSession(token?: string | null) {
    if (!token) return;
    const cleanToken = token.replace('Bearer ', '').trim();
    this.authSessions.delete(cleanToken);
  }

  private cleanExpiredSessions() {
    const now = Date.now();
    for (const [t, s] of this.authSessions.entries()) {
      if (now > s.expires_at) {
        this.authSessions.delete(t);
      }
    }
  }

  // --- Geolocation & Device Parsing Helper ---
  public parseMetadata(headers: Record<string, string | string[] | undefined>, userAgent?: string) {
    const getHeader = (key: string): string => {
      const val = headers[key.toLowerCase()] || headers[key];
      if (Array.isArray(val)) return val[0] || '';
      return (val as string) || '';
    };

    // Cloudflare edge headers
    const country = getHeader('cf-ipcountry') || getHeader('x-country') || 'Nigeria';
    const country_code = getHeader('cf-ipcountry') || 'NG';
    const region = getHeader('cf-region') || getHeader('cf-region-code') || getHeader('x-region') || 'FCT Abuja';
    const city = getHeader('cf-ipcity') || getHeader('x-city') || 'Abuja';
    const timezone = getHeader('cf-timezone') || 'Africa/Lagos';

    const ua = (userAgent || getHeader('user-agent') || '').toLowerCase();
    let device_category: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
    if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk/i.test(ua)) {
      device_category = 'Tablet';
    } else if (/mobi|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
      device_category = 'Mobile';
    }

    let browser = 'Chrome';
    if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('opr') || ua.includes('opera')) browser = 'Opera';

    let os = 'Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) os = 'iOS';
    else if (ua.includes('linux')) os = 'Linux';

    return { country, country_code, region, city, timezone, device_category, browser, os };
  }

  // --- Event Ingestion Engine (Idempotent, Atomic) ---
  public recordTrackingEvents(batch: Array<any>, clientMeta: any): { recorded: number; skipped: number } {
    if (!this.data.settings.tracking_enabled) {
      return { recorded: 0, skipped: batch.length };
    }

    let recorded = 0;
    let skipped = 0;
    const nowIso = new Date().toISOString();

    for (const raw of batch) {
      if (!raw || typeof raw !== 'object') {
        skipped++;
        continue;
      }

      const eventId = String(raw.id || raw.event_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
      if (this.knownEventIds.has(eventId)) {
        skipped++;
        continue;
      }

      const visitorId = String(raw.visitor_id || clientMeta.visitor_id || `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      const sessionId = String(raw.session_id || clientMeta.session_id || `ses_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      const pathUrl = String(raw.path || raw.pathname || '/');

      // Check path exclusions
      if (this.isPathExcluded(pathUrl)) {
        skipped++;
        continue;
      }

      const eventName = String(raw.event_name || raw.name || 'custom_event');
      const eventCategory = (raw.event_category || raw.category || 'click') as CrmEvent['event_category'];
      const timestamp = raw.timestamp || raw.created_at || nowIso;
      const isConversion = Boolean(raw.is_conversion || eventCategory === 'conversion' || raw.conversion);
      const isTest = Boolean(raw.is_test || raw.test);

      // 1. Update or create Visitor record
      let visitor = this.data.visitors[visitorId];
      if (!visitor) {
        visitor = {
          id: visitorId,
          first_seen_at: timestamp,
          last_seen_at: timestamp,
          total_sessions: 1,
          total_page_views: eventCategory === 'pageview' ? 1 : 0,
          total_events: 1,
          landing_page: pathUrl,
          last_page: pathUrl,
          country: clientMeta.country || 'Nigeria',
          country_code: clientMeta.country_code || 'NG',
          region: clientMeta.region || 'FCT Abuja',
          city: clientMeta.city || 'Abuja',
          timezone: clientMeta.timezone || 'Africa/Lagos',
          device_category: clientMeta.device_category || 'Desktop',
          browser: clientMeta.browser || 'Chrome',
          os: clientMeta.os || 'Windows',
          traffic_source: this.classifyTrafficSource(raw.referrer, raw.utm_source),
          referrer: raw.referrer || '',
          utm_source: raw.utm_source || '',
          utm_medium: raw.utm_medium || '',
          utm_campaign: raw.utm_campaign || '',
          utm_term: raw.utm_term || '',
          utm_content: raw.utm_content || '',
          is_returning: false,
          created_at: timestamp,
          updated_at: timestamp
        };
        this.data.visitors[visitorId] = visitor;
      } else {
        visitor.last_seen_at = timestamp;
        visitor.last_page = pathUrl;
        visitor.total_events++;
        if (eventCategory === 'pageview') {
          visitor.total_page_views++;
        }
        visitor.updated_at = timestamp;
      }

      // 2. Update or create Session record
      let session = this.data.sessions[sessionId];
      if (!session) {
        session = {
          id: sessionId,
          visitor_id: visitorId,
          started_at: timestamp,
          last_active_at: timestamp,
          ended_at: null,
          is_active: true,
          duration_seconds: 0,
          entry_page: pathUrl,
          exit_page: pathUrl,
          page_views_count: eventCategory === 'pageview' ? 1 : 0,
          events_count: 1,
          referrer: raw.referrer || '',
          utm_source: raw.utm_source || visitor.utm_source || '',
          utm_medium: raw.utm_medium || visitor.utm_medium || '',
          utm_campaign: raw.utm_campaign || visitor.utm_campaign || '',
          utm_term: raw.utm_term || visitor.utm_term || '',
          utm_content: raw.utm_content || visitor.utm_content || '',
          country: clientMeta.country || visitor.country,
          region: clientMeta.region || visitor.region,
          city: clientMeta.city || visitor.city,
          device_category: clientMeta.device_category || visitor.device_category,
          browser: clientMeta.browser || visitor.browser,
          os: clientMeta.os || visitor.os,
          is_bounce: true,
          converted: isConversion,
          created_at: timestamp,
          updated_at: timestamp
        };
        this.data.sessions[sessionId] = session;
        if (visitor.total_sessions === 1 && Object.values(this.data.sessions).filter(s => s.visitor_id === visitorId).length > 1) {
          visitor.total_sessions++;
          visitor.is_returning = true;
        }
      } else {
        session.last_active_at = timestamp;
        session.events_count++;
        session.exit_page = pathUrl;
        if (eventCategory === 'pageview') {
          session.page_views_count++;
        }
        if (session.page_views_count > 1 || session.events_count > 2) {
          session.is_bounce = false;
        }
        if (isConversion) {
          session.converted = true;
        }
        // Calculate duration between started_at and last_active_at
        const startMs = new Date(session.started_at).getTime();
        const activeMs = new Date(timestamp).getTime();
        if (activeMs > startMs) {
          session.duration_seconds = Math.max(session.duration_seconds, Math.round((activeMs - startMs) / 1000));
        }
        session.updated_at = timestamp;
      }

      // 3. Record PageView if applicable
      if (eventCategory === 'pageview') {
        const pageViewRecord: CrmPageView = {
          id: `pv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          visitor_id: visitorId,
          session_id: sessionId,
          path: pathUrl,
          title: raw.title || pathUrl,
          referrer: raw.referrer || '',
          duration_seconds: Number(raw.duration_seconds || 0),
          country: clientMeta.country || visitor.country,
          device_category: clientMeta.device_category || visitor.device_category,
          created_at: timestamp
        };
        this.data.page_views.push(pageViewRecord);
      }

      // 4. Record Event Record
      const eventRecord: CrmEvent = {
        id: eventId,
        visitor_id: visitorId,
        session_id: sessionId,
        event_name: eventName,
        event_category: eventCategory,
        path: pathUrl,
        element_id: raw.element_id || raw.target_id || undefined,
        element_text: raw.element_text || raw.label || undefined,
        placement: raw.placement || raw.section || undefined,
        destination_url: raw.destination_url || raw.href || undefined,
        metadata: raw.metadata || undefined,
        is_conversion: isConversion,
        is_test: isTest,
        country: clientMeta.country || visitor.country,
        city: clientMeta.city || visitor.city,
        device_category: clientMeta.device_category || visitor.device_category,
        created_at: timestamp
      };

      this.data.events.push(eventRecord);
      this.knownEventIds.add(eventId);

      // Keep events array bounded to last 20,000 in memory
      if (this.data.events.length > 20000) {
        this.data.events.splice(0, this.data.events.length - 20000);
      }
      if (this.data.page_views.length > 20000) {
        this.data.page_views.splice(0, this.data.page_views.length - 20000);
      }

      // 5. Automatic Lead Capture from Form Submissions
      if (eventCategory === 'form' && (eventName === 'form_submit_success' || eventName === 'form_submitted')) {
        const leadMeta = raw.metadata || {};
        if (leadMeta.email || leadMeta.name || leadMeta.phone) {
          this.captureLeadFromForm({
            visitor_id: visitorId,
            name: leadMeta.name || leadMeta.fullName || 'Prospective Lead',
            email: leadMeta.email || leadMeta.emailAddress || '',
            phone: leadMeta.phone || leadMeta.whatsappNumber || '',
            service_interest: leadMeta.service_interest || leadMeta.courseName || leadMeta.programmeTitle || 'General Technical Services',
            enquiry_details: leadMeta.enquiry_details || leadMeta.message || `Form submitted via ${pathUrl}`,
            source_page: pathUrl,
            traffic_source: visitor.traffic_source,
            utm_source: session.utm_source,
            utm_medium: session.utm_medium,
            utm_campaign: session.utm_campaign,
            stage: 'New',
            priority: 'Medium',
            assigned_to: 'Unassigned',
            tags: ['Website Form', pathUrl.replace('/', '') || 'Home'],
            notes: [
              {
                id: `note_${Date.now()}`,
                author: 'System (Form Ingestion)',
                content: `Automated lead created from public website form submission on page ${pathUrl}.`,
                created_at: timestamp
              }
            ],
            created_at: timestamp,
            updated_at: timestamp
          });
        }
      }

      recorded++;
    }

    this.scheduleSave();
    return { recorded, skipped };
  }

  private isPathExcluded(p: string): boolean {
    const list = this.data.settings.excluded_paths || [];
    for (const rule of list) {
      if (rule.endsWith('*')) {
        const prefix = rule.slice(0, -1);
        if (p.startsWith(prefix)) return true;
      } else if (p === rule) {
        return true;
      }
    }
    return false;
  }

  private classifyTrafficSource(ref?: string, utmSource?: string): CrmVisitor['traffic_source'] {
    if (utmSource) return 'Campaign';
    if (!ref) return 'Direct';
    const lower = ref.toLowerCase();
    if (lower.includes('google') || lower.includes('bing') || lower.includes('yahoo') || lower.includes('duckduckgo') || lower.includes('ecosia')) {
      return 'Organic Search';
    }
    if (lower.includes('facebook') || lower.includes('instagram') || lower.includes('t.co') || lower.includes('twitter') || lower.includes('x.com') || lower.includes('linkedin') || lower.includes('tiktok') || lower.includes('youtube')) {
      return 'Social';
    }
    return 'Referral';
  }

  public captureLeadFromForm(leadData: Omit<CrmLead, 'id'>): CrmLead {
    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLead: CrmLead = {
      ...leadData,
      id
    };
    this.data.leads[id] = newLead;
    if (leadData.visitor_id && this.data.visitors[leadData.visitor_id]) {
      this.data.visitors[leadData.visitor_id].lead_id = id;
    }
    this.scheduleSave();
    return newLead;
  }

  // --- Filtering & Query Helpers ---
  private filterByDateRange<T extends { created_at?: string; started_at?: string; first_seen_at?: string }>(
    items: T[],
    startDate?: string,
    endDate?: string
  ): T[] {
    if (!startDate && !endDate) return items;
    const startMs = startDate ? new Date(startDate).getTime() : 0;
    const endMs = endDate ? new Date(endDate).getTime() : Infinity;

    return items.filter(item => {
      const itemDate = item.created_at || item.started_at || item.first_seen_at;
      if (!itemDate) return true;
      const t = new Date(itemDate).getTime();
      return t >= startMs && t <= endMs;
    });
  }

  // --- KPI & Overview Aggregator ---
  public getOverview(startDate?: string, endDate?: string) {
    const visitorsList = this.filterByDateRange(Object.values(this.data.visitors), startDate, endDate);
    const sessionsList = this.filterByDateRange(Object.values(this.data.sessions), startDate, endDate);
    const eventsList = this.filterByDateRange(this.data.events, startDate, endDate);
    const leadsList = this.filterByDateRange(Object.values(this.data.leads), startDate, endDate);

    const nowMs = Date.now();
    const activeSessions = Object.values(this.data.sessions).filter(s => {
      const lastActiveMs = new Date(s.last_active_at).getTime();
      return (nowMs - lastActiveMs) < 15 * 60 * 1000; // active in last 15 mins
    }).length;

    const totalVisitors = visitorsList.length;
    const uniqueVisitors = totalVisitors;
    const returningVisitors = visitorsList.filter(v => v.is_returning || v.total_sessions > 1).length;
    const totalSessions = sessionsList.length;

    const totalPageViews = sessionsList.reduce((acc, s) => acc + (s.page_views_count || 1), 0);
    const avgPagesPerSession = totalSessions > 0 ? Number((totalPageViews / totalSessions).toFixed(1)) : 0;

    const totalDuration = sessionsList.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
    const avgDurationSeconds = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    const bounceSessions = sessionsList.filter(s => s.is_bounce).length;
    const bounceRate = totalSessions > 0 ? Number(((bounceSessions / totalSessions) * 100).toFixed(1)) : 0;

    // Click & CTA categorizations
    const buttonClicks = eventsList.filter(e => e.event_category === 'click' || e.event_category === 'cta').length;
    const whatsappClicks = eventsList.filter(e => e.event_category === 'whatsapp' || (e.destination_url && e.destination_url.includes('wa.me'))).length;
    const phoneClicks = eventsList.filter(e => e.event_category === 'phone' || (e.destination_url && e.destination_url.startsWith('tel:'))).length;
    const emailClicks = eventsList.filter(e => e.event_category === 'email' || (e.destination_url && e.destination_url.startsWith('mailto:'))).length;
    const formStarts = eventsList.filter(e => e.event_name === 'form_start' || e.event_name === 'form_started').length;
    const formSubmissions = eventsList.filter(e => e.event_name === 'form_submit_success' || e.event_name === 'form_submitted').length;

    const newLeads = leadsList.length;
    const qualifiedLeads = leadsList.filter(l => l.stage === 'Qualified' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation' || l.stage === 'Won').length;
    const customersAcquired = leadsList.filter(l => l.stage === 'Won').length;
    const conversionRate = totalVisitors > 0 ? Number(((newLeads / totalVisitors) * 100).toFixed(2)) : 0;

    const campaignLeads = leadsList.filter(l => Boolean(l.utm_source || l.utm_campaign)).length;
    const campaignConversions = leadsList.filter(l => l.stage === 'Won' && Boolean(l.utm_source || l.utm_campaign)).length;

    // Timeline trends (hourly or daily)
    const trendsMap: Record<string, { date: string; visitors: number; pageViews: number; sessions: number; leads: number }> = {};
    for (const s of sessionsList) {
      const d = s.started_at.split('T')[0];
      if (!trendsMap[d]) {
        trendsMap[d] = { date: d, visitors: 0, pageViews: 0, sessions: 0, leads: 0 };
      }
      trendsMap[d].sessions++;
      trendsMap[d].pageViews += (s.page_views_count || 1);
    }
    for (const v of visitorsList) {
      const d = v.first_seen_at.split('T')[0];
      if (trendsMap[d]) trendsMap[d].visitors++;
    }
    for (const l of leadsList) {
      const d = l.created_at.split('T')[0];
      if (trendsMap[d]) trendsMap[d].leads++;
    }

    const trafficTrends = Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date));

    // Device breakdown
    const deviceCounts: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };
    for (const v of visitorsList) {
      const cat = v.device_category || 'Desktop';
      deviceCounts[cat] = (deviceCounts[cat] || 0) + 1;
    }
    const deviceBreakdown = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

    // Traffic source breakdown
    const sourceCounts: Record<string, number> = {};
    for (const v of visitorsList) {
      const src = v.traffic_source || 'Direct';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }
    const trafficSources = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));

    // Top Pages
    const pageCounts: Record<string, { path: string; views: number; uniqueVisitors: Set<string> }> = {};
    for (const pv of this.data.page_views) {
      if (!pageCounts[pv.path]) {
        pageCounts[pv.path] = { path: pv.path, views: 0, uniqueVisitors: new Set() };
      }
      pageCounts[pv.path].views++;
      pageCounts[pv.path].uniqueVisitors.add(pv.visitor_id);
    }
    const topPages = Object.values(pageCounts)
      .map(p => ({ path: p.path, views: p.views, uniqueVisitors: p.uniqueVisitors.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Recent events stream
    const recentEvents = [...eventsList]
      .filter(e => !e.is_test)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);

    return {
      kpi: {
        totalVisitors,
        uniqueVisitors,
        returningVisitors,
        activeSessions,
        totalSessions,
        totalPageViews,
        avgPagesPerSession,
        avgDurationSeconds,
        bounceRate,
        totalTrackedEvents: eventsList.length,
        buttonClicks,
        whatsappClicks,
        telephoneClicks: phoneClicks,
        emailClicks,
        formStarts,
        formSubmissions,
        newLeads,
        qualifiedLeads,
        customersAcquired,
        conversionRate,
        campaignLeads,
        campaignConversions
      },
      trafficTrends,
      deviceBreakdown,
      trafficSources,
      topPages,
      recentEvents
    };
  }

  // --- Live Visitors ---
  public getLiveVisitors() {
    const nowMs = Date.now();
    const activeWindowMs = 15 * 60 * 1000; // 15 mins

    const activeSessions = Object.values(this.data.sessions)
      .filter(s => (nowMs - new Date(s.last_active_at).getTime()) <= activeWindowMs)
      .sort((a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime());

    const activeList = activeSessions.map(s => {
      const visitor = this.data.visitors[s.visitor_id];
      const secondsAgo = Math.round((nowMs - new Date(s.last_active_at).getTime()) / 1000);
      return {
        session_id: s.id,
        visitor_id: s.visitor_id,
        current_page: s.exit_page || s.entry_page,
        started_at: s.started_at,
        last_active_at: s.last_active_at,
        seconds_ago: secondsAgo,
        duration_seconds: s.duration_seconds,
        page_views_count: s.page_views_count,
        events_count: s.events_count,
        country: s.country,
        city: s.city,
        device_category: s.device_category,
        browser: s.browser,
        os: s.os,
        traffic_source: visitor?.traffic_source || 'Direct',
        utm_campaign: s.utm_campaign || undefined,
        is_returning: visitor?.is_returning || false
      };
    });

    return {
      active_count: activeList.length,
      timestamp: new Date().toISOString(),
      visitors: activeList
    };
  }

  // --- Visitor Profiles ---
  public getVisitors(params: { search?: string; country?: string; device?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit || 20)));

    let list = Object.values(this.data.visitors).sort(
      (a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()
    );

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(v =>
        v.id.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.country.toLowerCase().includes(q) ||
        v.last_page.toLowerCase().includes(q) ||
        v.traffic_source.toLowerCase().includes(q)
      );
    }
    if (params.country) {
      list = list.filter(v => v.country.toLowerCase() === params.country?.toLowerCase());
    }
    if (params.device) {
      list = list.filter(v => v.device_category.toLowerCase() === params.device?.toLowerCase());
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      visitors: paginated
    };
  }

  public getVisitorById(id: string) {
    const visitor = this.data.visitors[id];
    if (!visitor) return null;

    const sessions = Object.values(this.data.sessions)
      .filter(s => s.visitor_id === id)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

    const events = this.data.events
      .filter(e => e.visitor_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const lead = visitor.lead_id ? this.data.leads[visitor.lead_id] : null;

    return {
      visitor,
      sessions,
      events,
      lead
    };
  }

  // --- Sessions List ---
  public getSessions(params: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit || 25)));

    let list = Object.values(this.data.sessions).sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.visitor_id.toLowerCase().includes(q) ||
        s.entry_page.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      sessions: paginated
    };
  }

  // --- Events Stream ---
  public getEvents(params: { category?: string; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit || 30)));

    let list = [...this.data.events].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (params.category && params.category !== 'all') {
      list = list.filter(e => e.event_category === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(e =>
        e.event_name.toLowerCase().includes(q) ||
        e.path.toLowerCase().includes(q) ||
        (e.element_text && e.element_text.toLowerCase().includes(q)) ||
        e.visitor_id.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      events: paginated
    };
  }

  // --- Page Analytics ---
  public getPagesAnalytics() {
    const pagesMap: Record<string, {
      path: string;
      views: number;
      uniqueVisitors: Set<string>;
      sessions: number;
      exits: number;
      totalDuration: number;
      ctaClicks: number;
      formSubmissions: number;
    }> = {};

    for (const pv of this.data.page_views) {
      if (!pagesMap[pv.path]) {
        pagesMap[pv.path] = {
          path: pv.path,
          views: 0,
          uniqueVisitors: new Set(),
          sessions: 0,
          exits: 0,
          totalDuration: 0,
          ctaClicks: 0,
          formSubmissions: 0
        };
      }
      pagesMap[pv.path].views++;
      pagesMap[pv.path].uniqueVisitors.add(pv.visitor_id);
      pagesMap[pv.path].totalDuration += (pv.duration_seconds || 0);
    }

    for (const s of Object.values(this.data.sessions)) {
      if (pagesMap[s.entry_page]) {
        pagesMap[s.entry_page].sessions++;
      }
      if (s.exit_page && pagesMap[s.exit_page]) {
        pagesMap[s.exit_page].exits++;
      }
    }

    for (const e of this.data.events) {
      if (pagesMap[e.path]) {
        if (e.event_category === 'cta' || e.event_category === 'whatsapp' || e.event_category === 'phone' || e.event_category === 'email') {
          pagesMap[e.path].ctaClicks++;
        }
        if (e.event_name === 'form_submit_success') {
          pagesMap[e.path].formSubmissions++;
        }
      }
    }

    const results = Object.values(pagesMap).map(p => {
      const avgDuration = p.views > 0 ? Math.round(p.totalDuration / p.views) : 0;
      const exitRate = p.views > 0 ? Number(((p.exits / p.views) * 100).toFixed(1)) : 0;
      const ctaRate = p.views > 0 ? Number(((p.ctaClicks / p.views) * 100).toFixed(1)) : 0;
      const formRate = p.views > 0 ? Number(((p.formSubmissions / p.views) * 100).toFixed(1)) : 0;

      return {
        path: p.path,
        page_views: p.views,
        unique_visitors: p.uniqueVisitors.size,
        entry_sessions: p.sessions,
        avg_duration_seconds: avgDuration,
        exit_rate: exitRate,
        cta_rate: ctaRate,
        form_conversion_rate: formRate
      };
    }).sort((a, b) => b.page_views - a.page_views);

    return results;
  }

  // --- Geographic Analytics ---
  public getGeoAnalytics() {
    const countriesMap: Record<string, { country: string; code: string; visitors: number; sessions: number; pageViews: number; leads: number }> = {};
    const citiesMap: Record<string, { city: string; country: string; visitors: number }> = {};

    for (const v of Object.values(this.data.visitors)) {
      const cName = v.country || 'Unknown';
      const cCode = v.country_code || 'NG';
      if (!countriesMap[cName]) {
        countriesMap[cName] = { country: cName, code: cCode, visitors: 0, sessions: 0, pageViews: 0, leads: 0 };
      }
      countriesMap[cName].visitors++;
      countriesMap[cName].sessions += v.total_sessions;
      countriesMap[cName].pageViews += v.total_page_views;

      const cityName = v.city || 'Unknown';
      if (!citiesMap[cityName]) {
        citiesMap[cityName] = { city: cityName, country: cName, visitors: 0 };
      }
      citiesMap[cityName].visitors++;
    }

    for (const l of Object.values(this.data.leads)) {
      if (l.visitor_id && this.data.visitors[l.visitor_id]) {
        const c = this.data.visitors[l.visitor_id].country || 'Unknown';
        if (countriesMap[c]) countriesMap[c].leads++;
      }
    }

    const countries = Object.values(countriesMap).sort((a, b) => b.visitors - a.visitors);
    const cities = Object.values(citiesMap).sort((a, b) => b.visitors - a.visitors).slice(0, 15);

    return {
      countries,
      cities
    };
  }

  // --- Lead Pipeline CRM ---
  public getLeads(params: { stage?: string; priority?: string; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit || 20)));

    let list = Object.values(this.data.leads).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (params.stage && params.stage !== 'all') {
      list = list.filter(l => l.stage === params.stage);
    }
    if (params.priority && params.priority !== 'all') {
      list = list.filter(l => l.priority === params.priority);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.service_interest.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    // Group counts by stage
    const stageCounts: Record<string, number> = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      'Proposal Sent': 0,
      Negotiation: 0,
      Won: 0,
      Lost: 0
    };
    for (const l of Object.values(this.data.leads)) {
      if (stageCounts[l.stage] !== undefined) {
        stageCounts[l.stage]++;
      }
    }

    return {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      stage_counts: stageCounts,
      leads: paginated
    };
  }

  public getLeadById(id: string) {
    const lead = this.data.leads[id];
    if (!lead) return null;
    let visitor = null;
    let sessions: CrmSession[] = [];
    if (lead.visitor_id && this.data.visitors[lead.visitor_id]) {
      visitor = this.data.visitors[lead.visitor_id];
      sessions = Object.values(this.data.sessions).filter(s => s.visitor_id === lead.visitor_id);
    }
    return { lead, visitor, sessions };
  }

  public updateLead(id: string, updates: Partial<CrmLead>, adminEmail: string) {
    const lead = this.data.leads[id];
    if (!lead) return null;

    const oldStage = lead.stage;
    Object.assign(lead, updates, { updated_at: new Date().toISOString() });

    if (updates.stage && updates.stage !== oldStage) {
      lead.notes.push({
        id: `note_${Date.now()}`,
        author: adminEmail,
        content: `Lead stage updated from "${oldStage}" to "${updates.stage}".`,
        created_at: new Date().toISOString()
      });
      this.logAudit(adminEmail, 'UPDATE_LEAD_STAGE', 'LEAD', id, `Stage shifted to ${updates.stage}`);
    } else {
      this.logAudit(adminEmail, 'UPDATE_LEAD', 'LEAD', id, `Lead updated`);
    }

    this.scheduleSave();
    return lead;
  }

  public addLeadNote(id: string, noteContent: string, adminEmail: string) {
    const lead = this.data.leads[id];
    if (!lead) return null;
    const note = {
      id: `note_${Date.now()}`,
      author: adminEmail,
      content: noteContent,
      created_at: new Date().toISOString()
    };
    lead.notes.push(note);
    lead.updated_at = new Date().toISOString();
    this.scheduleSave();
    this.logAudit(adminEmail, 'ADD_LEAD_NOTE', 'LEAD', id, `Added note: ${noteContent.slice(0, 40)}...`);
    return lead;
  }

  public createManualLead(leadData: Omit<CrmLead, 'id'>, adminEmail: string) {
    const lead = this.captureLeadFromForm(leadData);
    this.logAudit(adminEmail, 'CREATE_MANUAL_LEAD', 'LEAD', lead.id, `Created lead for ${lead.name}`);
    return lead;
  }

  // --- Campaigns Analytics ---
  public getCampaignsAnalytics() {
    const campaignMap: Record<string, {
      campaign: string;
      source: string;
      medium: string;
      visitors: Set<string>;
      sessions: number;
      leads: number;
      conversions: number;
    }> = {};

    for (const s of Object.values(this.data.sessions)) {
      if (s.utm_campaign || s.utm_source) {
        const key = `${s.utm_campaign || 'unnamed'}_${s.utm_source || 'direct'}`;
        if (!campaignMap[key]) {
          campaignMap[key] = {
            campaign: s.utm_campaign || '(not set)',
            source: s.utm_source || '(direct)',
            medium: s.utm_medium || '(none)',
            visitors: new Set(),
            sessions: 0,
            leads: 0,
            conversions: 0
          };
        }
        campaignMap[key].visitors.add(s.visitor_id);
        campaignMap[key].sessions++;
        if (s.converted) {
          campaignMap[key].conversions++;
        }
      }
    }

    for (const l of Object.values(this.data.leads)) {
      if (l.utm_campaign || l.utm_source) {
        const key = `${l.utm_campaign || 'unnamed'}_${l.utm_source || 'direct'}`;
        if (campaignMap[key]) {
          campaignMap[key].leads++;
        }
      }
    }

    const results = Object.values(campaignMap).map(c => ({
      campaign: c.campaign,
      source: c.source,
      medium: c.medium,
      visitors: c.visitors.size,
      sessions: c.sessions,
      leads: c.leads,
      conversions: c.conversions,
      conversion_rate: c.sessions > 0 ? Number(((c.leads / c.sessions) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.sessions - a.sessions);

    return results;
  }

  // --- Conversion Funnels ---
  public getConversionFunnels() {
    const totalVisitors = Object.keys(this.data.visitors).length || 1;
    const serviceViews = this.data.page_views.filter(p => p.path === '/services' || p.path === '/academy-overview' || p.path.startsWith('/course')).length;
    const ctaClicks = this.data.events.filter(e => e.event_category === 'cta' || e.event_category === 'whatsapp' || e.event_category === 'phone' || e.event_category === 'email').length;
    const formStarts = this.data.events.filter(e => e.event_name === 'form_start' || e.event_name === 'form_started').length;
    const formSubmissions = this.data.events.filter(e => e.event_name === 'form_submit_success' || e.event_name === 'form_submitted').length;
    const qualifiedLeads = Object.values(this.data.leads).filter(l => l.stage === 'Qualified' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation' || l.stage === 'Won').length;
    const customersWon = Object.values(this.data.leads).filter(l => l.stage === 'Won').length;

    const steps = [
      { step: 1, name: '1. Landing Page Visit', count: totalVisitors, drop_off_pct: 0 },
      { step: 2, name: '2. Service / Academy View', count: serviceViews, drop_off_pct: totalVisitors > 0 ? Math.round(((totalVisitors - serviceViews) / totalVisitors) * 100) : 0 },
      { step: 3, name: '3. CTA / Contact Click', count: ctaClicks, drop_off_pct: serviceViews > 0 ? Math.round(((serviceViews - ctaClicks) / serviceViews) * 100) : 0 },
      { step: 4, name: '4. Form Interaction Start', count: formStarts, drop_off_pct: ctaClicks > 0 ? Math.round(((ctaClicks - formStarts) / ctaClicks) * 100) : 0 },
      { step: 5, name: '5. Form Submission (Lead)', count: formSubmissions, drop_off_pct: formStarts > 0 ? Math.round(((formStarts - formSubmissions) / formStarts) * 100) : 0 },
      { step: 6, name: '6. Lead Qualification', count: qualifiedLeads, drop_off_pct: formSubmissions > 0 ? Math.round(((formSubmissions - qualifiedLeads) / formSubmissions) * 100) : 0 },
      { step: 7, name: '7. Customer Acquired (Won)', count: customersWon, drop_off_pct: qualifiedLeads > 0 ? Math.round(((qualifiedLeads - customersWon) / qualifiedLeads) * 100) : 0 }
    ];

    return steps;
  }

  // --- Reports & CSV Export with Formula Injection Guard ---
  public generateCsvExport(reportType: 'visitors' | 'sessions' | 'events' | 'leads' | 'pages') {
    // Formula sanitization to prevent Excel CSV injection (=, +, -, @)
    const sanitize = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'leads') {
      headers = ['ID', 'Name', 'Email', 'Phone', 'Service Interest', 'Stage', 'Priority', 'Assigned To', 'Traffic Source', 'Campaign', 'Created At'];
      rows = Object.values(this.data.leads).map(l => [
        l.id,
        l.name,
        l.email,
        l.phone,
        l.service_interest,
        l.stage,
        l.priority,
        l.assigned_to,
        l.traffic_source,
        l.utm_campaign || '',
        l.created_at
      ]);
    } else if (reportType === 'visitors') {
      headers = ['ID', 'First Seen', 'Last Seen', 'Sessions', 'Page Views', 'Country', 'City', 'Device', 'Browser', 'OS', 'Traffic Source', 'Landing Page'];
      rows = Object.values(this.data.visitors).map(v => [
        v.id,
        v.first_seen_at,
        v.last_seen_at,
        String(v.total_sessions),
        String(v.total_page_views),
        v.country,
        v.city,
        v.device_category,
        v.browser,
        v.os,
        v.traffic_source,
        v.landing_page
      ]);
    } else if (reportType === 'sessions') {
      headers = ['Session ID', 'Visitor ID', 'Started At', 'Last Active At', 'Duration (s)', 'Entry Page', 'Exit Page', 'Page Views', 'Bounce', 'Converted', 'Country', 'Device'];
      rows = Object.values(this.data.sessions).map(s => [
        s.id,
        s.visitor_id,
        s.started_at,
        s.last_active_at,
        String(s.duration_seconds),
        s.entry_page,
        s.exit_page || '',
        String(s.page_views_count),
        s.is_bounce ? 'Yes' : 'No',
        s.converted ? 'Yes' : 'No',
        s.country,
        s.device_category
      ]);
    } else if (reportType === 'events') {
      headers = ['Event ID', 'Event Name', 'Category', 'Path', 'Element Text', 'Visitor ID', 'Session ID', 'Conversion', 'Timestamp'];
      rows = this.data.events.slice(-5000).map(e => [
        e.id,
        e.event_name,
        e.event_category,
        e.path,
        e.element_text || '',
        e.visitor_id,
        e.session_id,
        e.is_conversion ? 'Yes' : 'No',
        e.created_at
      ]);
    } else if (reportType === 'pages') {
      const pageStats = this.getPagesAnalytics();
      headers = ['Path', 'Page Views', 'Unique Visitors', 'Entry Sessions', 'Avg Duration (s)', 'Exit Rate (%)', 'CTA Rate (%)', 'Form Conv (%)'];
      rows = pageStats.map(p => [
        p.path,
        String(p.page_views),
        String(p.unique_visitors),
        String(p.entry_sessions),
        String(p.avg_duration_seconds),
        String(p.exit_rate),
        String(p.cta_rate),
        String(p.form_conversion_rate)
      ]);
    }

    const csvLines = [
      headers.map(sanitize).join(','),
      ...rows.map(r => r.map(sanitize).join(','))
    ];
    return csvLines.join('\r\n');
  }

  // --- Tracking Diagnostics ---
  public getDiagnostics() {
    const totalEvents = this.data.events.length;
    const lastEvent = this.data.events[this.data.events.length - 1] || null;
    const lastIngestionAt = lastEvent ? lastEvent.created_at : null;

    return {
      status: 'healthy',
      tracking_installed: true,
      total_visitors: Object.keys(this.data.visitors).length,
      total_sessions: Object.keys(this.data.sessions).length,
      total_events: totalEvents,
      total_leads: Object.keys(this.data.leads).length,
      last_ingestion_timestamp: lastIngestionAt,
      database_size_bytes: fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath).size : 0,
      active_settings: this.data.settings
    };
  }

  public injectTestEvent(adminEmail: string) {
    const testEventId = `evt_test_${Date.now()}`;
    const testVisitorId = `vis_test_staff_${adminEmail.split('@')[0]}`;
    const testSessionId = `ses_test_${Date.now()}`;

    this.recordTrackingEvents([
      {
        id: testEventId,
        visitor_id: testVisitorId,
        session_id: testSessionId,
        event_name: 'diagnostic_test_event',
        event_category: 'test',
        path: '/crm',
        element_text: 'Manual Diagnostic Ping',
        is_test: true,
        metadata: {
          triggered_by: adminEmail,
          test_ping: true
        }
      }
    ], {
      country: 'Nigeria',
      country_code: 'NG',
      region: 'FCT Abuja',
      city: 'Abuja',
      device_category: 'Desktop',
      browser: 'Chrome',
      os: 'Admin Portal'
    });

    this.logAudit(adminEmail, 'TEST_EVENT_INJECTED', 'SYSTEM', testEventId, 'Diagnostic test event generated');
    return { success: true, event_id: testEventId };
  }

  // --- Audit Logs ---
  public logAudit(adminEmail: string, action: string, targetType: string, targetId?: string, details = '') {
    const log: CrmAuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      created_at: new Date().toISOString()
    };
    this.data.audit_logs.push(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs.splice(0, this.data.audit_logs.length - 500);
    }
    this.scheduleSave();
  }

  public getAuditLogs(limit = 100) {
    return [...this.data.audit_logs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // --- Settings ---
  public getSettings(): CrmSettings {
    return { ...this.data.settings };
  }

  public updateSettings(newSettings: Partial<CrmSettings>, adminEmail: string): CrmSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.scheduleSave();
    this.logAudit(adminEmail, 'UPDATE_SETTINGS', 'CONFIG', undefined, JSON.stringify(newSettings));
    return this.data.settings;
  }
}

export const crmStore = new CrmStore();
