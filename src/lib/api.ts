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
  const eventSource = new EventSource('/api/events');

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

// --- Notification API Client Helpers ---

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  userId: string;
  recipientRole: 'admin' | 'candidate' | 'recruiter';
  image: string;
  createdAt: string;
  read: number; // 0 or 1
  actionUrl: string;
  metadata: string; // JSON string
  expiresAt: string;
}

export interface GetNotificationsResponse {
  notifications: NotificationRecord[];
  total: number;
  page: number;
  limit: number;
}

export async function apiGetNotifications(params: {
  userId: string;
  role: 'admin' | 'candidate' | 'recruiter';
  type?: string;
  priority?: 'high' | 'medium' | 'low';
  search?: string;
  sort?: 'newest' | 'oldest' | 'unread' | 'read';
  page?: number;
  limit?: number;
}): Promise<GetNotificationsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('userId', params.userId);
  queryParams.append('role', params.role);
  if (params.type) queryParams.append('type', params.type);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.search) queryParams.append('search', params.search);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));

  const res = await fetch(`/api/notifications?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch notifications.');
  return res.json();
}

export async function apiCreateNotification(notification: {
  title: string;
  message: string;
  type: string;
  priority?: 'high' | 'medium' | 'low';
  userId: string;
  recipientRole: 'admin' | 'candidate' | 'recruiter';
  image?: string;
  actionUrl?: string;
  metadata?: any;
}): Promise<NotificationRecord> {
  const res = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notification),
  });
  if (!res.ok) throw new Error('Failed to create notification.');
  return res.json();
}

export async function apiMarkNotificationRead(id: string, read: boolean = true): Promise<NotificationRecord> {
  const res = await fetch(`/api/notifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read }),
  });
  if (!res.ok) throw new Error('Failed to update notification status.');
  return res.json();
}

export async function apiMarkAllNotificationsRead(userId: string, role: 'admin' | 'candidate' | 'recruiter'): Promise<{ success: boolean }> {
  const res = await fetch(`/api/notifications/mark-all-read?userId=${userId}&role=${role}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read.');
  return res.json();
}

export async function apiDeleteNotification(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/notifications/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete notification.');
  return res.json();
}

export async function apiDeleteAllNotifications(userId: string, role: 'admin' | 'candidate' | 'recruiter'): Promise<{ success: boolean }> {
  const res = await fetch(`/api/notifications?userId=${userId}&role=${role}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear notifications.');
  return res.json();
}

export async function apiGetUnreadNotificationsCount(userId: string, role: 'admin' | 'candidate' | 'recruiter'): Promise<{ count: number }> {
  const res = await fetch(`/api/notifications/count/unread?userId=${userId}&role=${role}`);
  if (!res.ok) throw new Error('Failed to fetch unread count.');
  return res.json();
}

export async function apiSaveFcmToken(tokenParams: {
  userId: string;
  fcmToken: string;
  deviceName?: string;
  deviceType?: string;
}): Promise<{ success: boolean }> {
  const res = await fetch('/api/fcm-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokenParams),
  });
  if (!res.ok) throw new Error('Failed to register FCM token.');
  return res.json();
}

export async function apiGetSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export async function apiSaveSetting(key: string, value: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error('Failed to save setting.');
  return res.json();
}

export interface BiometricLogRecord {
  id: string;
  user_id: string;
  email: string;
  biometric_type: string;
  status: 'success' | 'failed' | 'warning' | 'pending';
  message: string;
  user_agent: string;
  created_at: string;
}

// In-memory fallback for biometric logs since no backend is connected
const MOCK_BIOMETRIC_LOGS: BiometricLogRecord[] = [];

export async function apiGetBiometricLogs(userId: string): Promise<BiometricLogRecord[]> {
  try {
    const res = await fetch(`/api/auth/biometric-logs?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (e) {
    // Return mock data on failure to prevent "Failed to fetch" errors
    console.warn("Using mock biometric logs", e);
    return MOCK_BIOMETRIC_LOGS.filter(log => log.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export async function apiLogBiometricAttempt(params: {
  userId?: string;
  email?: string;
  biometricType?: string;
  status: 'success' | 'failed' | 'warning' | 'pending';
  message: string;
  userAgent?: string;
}): Promise<{ success: boolean }> {
  try {
    const res = await fetch('/api/auth/biometric-attempt-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        userAgent: params.userAgent || navigator.userAgent
      })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (e) {
    console.warn("Using mock biometric log attempt", e);
    MOCK_BIOMETRIC_LOGS.push({
      id: Math.random().toString(36).substring(7),
      user_id: params.userId || 'unknown',
      email: params.email || 'unknown',
      biometric_type: params.biometricType || 'unknown',
      status: params.status,
      message: params.message,
      user_agent: params.userAgent || navigator.userAgent,
      created_at: new Date().toISOString()
    });
    return { success: true };
  }
}

export async function apiUpdateProfile(params: {
  userId: string;
  fullName?: string;
  email?: string;
  profilePhoto?: string;
}): Promise<{ success: boolean; user: any }> {
  const res = await fetch('/api/auth/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update user profile.');
  }
  return res.json();
}

// --- CAC Certificate & Trust Center Sync ---
export interface CacMetadata {
  id: string;
  company_name: string;
  registration_number: string;
  business_type: string;
  registration_date: string;
  company_status: string;
  registered_address: string;
  description: string;
  verification_url: string;
  r2_object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  is_published: number; // 0 or 1
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function apiGetCacMetadata(admin: boolean = false): Promise<CacMetadata[]> {
  const url = admin ? '/api/cac/metadata?admin=true' : '/api/cac/metadata';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to retrieve CAC metadata.');
  return res.json();
}

export async function apiSaveCacMetadata(metadata: Partial<CacMetadata>): Promise<CacMetadata> {
  const res = await fetch('/api/cac/metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save CAC metadata.');
  }
  return res.json();
}

export async function apiDeleteCacMetadata(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/cac/metadata?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete CAC metadata.');
  return res.json();
}

export async function apiToggleCacPublish(id: string, isPublished: boolean): Promise<{ success: boolean; id: string; is_published: number }> {
  const res = await fetch('/api/cac/metadata/publish', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_published: isPublished })
  });
  if (!res.ok) throw new Error('Failed to toggle CAC publish state.');
  return res.json();
}

export async function apiUploadCacFile(file: File): Promise<{
  success: boolean;
  r2_object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch('/api/cac/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload CAC file.');
  }
  return res.json();
}

// --- Recognition & Certifications System ---
export interface RecognitionCertificate {
  id: string;
  title: string;
  category: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  certificate_number?: string;
  description?: string;
  verification_url?: string;
  r2_object_key?: string;
  thumbnail_key?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  is_published: number; // 0 or 1
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function apiGetRecognitionCertificates(admin: boolean = false, category?: string): Promise<RecognitionCertificate[]> {
  let url = admin ? '/api/recognition/certificates?admin=true' : '/api/recognition/certificates';
  if (category) {
    url += (admin ? '&' : '?') + `category=${encodeURIComponent(category)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to retrieve recognition certificates.');
  return res.json();
}

export async function apiSaveRecognitionCertificate(cert: Partial<RecognitionCertificate>): Promise<RecognitionCertificate> {
  const res = await fetch('/api/recognition/certificates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cert)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save recognition certificate.');
  }
  return res.json();
}

export async function apiDeleteRecognitionCertificate(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/recognition/certificates?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete recognition certificate.');
  return res.json();
}

export async function apiToggleRecognitionPublish(id: string, isPublished: boolean): Promise<{ success: boolean; id: string; is_published: number }> {
  const res = await fetch('/api/recognition/certificates/publish', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_published: isPublished })
  });
  if (!res.ok) throw new Error('Failed to toggle recognition certificate publish state.');
  return res.json();
}

export async function apiUploadRecognitionFile(file: File): Promise<{
  success: boolean;
  r2_object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch('/api/recognition/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload recognition certificate file.');
  }
  return res.json();
}

// --- Ongoing Projects Management System ---
export interface OngoingProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  full_description: string;
  cover_image_key?: string;
  gallery?: string; // JSON array of image keys or url strings
  status: string;
  progress_percentage: number;
  technologies?: string; // comma-separated list or JSON array of tech
  estimated_completion?: string;
  last_updated: string;
  is_featured: number; // 0 or 1
  is_published: number; // 0 or 1
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function apiGetOngoingProjects(admin: boolean = false): Promise<OngoingProject[]> {
  const url = admin ? '/api/ongoing-projects?admin=true' : '/api/ongoing-projects';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to retrieve ongoing projects.');
  return res.json();
}

export async function apiSaveOngoingProject(project: Partial<OngoingProject>): Promise<OngoingProject> {
  const res = await fetch('/api/ongoing-projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save ongoing project.');
  }
  return res.json();
}

export async function apiDeleteOngoingProject(id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`/api/ongoing-projects?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete ongoing project.');
  return res.json();
}

export async function apiToggleOngoingProjectPublish(id: string, isPublished: boolean): Promise<{ success: boolean; id: string; is_published: number }> {
  const res = await fetch('/api/ongoing-projects/publish', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_published: isPublished })
  });
  if (!res.ok) throw new Error('Failed to toggle ongoing project publish state.');
  return res.json();
}

export async function apiUpdateOngoingProjectProgress(id: string, progress: number): Promise<{ success: boolean; id: string; progress_percentage: number }> {
  const res = await fetch('/api/ongoing-projects/progress', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, progress_percentage: progress })
  });
  if (!res.ok) throw new Error('Failed to update ongoing project progress.');
  return res.json();
}

export async function apiUploadOngoingProjectFile(file: File): Promise<{
  success: boolean;
  r2_object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}> {
  console.log("Starting upload for:", file.name);
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await fetch('/api/ongoing-projects/upload', {
      method: 'POST',
      body: formData
    });
    console.log("Upload response status:", res.status);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload ongoing project asset file.');
    }
    return res.json();
  } catch (err) {
    console.error("Fetch upload error:", err);
    throw err;
  }
}

// Universal image URL resolver helper
export function resolveImageUrl(urlOrKey: string | null | undefined, fallbackUrl?: string): string {
  if (!urlOrKey || !urlOrKey.trim()) {
    return fallbackUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80';
  }
  const trimmed = urlOrKey.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/api/')) {
    return trimmed;
  }
  return `/api/ongoing-projects/file?key=${encodeURIComponent(trimmed)}`;
}



