import { 
  ScholarshipApplication, 
  InternshipApplication, 
  CorporateTrainingRequest, 
  MentorshipApplication 
} from '../types/academyPathways';

// Unique ID Generators
export function generateScholarshipId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `DSTA-SCH/${year}/${randomNum}`;
}

export function generateInternshipId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `DSTA-INT/${year}/${randomNum}`;
}

export function generateCorporateId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `DSTA-CORP/${year}/${randomNum}`;
}

export function generateMentorshipId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `DSTA-MENTOR/${year}/${randomNum}`;
}

// ==========================================
// 1. SCHOLARSHIP STORAGE
// ==========================================
const SCHOLARSHIP_STORAGE_KEY = 'dsta_scholarship_applications';

export async function apiSaveScholarshipApplication(app: ScholarshipApplication): Promise<ScholarshipApplication> {
  try {
    const existingRaw = localStorage.getItem(SCHOLARSHIP_STORAGE_KEY);
    const list: ScholarshipApplication[] = existingRaw ? JSON.parse(existingRaw) : [];
    const index = list.findIndex(item => item.id === app.id);
    if (index >= 0) {
      list[index] = app;
    } else {
      list.unshift(app);
    }
    localStorage.setItem(SCHOLARSHIP_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('LocalStorage write error for scholarship:', e);
  }

  // Attempt API backend persistence if route exists
  try {
    fetch('/api/scholarships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app)
    }).catch(() => {});
  } catch (e) {}

  return app;
}

export async function apiGetScholarshipApplication(id: string): Promise<ScholarshipApplication | null> {
  try {
    const existingRaw = localStorage.getItem(SCHOLARSHIP_STORAGE_KEY);
    if (existingRaw) {
      const list: ScholarshipApplication[] = JSON.parse(existingRaw);
      const found = list.find(item => item.id.trim().toLowerCase() === id.trim().toLowerCase());
      if (found) return found;
    }
  } catch (e) {}
  return null;
}

// ==========================================
// 2. INTERNSHIP STORAGE
// ==========================================
const INTERNSHIP_STORAGE_KEY = 'dsta_internship_applications';

export async function apiSaveInternshipApplication(app: InternshipApplication): Promise<InternshipApplication> {
  try {
    const existingRaw = localStorage.getItem(INTERNSHIP_STORAGE_KEY);
    const list: InternshipApplication[] = existingRaw ? JSON.parse(existingRaw) : [];
    const index = list.findIndex(item => item.id === app.id);
    if (index >= 0) {
      list[index] = app;
    } else {
      list.unshift(app);
    }
    localStorage.setItem(INTERNSHIP_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('LocalStorage write error for internship:', e);
  }

  try {
    fetch('/api/internships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app)
    }).catch(() => {});
  } catch (e) {}

  return app;
}

export async function apiGetInternshipApplication(id: string): Promise<InternshipApplication | null> {
  try {
    const existingRaw = localStorage.getItem(INTERNSHIP_STORAGE_KEY);
    if (existingRaw) {
      const list: InternshipApplication[] = JSON.parse(existingRaw);
      const found = list.find(item => item.id.trim().toLowerCase() === id.trim().toLowerCase());
      if (found) return found;
    }
  } catch (e) {}
  return null;
}

// ==========================================
// 3. CORPORATE TRAINING STORAGE
// ==========================================
const CORPORATE_STORAGE_KEY = 'dsta_corporate_requests';

export async function apiSaveCorporateRequest(req: CorporateTrainingRequest): Promise<CorporateTrainingRequest> {
  try {
    const existingRaw = localStorage.getItem(CORPORATE_STORAGE_KEY);
    const list: CorporateTrainingRequest[] = existingRaw ? JSON.parse(existingRaw) : [];
    const index = list.findIndex(item => item.id === req.id);
    if (index >= 0) {
      list[index] = req;
    } else {
      list.unshift(req);
    }
    localStorage.setItem(CORPORATE_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('LocalStorage write error for corporate:', e);
  }

  try {
    fetch('/api/corporate-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    }).catch(() => {});
  } catch (e) {}

  return req;
}

export async function apiGetCorporateRequest(id: string): Promise<CorporateTrainingRequest | null> {
  try {
    const existingRaw = localStorage.getItem(CORPORATE_STORAGE_KEY);
    if (existingRaw) {
      const list: CorporateTrainingRequest[] = JSON.parse(existingRaw);
      const found = list.find(item => item.id.trim().toLowerCase() === id.trim().toLowerCase());
      if (found) return found;
    }
  } catch (e) {}
  return null;
}

// ==========================================
// 4. MENTORSHIP STORAGE
// ==========================================
const MENTORSHIP_STORAGE_KEY = 'dsta_mentorship_applications';

export async function apiSaveMentorshipApplication(app: MentorshipApplication): Promise<MentorshipApplication> {
  try {
    const existingRaw = localStorage.getItem(MENTORSHIP_STORAGE_KEY);
    const list: MentorshipApplication[] = existingRaw ? JSON.parse(existingRaw) : [];
    const index = list.findIndex(item => item.id === app.id);
    if (index >= 0) {
      list[index] = app;
    } else {
      list.unshift(app);
    }
    localStorage.setItem(MENTORSHIP_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('LocalStorage write error for mentorship:', e);
  }

  try {
    fetch('/api/mentorship-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app)
    }).catch(() => {});
  } catch (e) {}

  return app;
}

export async function apiGetMentorshipApplication(id: string): Promise<MentorshipApplication | null> {
  try {
    const existingRaw = localStorage.getItem(MENTORSHIP_STORAGE_KEY);
    if (existingRaw) {
      const list: MentorshipApplication[] = JSON.parse(existingRaw);
      const found = list.find(item => item.id.trim().toLowerCase() === id.trim().toLowerCase());
      if (found) return found;
    }
  } catch (e) {}
  return null;
}
