// 2026 Advanced Client API Helpers for DS Tech Portal
// Connects UI to secure backend Cloudflare Functions / Express server

export interface ScanHistoryRecord {
  id: string;
  user_id: string;
  applicant_id: string;
  applicant_name: string;
  scanned_at: string;
  secure_r2_url: string;
  safety_status: 'safe' | 'unsafe' | 'suspicious';
}

export interface UrlSafetyReport {
  safe: boolean;
  dangerScore: number; // 0 to 100
  threatType: string;
  reason: string;
}

// Generate or retrieve a persistent client User ID for secure scoping and privacy
export function getClientUserId(): string {
  let uid = localStorage.getItem('dstech_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString().substring(10);
    localStorage.setItem('dstech_user_id', uid);
  }
  return uid;
}

// Get the scan history log (scoped securely by User ID header)
export async function apiGetScanHistory(): Promise<ScanHistoryRecord[]> {
  const uid = getClientUserId();
  const res = await fetch('/api/scan-history', {
    headers: {
      'X-User-ID': uid
    }
  });
  if (!res.ok) {
    throw new Error('Failed to retrieve scan history from Cloudflare/Express backend.');
  }
  return res.json();
}

// Log a scanning operation (and compress/upload QR image)
export async function apiLogScan(params: {
  applicantId: string;
  applicantName: string;
  qrImageBase64?: string;
  safetyStatus?: 'safe' | 'unsafe' | 'suspicious';
}): Promise<ScanHistoryRecord> {
  const uid = getClientUserId();
  const res = await fetch('/api/scan-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': uid
    },
    body: JSON.stringify(params)
  });
  
  if (!res.ok) {
    throw new Error('Failed to secure and log the scan record on Cloudflare.');
  }
  return res.json();
}

// Generate a server-side Gemini executive applicant summary (hiding keys in backend vault)
export async function apiSummarizeApplicant(applicationData: any): Promise<{ summary: string; simulated?: boolean }> {
  const res = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ applicationData })
  });
  if (!res.ok) {
    throw new Error('Failed to fetch AI applicant summary.');
  }
  return res.json();
}

// Pre-screen a target QR URL using the Gemini Fraud Shield backend
export async function apiPreScreenUrl(targetUrl: string): Promise<UrlSafetyReport> {
  const res = await fetch('/api/gemini/pre-screen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ targetUrl })
  });
  if (!res.ok) {
    throw new Error('Failed to run AI safety scan.');
  }
  return res.json();
}

// Start a real-time Server-Sent Events connection for instant multi-screen syncing
export function apiSubscribeToRealtimeSync(onEvent: (data: any) => void): () => void {
  const eventSource = new EventSource('/api/real-time/sync');

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch (e) {
      console.error('Failed to parse SSE event payload:', e);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('Real-time connection disrupted. Retrying automatically...', err);
  };

  // Return a cleanup/unsubscription method
  return () => {
    eventSource.close();
  };
}
