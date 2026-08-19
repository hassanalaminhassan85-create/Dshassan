import { NIGERIAN_STATES, NATIONALITIES } from './tutorRegistration';

export { NIGERIAN_STATES, NATIONALITIES };

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type GovernmentIdType = 'NIN' | 'Birth Cert' | "Voter's ID" | "Driver's License" | 'Passport' | 'Other';
export type AcademicQualification = 'High School / SSCE' | 'ND / OND / HND' | 'Diploma' | 'B.Sc / B.A / B.Tech' | 'M.Sc / MBA' | 'PhD' | 'Professional Certification' | 'Other';
export type DeliveryMode = 'Physical' | 'Virtual' | 'Hybrid';

// ==========================================
// 1. SCHOLARSHIP APPLICATION TYPES
// ==========================================
export interface ScholarshipApplication {
  id: string; // e.g. DSTA-SCH/2026/182930
  createdAt: string;
  updatedAt: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'awarded' | 'declined';

  // Personal Info
  passportPhoto?: string;
  fullName: string;
  nationality: string;
  stateOfOrigin: string;
  tribe: string;
  maritalStatus: MaritalStatus;
  dateOfBirth: string;
  idType: GovernmentIdType;
  idNumber: string;
  phoneCountryCode: string;
  phoneNumber: string;
  emailAddress: string;

  // Academic & Course Info (6-Month Eligible Courses Only)
  programmeAppliedFor: string;
  courseCode: string;
  courseCategory: string;
  highestAcademicQualification: AcademicQualification;

  // Financial & Motivation Statement
  reasonForScholarship: string;
  relevantAchievementsSkills: string;
  currentOccupation: string;

  // Declaration & Signature
  declarationApplicantName: string;
  signatureData: string;
  declarationDate: string;
  agreedToTerms: boolean;
}

// ==========================================
// 2. INTERNSHIP APPLICATION TYPES
// ==========================================
export interface InternshipReferee {
  fullName: string;
  relationship: string;
  phoneWhatsapp: string;
  nationality: string;
  stateOfOrigin: string;
  residentialAddress: string;
}

export interface InternshipApplication {
  id: string; // e.g. DSTA-INT/2026/492019
  createdAt: string;
  updatedAt: string;
  status: 'submitted' | 'under_review' | 'matched' | 'placed' | 'completed';

  // Student Info
  fullName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  emailAddress: string;
  
  // Academic & Completion Details
  programmeCourse: string;
  courseCode: string;
  institution: string; // Defaults to DS Tech Academy
  programmeCompletionMonth: string; // e.g. 2026-06
  studentIdNumber: string;

  // Placement Preferences
  preferredInternshipArea: string;
  preferredInternshipOrganization: string;
  preferredDuration: '1 Month' | '3 Months' | '6 Months';
  preferredMode: DeliveryMode;

  // Referee Details
  referee: InternshipReferee;

  // Declaration
  studentDeclarationName: string;
  signatureData: string;
  declarationDate: string;
  agreedToTerms: boolean;
}

// ==========================================
// 3. CORPORATE TRAINING REQUEST TYPES
// ==========================================
export type OrganizationType = 
  | 'Private Enterprise / Corporate'
  | 'Public Sector / Government Agency'
  | 'NGO / Non-profit Organization'
  | 'Educational Institution / University'
  | 'Startup / Tech Venture'
  | 'Multilateral / International Body'
  | 'Other';

export type CorporateTrainingDuration = 
  | '1 Day Intensive'
  | '3 Days Workshop'
  | '1 Week Bootcamp'
  | '2 Weeks Executive'
  | '1 Month Masterclass'
  | 'Custom Duration';

export interface CorporateTrainingRequest {
  id: string; // e.g. DSTA-CORP/2026/928374
  createdAt: string;
  updatedAt: string;
  status: 'submitted' | 'reviewing_rfp' | 'proposal_sent' | 'contract_signed' | 'completed';

  // Company Details
  organizationName: string;
  companyAddress: string;
  contactPerson: string;
  phoneCountryCode: string;
  phoneWhatsappNumber: string;
  emailAddress: string;
  organizationType: OrganizationType;

  // Training Scope
  trainingWorkshopRequired: string;
  selectedCourseCode?: string;
  proposedEstimatedBudget: number | string; // in Naira (₦)
  preferredDate: string;
  trainingDuration: CorporateTrainingDuration;
  numberOfParticipants: number | string;
  preferredMode: DeliveryMode;
  trainingLocation: string;
  additionalRequirements: string;
}

// ==========================================
// 4. INDIVIDUAL PROFESSIONAL MENTORSHIP TYPES
// ==========================================
export interface MentorshipApplication {
  id: string; // e.g. DSTA-MENTOR/2026/582910
  createdAt: string;
  updatedAt: string;
  status: 'submitted' | 'mentor_matching' | 'discovery_call' | 'active' | 'completed';

  // Mentee Profile
  fullName: string;
  phoneCountryCode: string;
  phoneWhatsapp: string;
  emailAddress: string;
  currentOccupation: string;
  highestAcademicQualification: AcademicQualification;

  // Mentorship Goals
  mentorshipArea: string;
  selectedCourseCode?: string;
  specificGoalChallenge: string;
  proposedEstimatedBudget: number | string; // in Naira (₦)
  preferredMode: DeliveryMode;
  preferredDuration: '1 Month' | '3 Months' | '6 Months';
  preferredDaysTime: string;
  relevantExperience: string;

  // Affirmation
  signatureData: string;
  declarationDate: string;
  agreedToTerms: boolean;
}
