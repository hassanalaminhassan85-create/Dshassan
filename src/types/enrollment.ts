import { DurationOption, LearningMode, LectureDays, LanguagePreference } from './studentRegistration';

export interface AcademyEnrollment {
  id: string; // e.g. DSTA-ENR/2026/492019
  enrollmentNumber: string; // e.g. DSTA-ENR/2026/492019
  studentId: string; // e.g. DSTA/2026/894102
  studentEmail: string;
  studentName: string;
  studentPhone: string;
  
  // Course Details
  courseId: string;
  courseCode: string;
  courseTitle: string;
  categoryName: string;
  duration: DurationOption | string;
  mode: LearningMode | string;
  lectureDays: LectureDays | string;
  language: LanguagePreference | string;
  location: string;
  
  // Financial & Billing
  amount: number;
  paymentMethod: 'paystack' | 'bank_transfer' | 'whatsapp' | 'scholarship';
  paymentStatus: 'pending' | 'paid' | 'verified';
  status: 'enrolled' | 'confirmed' | 'active' | 'graduated' | 'cancelled';
  
  // Timestamps & References
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  notes?: string;
}

export interface PendingEnrollmentIntent {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  categoryName: string;
  price: number;
  duration: DurationOption;
  mode: LearningMode;
  lectureDays: LectureDays;
  language: LanguagePreference;
  location: string;
  fullName?: string;
  email?: string;
  phone?: string;
  timestamp: string;
}
