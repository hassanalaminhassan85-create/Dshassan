import { AcademyCourse } from '../lib/academyCoursesData';

export type DurationOption = '1 Month' | '3 Months' | '6 Months';
export type LearningMode = 'Physical' | 'Virtual' | 'Hybrid';
export type LectureDays = 'Mondays-Wednesdays' | 'Wednesdays-Fridays' | 'Saturdays & Sundays';
export type LanguagePreference = 'English' | 'Hausa' | 'Yoruba' | 'Igbo';
export type GenderOption = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
export type IdTypeOption = 'NIN' | 'Birth Cert' | "Voter's ID" | "Driver's license" | 'Passport';
export type QualificationOption = 'SSCE' | 'WAEC' | 'NECO' | 'NABTEB' | 'Diploma' | 'B.Sc' | 'M.Sc' | 'PhD' | 'Other';
export type ComputerLiteracy = 'Basic' | 'Intermediate' | 'Advanced';
export type HearingChannel = 'Social Media' | 'WhatsApp' | 'Radio/TV' | 'Friend/Family' | 'Google' | 'Email' | 'Other';
export type RelationshipOption = 'Parent' | 'Sibling' | 'Spouse' | 'Friend' | 'Other';

export interface SelectedCourseConfig {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  categoryName: string;
  duration: DurationOption;
  mode: LearningMode;
  lectureDays: LectureDays;
  language: LanguagePreference;
  basePrice: number;
  calculatedPrice: number;
}

export interface EmergencyContact {
  fullName: string;
  relationship: RelationshipOption;
  phoneNumber: string;
  emailAddress: string;
  address: string;
}

export interface StudentRegistrationApplication {
  id: string; // e.g. DSTA/2026/894102
  createdAt: string;
  updatedAt: string;
  status: 'submitted' | 'under_review' | 'offer_issued' | 'enrolled' | 'rejected';
  
  // Step 2 & 3: Courses
  primaryCourse: SelectedCourseConfig;
  additionalCourses: SelectedCourseConfig[]; // Max 2 additional (total max 3)
  totalTuitionFee: number;
  depositDue70Percent: number;
  balanceDue30Percent: number;

  // Step 4: Personal Info
  passportPhoto?: string;
  fullName: string;
  dateOfBirth: string;
  gender: GenderOption;
  countryCode: string;
  phoneNumber: string;
  whatsappNumber: string;
  emailAddress: string;
  residentialAddress: string;
  idType: IdTypeOption;
  idNumber: string;

  // Step 5: Educational & Professional
  highestQualification: QualificationOption;
  institution: string;
  certificateUploadUrl?: string;
  certificateFileName?: string;
  currentOccupation: string;
  organisationBusiness: string;
  yearsOfExperience: string;
  computerLiteracy: ComputerLiteracy;
  ownsLaptop: boolean;
  ownsSmartphoneWithInternet: boolean;

  // Step 6: Motivation
  reasonForStudy: string; // min 50 words recommended
  futureGoals: string; // min 50 words recommended
  howDidYouHear: HearingChannel;
  howDidYouHearOther?: string;

  // Step 7: Emergency Contacts
  primaryEmergencyContact: EmergencyContact;
  secondaryEmergencyContact?: EmergencyContact;

  // Step 8: Declaration
  agreedToTerms: boolean;
  declarationApplicantName: string;
  signatureData: string; // typed or drawn base64
  declarationDate: string;

  // Review & Meta
  reviewConfirmed: boolean;
  notes?: string;
}
