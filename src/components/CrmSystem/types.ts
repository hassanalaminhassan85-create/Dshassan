export type CrmTab =
  | 'overview'
  | 'live'
  | 'visitors'
  | 'sessions'
  | 'events'
  | 'pages'
  | 'geo'
  | 'leads'
  | 'campaigns'
  | 'funnels'
  | 'reports'
  | 'diagnostics'
  | 'audit'
  | 'settings';

export interface CrmAuthUser {
  email: string;
  name: string;
  role: string;
}

export interface CrmOverviewKpis {
  totalVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
  activeSessions: number;
  totalSessions: number;
  totalPageViews: number;
  avgPagesPerSession: number;
  avgDurationSeconds: number;
  bounceRate: number;
  totalTrackedEvents: number;
  buttonClicks: number;
  whatsappClicks: number;
  telephoneClicks: number;
  emailClicks: number;
  formStarts: number;
  formSubmissions: number;
  newLeads: number;
  qualifiedLeads: number;
  customersAcquired: number;
  conversionRate: number;
  campaignLeads: number;
  campaignConversions: number;
}
