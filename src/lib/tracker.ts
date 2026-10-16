/**
 * DS Tech Production First-Party Website Visitor Intelligence & Interaction Tracker
 * Lightweight, non-blocking, privacy-preserving, asynchronous telemetry engine.
 */

export interface TrackEventPayload {
  id?: string;
  visitor_id?: string;
  session_id?: string;
  event_name: string;
  event_category: 'pageview' | 'click' | 'cta' | 'whatsapp' | 'phone' | 'email' | 'form' | 'conversion' | 'navigation' | 'test';
  path: string;
  title?: string;
  element_id?: string;
  element_text?: string;
  placement?: string;
  destination_url?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  duration_seconds?: number;
  is_conversion?: boolean;
  is_test?: boolean;
  metadata?: Record<string, any>;
  timestamp?: string;
}

const VISITOR_COOKIE_KEY = 'dst_crm_vid';
const SESSION_COOKIE_KEY = 'dst_crm_sid';
const SESSION_TIME_KEY = 'dst_crm_last_active';
const OPT_OUT_KEY = 'dst_crm_opt_out';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

class WebsiteTracker {
  private visitorId: string = '';
  private sessionId: string = '';
  private isReturning: boolean = false;
  private queue: TrackEventPayload[] = [];
  private flushTimer: any = null;
  private lastActiveTimestamp: number = Date.now();
  private pageEnterTimestamp: number = Date.now();
  private currentPath: string = '';
  private isInitialized: boolean = false;
  private formsObserved: WeakSet<HTMLFormElement> = new WeakSet();
  private formsStarted: WeakSet<HTMLFormElement> = new WeakSet();

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Resolve or create Visitor ID
    this.visitorId = this.getOrCreateVisitorId();

    // 2. Resolve or start Session ID
    this.sessionId = this.getOrCreateSessionId();

    this.currentPath = window.location.pathname || '/';
    this.pageEnterTimestamp = Date.now();

    // 3. Listen to navigation & click events
    this.attachEventListeners();

    // 4. Initial page view
    this.trackPageView(this.currentPath, document.title);

    // 5. Observe DOM for forms & CTAs
    this.observeForms();

    // 6. Heartbeat every 25 seconds for engagement duration
    setInterval(() => this.heartbeat(), 25000);
  }

  private getOrCreateVisitorId(): string {
    try {
      const stored = localStorage.getItem(VISITOR_COOKIE_KEY);
      if (stored && stored.startsWith('vis_')) {
        this.isReturning = true;
        return stored;
      }
      const newId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(VISITOR_COOKIE_KEY, newId);
      return newId;
    } catch {
      return `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  private getOrCreateSessionId(): string {
    const now = Date.now();
    try {
      const lastActive = Number(localStorage.getItem(SESSION_TIME_KEY) || '0');
      const storedSid = sessionStorage.getItem(SESSION_COOKIE_KEY);

      if (storedSid && (now - lastActive) < SESSION_TIMEOUT_MS) {
        localStorage.setItem(SESSION_TIME_KEY, String(now));
        return storedSid;
      }

      // New session
      const newSid = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(SESSION_COOKIE_KEY, newSid);
      localStorage.setItem(SESSION_TIME_KEY, String(now));
      return newSid;
    } catch {
      return `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  private getUtmParams(): Record<string, string> {
    const params: Record<string, string> = {};
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const search = new URLSearchParams(window.location.search);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
          const val = search.get(key);
          if (val) params[key] = val;
        });
      }
    } catch {}
    return params;
  }

  private lastTracked: { path: string; time: number } = { path: '', time: 0 };

  public trackPageView(path: string, title?: string) {
    if (this.isOptedOut()) return;

    // Deduplicate identical rapid consecutive calls within 600ms
    const now = Date.now();
    if (this.lastTracked.path === path && (now - this.lastTracked.time) < 600) {
      return;
    }
    this.lastTracked = { path, time: now };

    const duration = Math.max(0, Math.round((now - this.pageEnterTimestamp) / 1000));
    this.pageEnterTimestamp = now;
    this.currentPath = path;

    const utm = this.getUtmParams();

    this.enqueue({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      event_name: 'page_view',
      event_category: 'pageview',
      path: path,
      title: title || (typeof document !== 'undefined' ? document.title : '') || path,
      referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
      duration_seconds: duration,
      ...utm
    }, true);

    this.observeForms();
  }

  public trackCustomEvent(payload: Omit<TrackEventPayload, 'visitor_id' | 'session_id'>, immediate: boolean = false) {
    if (this.isOptedOut()) return;
    this.enqueue({
      ...payload,
      id: payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      path: payload.path || this.currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/') || '/'
    }, immediate);
  }

  public trackClick(element: HTMLElement) {
    if (this.isOptedOut()) return;

    // Check link destinations
    const anchor = element.closest('a') as HTMLAnchorElement | null;
    const button = element.closest('button') as HTMLButtonElement | null;
    const interactive = element.closest('[data-track]') as HTMLElement | null;

    if (!anchor && !button && !interactive) return;

    const href = anchor ? (anchor.getAttribute('href') || '') : '';
    const rawText = (element.innerText || button?.innerText || interactive?.innerText || element.textContent || button?.textContent || anchor?.title || '');
    const text = String(rawText || '').trim().slice(0, 80);
    const trackAttr = (interactive || button || anchor)?.getAttribute('data-track');
    const trackName = (interactive || button || anchor)?.getAttribute('data-track-name');

    let category: TrackEventPayload['event_category'] = 'click';
    let name = 'button_clicked';
    let isConversion = false;

    // 1. WhatsApp detection
    if (
      href.includes('wa.me') ||
      href.includes('api.whatsapp.com') ||
      href.startsWith('whatsapp:') ||
      trackAttr === 'whatsapp' ||
      text.toLowerCase().includes('whatsapp')
    ) {
      category = 'whatsapp';
      name = 'whatsapp_clicked';
      isConversion = true;
    }
    // 2. Telephone call detection
    else if (href.startsWith('tel:') || trackAttr === 'phone' || text.toLowerCase().includes('call hotline') || text.toLowerCase().includes('phone')) {
      category = 'phone';
      name = 'telephone_clicked';
      isConversion = true;
    }
    // 3. Email mailto detection
    else if (href.startsWith('mailto:') || trackAttr === 'email' || text.toLowerCase().includes('email')) {
      category = 'email';
      name = 'email_clicked';
      isConversion = true;
    }
    // 4. CTA detection
    else if (
      trackAttr === 'cta' ||
      /apply|register|enroll|scholarship|internship|book|start|submit|download letter|sign offer|hire/i.test(text)
    ) {
      category = 'cta';
      name = trackName || `cta_${text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30)}`;
      isConversion = false;
    }
    // 5. Navigation detection
    else if (element.closest('nav') || element.closest('header') || element.closest('footer')) {
      category = 'navigation';
      name = `nav_${text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30)}`;
    }

    const placement = element.closest('header') ? 'header' :
                      element.closest('footer') ? 'footer' :
                      element.closest('[data-section]')?.getAttribute('data-section') ||
                      'body';

    const isImmediate = isConversion || category === 'cta' || category === 'navigation' || category === 'whatsapp' || category === 'phone' || category === 'email';

    this.trackCustomEvent({
      event_name: name,
      event_category: category,
      path: this.currentPath || window.location.pathname || '/',
      element_id: (button || interactive || anchor)?.id || undefined,
      element_text: text || undefined,
      placement,
      destination_url: href || undefined,
      is_conversion: isConversion
    }, isImmediate);
  }

  // Auto-detect form starts and form submissions
  public observeForms() {
    if (typeof document === 'undefined') return;

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (this.formsObserved.has(form)) return;
      this.formsObserved.add(form);

      // Form start on first interaction
      const onFirstInput = () => {
        if (!this.formsStarted.has(form)) {
          this.formsStarted.add(form);
          const formId = form.id || form.getAttribute('name') || 'contact_form';
          this.trackCustomEvent({
            event_name: 'form_start',
            event_category: 'form',
            path: this.currentPath,
            element_id: formId,
            element_text: `Form started: ${formId}`
          });
        }
      };

      form.addEventListener('focusin', onFirstInput, { once: true, passive: true });
      form.addEventListener('input', onFirstInput, { once: true, passive: true });

      // Form submission attempt
      form.addEventListener('submit', (e) => {
        const formId = form.id || form.getAttribute('name') || 'contact_form';
        this.trackCustomEvent({
          event_name: 'form_submit_attempt',
          event_category: 'form',
          path: this.currentPath,
          element_id: formId,
          element_text: `Form submit attempt: ${formId}`
        });
      });
    });
  }

  public trackFormSuccess(formName: string, metadata?: Record<string, any>) {
    this.trackCustomEvent({
      event_name: 'form_submit_success',
      event_category: 'form',
      path: this.currentPath,
      element_text: `Submission confirmed: ${formName}`,
      is_conversion: true,
      metadata: metadata || {}
    }, true);
  }

  public trackWhatsAppClick(numberOrUrl?: string) {
    this.trackCustomEvent({
      event_name: 'whatsapp_clicked',
      event_category: 'whatsapp',
      path: this.currentPath,
      element_text: `WhatsApp Chat: ${numberOrUrl || '+2349023489111'}`,
      destination_url: numberOrUrl?.startsWith('http') ? numberOrUrl : `https://wa.me/${(numberOrUrl || '2349023489111').replace(/[^0-9]/g, '')}`,
      is_conversion: true
    }, true);
  }

  public trackPhoneClick(phoneNumber?: string) {
    this.trackCustomEvent({
      event_name: 'telephone_clicked',
      event_category: 'phone',
      path: this.currentPath,
      element_text: `Voice Call: ${phoneNumber || '+2349023489111'}`,
      destination_url: `tel:${phoneNumber || '+2349023489111'}`,
      is_conversion: true
    }, true);
  }

  public trackEmailClick(emailAddress?: string) {
    this.trackCustomEvent({
      event_name: 'email_clicked',
      event_category: 'email',
      path: this.currentPath,
      element_text: `Email Contact: ${emailAddress || 'support@dstechagency.com'}`,
      destination_url: `mailto:${emailAddress || 'support@dstechagency.com'}`,
      is_conversion: true
    }, true);
  }

  private attachEventListeners() {
    // Delegated click tracking
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        this.trackClick(target);
      }
    }, { passive: true });

    // History popstate and route navigation tracking
    window.addEventListener('popstate', () => {
      const newPath = window.location.pathname || '/';
      if (newPath !== this.currentPath) {
        this.trackPageView(newPath, document.title);
      }
    });

    // Page visibility change / page leave duration update
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    window.addEventListener('pagehide', () => {
      this.flush();
    });
  }

  private heartbeat() {
    if (document.visibilityState === 'visible') {
      const now = Date.now();
      try {
        localStorage.setItem(SESSION_TIME_KEY, String(now));
      } catch {}
      this.flush();
    }
  }

  private enqueue(payload: TrackEventPayload, immediate: boolean = false) {
    this.queue.push({
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString()
    });

    if (immediate || this.queue.length >= 3) {
      this.flush();
    } else {
      if (!this.flushTimer) {
        this.flushTimer = setTimeout(() => this.flush(), 300);
      }
    }
  }

  public flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    const payload = JSON.stringify({
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      events: eventsToSend
    });

    const endpoint = '/api/crm/track';

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload,
      keepalive: true
    }).catch(err => {
      console.warn('[CRM Telemetry] Retrying failed batch:', err);
      if (this.queue.length < 50) {
        this.queue.push(...eventsToSend);
      }
    });
  }

  public isOptedOut(): boolean {
    try {
      return localStorage.getItem(OPT_OUT_KEY) === 'true';
    } catch {
      return false;
    }
  }

  public setOptOut(optOut: boolean) {
    try {
      localStorage.setItem(OPT_OUT_KEY, optOut ? 'true' : 'false');
    } catch {}
  }

  public getVisitorId(): string {
    return this.visitorId;
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

export const tracker = new WebsiteTracker();
