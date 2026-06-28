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

// Analyze applicant using server-side Gemini AI for compatibility, strengths, risks, and questions
export async function apiAnalyzeCandidate(applicationData: any): Promise<{
  compatibilityScore: number;
  keyStrengths: string[];
  potentialRisks: string[];
  interviewQuestions: string[];
}> {
  const res = await fetch('/api/gemini/analyze-candidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ applicationData })
  });
  if (!res.ok) {
    throw new Error('Failed to run AI candidate analysis.');
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

// --- Dynamic Services Sync ---
export async function apiGetServices(): Promise<any[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to retrieve services from Cloudflare D1.');
  return res.json();
}

export async function apiSaveService(service: any): Promise<any> {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });
  if (!res.ok) throw new Error('Failed to save service.');
  return res.json();
}

export async function apiUpdateService(id: string, service: any): Promise<any> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });
  if (!res.ok) throw new Error('Failed to update service.');
  return res.json();
}

export async function apiDeleteService(id: string): Promise<any> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete service.');
  return res.json();
}

export async function apiInitializeServices(items: any[]): Promise<any> {
  const res = await fetch('/api/services/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items)
  });
  if (!res.ok) throw new Error('Failed to initialize services.');
  return res.json();
}

// --- Dynamic Portfolio Sync ---
export async function apiGetPortfolio(): Promise<any[]> {
  const res = await fetch('/api/portfolio');
  if (!res.ok) throw new Error('Failed to retrieve portfolio from Cloudflare D1.');
  return res.json();
}

export async function apiSavePortfolio(project: any): Promise<any> {
  const res = await fetch('/api/portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Failed to save project.');
  return res.json();
}

export async function apiUpdatePortfolio(id: string, project: any): Promise<any> {
  const res = await fetch(`/api/portfolio/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Failed to update project.');
  return res.json();
}

export async function apiDeletePortfolio(id: string): Promise<any> {
  const res = await fetch(`/api/portfolio/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete project.');
  return res.json();
}

export async function apiInitializePortfolio(items: any[]): Promise<any> {
  const res = await fetch('/api/portfolio/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items)
  });
  if (!res.ok) throw new Error('Failed to initialize portfolio.');
  return res.json();
}

// --- Dynamic Blogs Sync ---
export async function apiGetBlogs(): Promise<any[]> {
  const res = await fetch('/api/blogs');
  if (!res.ok) throw new Error('Failed to retrieve blogs from Cloudflare D1.');
  return res.json();
}

export async function apiSaveBlog(blog: any): Promise<any> {
  const res = await fetch('/api/blogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blog)
  });
  if (!res.ok) throw new Error('Failed to save blog.');
  return res.json();
}

export async function apiUpdateBlog(id: string, blog: any): Promise<any> {
  const res = await fetch(`/api/blogs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blog)
  });
  if (!res.ok) throw new Error('Failed to update blog.');
  return res.json();
}

export async function apiDeleteBlog(id: string): Promise<any> {
  const res = await fetch(`/api/blogs/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete blog.');
  return res.json();
}

export async function apiInitializeBlogs(items: any[]): Promise<any> {
  const res = await fetch('/api/blogs/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items)
  });
  if (!res.ok) throw new Error('Failed to initialize blogs.');
  return res.json();
}

// --- Dynamic Courses Sync ---
export async function apiGetCourses(): Promise<any[]> {
  const res = await fetch('/api/courses');
  if (!res.ok) throw new Error('Failed to retrieve courses from Cloudflare D1.');
  return res.json();
}

export async function apiSaveCourse(course: any): Promise<any> {
  const res = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course)
  });
  if (!res.ok) throw new Error('Failed to save course.');
  return res.json();
}

export async function apiUpdateCourse(id: string, course: any): Promise<any> {
  const res = await fetch(`/api/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course)
  });
  if (!res.ok) throw new Error('Failed to update course.');
  return res.json();
}

export async function apiDeleteCourse(id: string): Promise<any> {
  const res = await fetch(`/api/courses/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete course.');
  return res.json();
}

export async function apiInitializeCourses(items: any[]): Promise<any> {
  const res = await fetch('/api/courses/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items)
  });
  if (!res.ok) throw new Error('Failed to initialize courses.');
  return res.json();
}
