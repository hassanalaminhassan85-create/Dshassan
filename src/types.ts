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

  // HR/Admin status tracking
  status?: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}
