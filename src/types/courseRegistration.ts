export type ProgrammeType = 'Scholarship' | 'Paid Programme';

export type ProgrammeDuration = 
  | 'Two Weeks' 
  | 'One Month' 
  | 'Three Months' 
  | 'Six Months';

export type TrainingMode = 
  | 'Virtual Classes' 
  | 'Physical Classes' 
  | 'Hybrid Classes';

export type TeachingLanguage = 
  | 'English' 
  | 'Hausa' 
  | 'Yoruba' 
  | 'Igbo';

export interface CourseSelectionItem {
  courseName: string;
  lecturer: string;
  weeklyLectureDays: string;
  lectureTime: string;
}

export interface CourseRegistrationRecord {
  id: string;
  registrationId: string;
  createdAt: string;
  updatedAt: string;

  // 1. Applicant Information
  fullName: string;
  nationality: string;
  stateOfOrigin: string;
  lga: string;
  ethnicGroup: string;
  sex: 'Male' | 'Female' | '';
  emailAddress: string;
  whatsappNumber: string;
  alternativePhone?: string;

  // 2. Programme Information
  programmeType: ProgrammeType | '';
  programmeDuration: ProgrammeDuration | '';
  trainingMode: TrainingMode | '';
  teachingLanguage: TeachingLanguage | '';

  // 3. Courses Applied For
  course1: CourseSelectionItem;
  course2?: CourseSelectionItem;
  course3?: CourseSelectionItem;

  // 4. Payment Record
  amountPaid: string | number;
  paymentIsNA: boolean;
  paymentStatus: string;

  // 5. Applicant Confirmation
  agreeConfirmation: boolean;
}
