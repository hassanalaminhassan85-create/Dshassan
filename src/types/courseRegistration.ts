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
  learningMode?: TrainingMode | string;
  trainingMode?: TrainingMode | string;
  weeklyLectureDays: string;
  lectureTime: string;
  preferredLanguages?: TeachingLanguage[];
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
  // Multi-select Programme Types array stored in state, validation, PDF, and database
  programmeTypes: ProgrammeType[];
  // Scalar / joined representation for backward compatibility
  programmeType?: ProgrammeType | string;
  programmeDuration: ProgrammeDuration | '';
  // Default / primary training mode preference
  trainingMode: TrainingMode | string;
  trainingModes?: TrainingMode[];
  // Multi-select Teaching Languages array stored in state, validation, PDF, and database
  teachingLanguages: TeachingLanguage[];
  // Scalar / joined representation for backward compatibility
  teachingLanguage?: TeachingLanguage | string;

  // 3. Courses Applied For (each course has independent learningMode, lecturer, timetable)
  course1: CourseSelectionItem;
  course2?: CourseSelectionItem;
  course3?: CourseSelectionItem;
  courses?: CourseSelectionItem[];

  // 4. Payment Record
  amountPaid: string | number;
  paymentIsNA: boolean;
  paymentStatus: string;

  // 5. Applicant Confirmation
  agreeConfirmation: boolean;
}
