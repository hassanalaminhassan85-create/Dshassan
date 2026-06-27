import { JobApplication } from '../types';

const STORAGE_KEY = 'dstech_applications';

export const DEMO_APPLICATION: JobApplication = {
  id: 'seed-hassan-demo',
  createdAt: new Date().toISOString(),
  personalInfo: {
    fullName: 'David Alao Chibuzor',
    maritalStatus: 'Single',
    gender: 'Male',
    dateOfBirth: '1998-04-12',
    nationality: 'Nigerian',
    stateOfOrigin: 'Anambra',
    lgaTownOfOrigin: 'Onitsha North',
    stateOfResidence: 'FCT Abuja',
    residentialAddress: 'Suite B12, Garki Mall, Area 11 Abuja',
    emailAddress: 'david.alao.chibuzor@example.com',
    phoneNumbers: '+2348032485921',
    passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=60',
  },
  guarantorInfo: {
    fullName: 'Dr. Yusuf Ibrahim Garki',
    hometown: 'Kano',
    currentAddress: 'No. 14 Close C, Gwarinpa Estate, Abuja',
    phoneNumber: '+2349098485295',
    relationship: 'Academic Mentor',
  },
  educationalBg: {
    highestQualification: 'Bachelor of Science (First Class)',
    schoolInstitution: 'University of Nigeria, Nsukka',
    fieldOfStudy: 'Computer Science & Web Engineering',
    isStudentOrGraduate: 'graduate',
  },
  experiences: {
    exp1: 'Freelance Frontend Developer - Designed 12 commercial Webflow landing pages (2024-2025)',
    exp2: 'Junior UI/UX Architect at TechHub Abuja (6 months internship)',
    exp3: 'Figma Design Coordinator - Managed asset design layouts for 4 startup apps',
  },
  positionSkills: {
    majorRole: 'Lead Frontend Developer',
    skillRole1: 'React.js, NextJS, TypeScript, Tailwind CSS, Framer Motion',
    skillRole2: 'Figma Prototyping, Wireframing, Vectors, Component Design',
    skillRole3: 'REST APIs, Git Versioning, Node/Express Backend, SQLite',
  },
  specialization: {
    interests: ['Website Design', 'App Development', 'Services'],
    otherDetails: 'Specialize in creating highly micro-animated React components with luxury custom layouts.',
  },
  workMode: {
    monthlySalaryJob: 'hybrid',
    contractFreelanceJob: 'remote',
    availableForAnyOpportunity: true,
  },
  languageProficiency: 'English (Native), French (Conversational/Intermediate)',
  personalStatement: 'Highly driven to contribute modern, responsive, and micro-interactive interfaces for DS Tech to position them as the premier digital marketing agency in West Africa.',
  applicantSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50' viewBox='0 0 150 50'><path d='M10,35 Q30,10 60,30 T110,20 T140,40' fill='none' stroke='%23000E32' stroke-width='3'/></svg>",
  applicantSignatureType: 'draw',
  declarationDate: '2026-06-23',
  status: 'approved',
};

// Local storage helpers
function getLocalApps(): Record<string, JobApplication> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: Record<string, JobApplication> = {};
      initial[DEMO_APPLICATION.id] = DEMO_APPLICATION;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed[DEMO_APPLICATION.id]) {
      parsed[DEMO_APPLICATION.id] = DEMO_APPLICATION;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    const fallback: Record<string, JobApplication> = {};
    fallback[DEMO_APPLICATION.id] = DEMO_APPLICATION;
    return fallback;
  }
}

function saveLocalApps(apps: Record<string, JobApplication>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to write to localStorage', e);
  }
}

export async function apiGetApplications(): Promise<JobApplication[]> {
  try {
    const res = await fetch('/api/applications');
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    
    // Merge server data into local storage to keep them in sync/backed up
    const locals = getLocalApps();
    data.forEach((app: JobApplication) => {
      locals[app.id] = app;
    });
    saveLocalApps(locals);
    
    return data;
  } catch (err) {
    console.warn('API is unavailable. Falling back to LocalStorage.', err);
    return Object.values(getLocalApps());
  }
}

export async function apiGetApplication(id: string): Promise<JobApplication> {
  try {
    const res = await fetch(`/api/applications/${id}`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    
    // Save/sync locally
    const locals = getLocalApps();
    locals[id] = data;
    saveLocalApps(locals);
    
    return data;
  } catch (err) {
    console.warn(`API get for ${id} failed. Falling back to LocalStorage.`, err);
    const locals = getLocalApps();
    const app = locals[id];
    if (!app) {
      throw new Error('This Application ID is either invalid, expired, or has been purged from memory.');
    }
    return app;
  }
}

export async function apiSaveApplication(formData: Omit<JobApplication, 'id' | 'createdAt'>): Promise<JobApplication> {
  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('API Error');
    const savedApp = await res.json();
    
    // Sync locally
    const locals = getLocalApps();
    locals[savedApp.id] = savedApp;
    saveLocalApps(locals);
    
    return savedApp;
  } catch (err) {
    console.warn('API save failed. Storing in LocalStorage only.', err);
    // Create custom local object
    const id = 'app_local_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString().substring(8);
    const newApp: JobApplication = {
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...formData,
    } as JobApplication;
    
    const locals = getLocalApps();
    locals[id] = newApp;
    saveLocalApps(locals);
    
    return newApp;
  }
}

export async function apiUpdateApplication(id: string, updatedFields: Partial<JobApplication>): Promise<JobApplication> {
  try {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('API Error');
    const updatedApp = await res.json();
    
    const locals = getLocalApps();
    locals[id] = updatedApp;
    saveLocalApps(locals);
    
    return updatedApp;
  } catch (err) {
    console.warn(`API update for ${id} failed. Saving to LocalStorage.`, err);
    const locals = getLocalApps();
    const app = locals[id];
    if (!app) {
      throw new Error('Application record not found in localStorage.');
    }
    
    const updatedApp = {
      ...app,
      ...updatedFields,
    };
    locals[id] = updatedApp;
    saveLocalApps(locals);
    
    return updatedApp;
  }
}

export async function apiDeleteApplication(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('API Error');
    
    const locals = getLocalApps();
    delete locals[id];
    saveLocalApps(locals);
    
    return true;
  } catch (err) {
    console.warn(`API delete for ${id} failed. Removing from LocalStorage.`, err);
    const locals = getLocalApps();
    if (locals[id]) {
      delete locals[id];
      saveLocalApps(locals);
      return true;
    }
    throw new Error('Application record not found.');
  }
}
