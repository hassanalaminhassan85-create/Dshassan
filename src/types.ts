export interface PersonalInformation {
  fullName: string;
  maritalStatus: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  stateOfOrigin: string;
  lgaTownOfOrigin: string;
  stateOfResidence: string;
  residentialAddress: string;
  emailAddress: string;
  phoneNumbers: string;
  passportPhoto?: string; // Base64 or Image URL
}

export interface GuarantorInformation {
  fullName: string;
  hometown: string;
  currentAddress: string;
  phoneNumber: string;
  relationship: string;
}

export interface EducationalBackground {
  highestQualification: string;
  schoolInstitution: string;
  fieldOfStudy: string;
  isStudentOrGraduate: 'student' | 'graduate' | '';
}

export interface RelevantExperience {
  exp1: string;
  exp2: string;
  exp3: string;
}

export interface PositionAndSkills {
  majorRole: string;
  skillRole1: string;
  skillRole2: string;
  skillRole3: string;
}

export interface SpecializationInterest {
  interests: string[]; // e.g., Website Design, App Development, Content Creation, etc.
  otherDetails: string;
}

export interface PreferredWorkMode {
  monthlySalaryJob: 'on-site' | 'remote' | 'hybrid' | '';
  contractFreelanceJob: 'on-site' | 'remote' | 'hybrid' | '';
  availableForAnyOpportunity: boolean;
}

export interface JobApplication {
  id: string;
  createdAt: string;
  
  // Section 1-10
  personalInfo: PersonalInformation;
  guarantorInfo: GuarantorInformation;
  educationalBg: EducationalBackground;
  experiences: RelevantExperience;
  positionSkills: PositionAndSkills;
  specialization: SpecializationInterest;
  workMode: PreferredWorkMode;
  languageProficiency: string;
  personalStatement: string;
  
  // Section 11 - Declaration & Signature
  applicantSignature: string; // Base64 svg/png coordinates
  applicantSignatureType: 'draw' | 'type' | 'upload';
  declarationDate: string;
  
  // Section 12 - Company Approval / Offer Details (Simulated/Simultaneously available)
  approvedBy?: {
    approved: boolean;
    role: string;
    signature: string;
    date: string;
    offerRole: string;
    monthlySalary?: string;
  };

  // Appointment Letter Acceptance
  appointmentAccepted?: boolean;
  appointmentSignature?: string;
  appointmentAcceptanceDate?: string;
  appointmentAccountName?: string;
  appointmentBankName?: string;
  appointmentAccountNumber?: string;

  // HR/Admin status tracking
  status?: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  applicantEmail?: string;
  recruiterEmail?: string;
  submittedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  image_key?: string;
  hod_id?: string | null;
  display_order?: number;
  is_published?: number | boolean;
  is_archived?: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffMember {
  id: string;
  employee_id?: string;
  full_name: string;
  profile_photo_key?: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  job_title: string;
  role?: string; // e.g. CEO, Department Head, Staff Member
  department_id?: string | null;
  specialization?: string;
  biography?: string;
  skills?: string; // comma-separated or JSON
  qualifications?: string;
  certifications?: string;
  date_joined?: string;
  years_of_experience?: number;
  email?: string;
  phone?: string;
  social_links?: string; // JSON string
  reports_to?: string | null;
  team?: string;
  display_order?: number;
  status?: 'Active' | 'Pending' | 'On Leave' | 'Suspended' | 'Archived';
  is_published?: number | boolean;
  show_phone_publicly?: number | boolean;
  show_email_publicly?: number | boolean;
  show_bio_publicly?: number | boolean;
  show_qualifications_publicly?: number | boolean;
  show_social_publicly?: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffActivityLog {
  id: string;
  operator_email: string;
  action: string;
  details: string;
  created_at: string;
}
