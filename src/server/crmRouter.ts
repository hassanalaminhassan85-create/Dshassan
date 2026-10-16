import express from 'express';
import { crmStore } from './crmStore';

export const crmRouter = express.Router();

// Middleware: Protected CRM Route Guard
function requireCrmAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const session = crmStore.validateAuthSession(authHeader);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Access to CRM records requires an active administrator session.'
    });
  }
  (req as any).crmUser = session;
  next();
}

// ==========================================
// 1. Public Tracking Ingestion Endpoint
// Strictly write-only. Never returns private CRM data.
// ==========================================
crmRouter.post('/track', (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ success: false, error: 'Empty payload' });
    }

    // Support both single event or batch of events
    const batch = Array.isArray(body) ? body : (Array.isArray(body.events) ? body.events : [body]);
    if (batch.length === 0) {
      return res.status(400).json({ success: false, error: 'No events provided' });
    }

    // Maximum batch size limit to avoid abuse
    if (batch.length > 50) {
      return res.status(413).json({ success: false, error: 'Batch limit exceeded (max 50 events)' });
    }

    // Parse metadata from server headers (Cloudflare edge / standard proxy)
    const clientMeta = crmStore.parseMetadata(req.headers as any, req.headers['user-agent']);

    const result = crmStore.recordTrackingEvents(batch, clientMeta);

    return res.status(200).json({
      success: true,
      recorded: result.recorded,
      skipped: result.skipped
    });
  } catch (err: any) {
    console.error('[CRM Ingestion Error]:', err);
    return res.status(500).json({ success: false, error: 'Ingestion failed safely' });
  }
});

// ==========================================
// 2. Authentication Endpoints
// ==========================================
crmRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    const cleanPass = String(password).trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : 'admin@dstechagency.com';

    // Authorized password validation
    const isValid = cleanPass === 'dstech%)' || cleanPass === 'dstechadmin2026' || cleanPass === 'admin';

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid administrator credentials' });
    }

    const adminName = cleanEmail.includes('ceo') ? 'Chief Executive Officer' : 'DS Tech Systems Administrator';
    const token = crmStore.createAuthSession(cleanEmail, adminName, 'CRM_SUPERADMIN');

    crmStore.logAudit(cleanEmail, 'LOGIN', 'AUTH', undefined, `Admin logged into CRM from IP ${req.ip || 'edge'}`);

    return res.json({
      success: true,
      token,
      user: {
        email: cleanEmail,
        name: adminName,
        role: 'CRM_SUPERADMIN'
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Authentication error' });
  }
});

crmRouter.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  crmStore.invalidateAuthSession(authHeader);
  return res.json({ success: true, message: 'Logged out successfully' });
});

crmRouter.get('/auth/me', requireCrmAuth, (req, res) => {
  const user = (req as any).crmUser;
  return res.json({ success: true, user });
});

// ==========================================
// 3. Analytics & Intelligence Endpoints (Protected)
// ==========================================

// Overview & KPIs
crmRouter.get('/overview', requireCrmAuth, (req, res) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const data = crmStore.getOverview(startDate, endDate);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Live Active Visitors
crmRouter.get('/live', requireCrmAuth, (req, res) => {
  try {
    const data = crmStore.getLiveVisitors();
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Visitor Profiles (List & Detail)
crmRouter.get('/visitors', requireCrmAuth, (req, res) => {
  try {
    const { search, country, device, page, limit } = req.query as any;
    const data = crmStore.getVisitors({ search, country, device, page, limit });
    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

crmRouter.get('/visitors/:id', requireCrmAuth, (req, res) => {
  try {
    const data = crmStore.getVisitorById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Visitor profile not found' });
    }
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Sessions List
crmRouter.get('/sessions', requireCrmAuth, (req, res) => {
  try {
    const { search, page, limit } = req.query as any;
    const data = crmStore.getSessions({ search, page, limit });
    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Events Stream
crmRouter.get('/events', requireCrmAuth, (req, res) => {
  try {
    const { category, search, page, limit } = req.query as any;
    const data = crmStore.getEvents({ category, search, page, limit });
    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Pages Performance
crmRouter.get('/pages', requireCrmAuth, (req, res) => {
  try {
    const data = crmStore.getPagesAnalytics();
    return res.json({ success: true, pages: data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Geographic Analytics
crmRouter.get('/geo', requireCrmAuth, (req, res) => {
  try {
    const data = crmStore.getGeoAnalytics();
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Lead Management CRM
crmRouter.get('/leads', requireCrmAuth, (req, res) => {
  try {
    const { stage, priority, search, page, limit } = req.query as any;
    const data = crmStore.getLeads({ stage, priority, search, page, limit });
    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

crmRouter.get('/leads/:id', requireCrmAuth, (req, res) => {
  try {
    const data = crmStore.getLeadById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

crmRouter.post('/leads', requireCrmAuth, (req, res) => {
  try {
    const user = (req as any).crmUser;
    const lead = crmStore.createManualLead(req.body, user.email);
    return res.json({ success: true, lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

crmRouter.patch('/leads/:id', requireCrmAuth, (req, res) => {
  try {
    const user = (req as any).crmUser;
    const lead = crmStore.updateLead(req.params.id, req.body, user.email);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    return res.json({ success: true, lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

crmRouter.post('/leads/:id/notes', requireCrmAuth, (req, res) => {
  try {
    const user = (req as any).crmUser;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Note content is required' });
    }
    const lead = crmStore.addLeadNote(req.params.id, content, user.email);
    return res.json({ success: true, lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Campaigns Analytics
crmRouter.get('/campaigns', requireCrmAuth, (req, res) => {
  try {
    const data = crmStore.getCampaignsAnalytics();
    return res.json({ success: true, campaigns: data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Funnels Analytics
crmRouter.get('/funnels', requireCrmAuth, (req, res) => {
  try {
    const steps = crmStore.getConversionFunnels();
    return res.json({ success: true, steps });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// CSV Exports with formula injection guard
crmRouter.get('/export', requireCrmAuth, (req, res) => {
  try {
    const user = (req as any).crmUser;
    const type = (req.query.type as any) || 'leads';
    const csvContent = crmStore.generateCsvExport(type);

    crmStore.logAudit(user.email, 'EXPORT_CSV', 'REPORT', type, `Exported ${type} CSV`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dstech_${type}_report_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Tracking Health & Diagnostics
crmRouter.get('/diagnostics', requireCrmAuth, (req, res) => {
  try {
    const diagnostics = crmStore.getDiagnostics();
    return res.json({ success: true, diagnostics });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

crmRouter.post('/test-event', requireCrmAuth, (req, res) => {
  try {
    const user = (req as any).crmUser;
    const result = crmStore.injectTestEvent(user.email);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Audit Logs
crmRouter.get('/audit-logs', requireCrmAuth, (req, res) => {
  try {
    const logs = crmStore.getAuditLogs();
    return res.json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Settings
crmRouter.get('/settings', requireCrmAuth, (req, res) => {
  try {
    const settings = crmStore.getSettings();
    return res.json({ success: true, settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

crmRouter.post('/settings', requireCrmAuth, (req, res) => {
  try {
    const user = (req as any).crmUser;
    const settings = crmStore.updateSettings(req.body, user.email);
    return res.json({ success: true, settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
