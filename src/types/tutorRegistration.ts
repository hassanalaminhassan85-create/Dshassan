import { AcademyCourse } from '../lib/academyCoursesData';

export type TeachingMode = 'Physical' | 'Virtual' | 'Hybrid';
export type TeachingDays = 'Monday-Friday' | 'Saturday-Sunday' | 'Both Weekdays & Weekends';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type TutorIdType = 'NIN' | 'Birth Cert' | "Voter's ID" | "Driver's License" | 'Passport' | 'Other';
export type TutorQualification = 'Diploma' | 'B.Sc' | 'M.Sc' | 'PhD' | 'Professional Certification' | 'Other';
export type StudyStatus = 'Student' | 'Graduate';
export type TutorLanguage = 'English' | 'Hausa' | 'Yoruba' | 'Igbo';

export interface PreviousTeachingExperience {
  institution: string;
  role: string;
  duration: string;
}

export interface TutorEmergencyContact {
  fullName: string;
  relationship: string;
  nationality: string;
  stateOfOrigin: string;
  residentialOfficeLocation: string;
  phoneWhatsappNumber: string;
}

export interface SelectedCoursePosition {
  courseCode: string;
  courseTitle: string;
  categoryName: string;
  selectedPositions: string[];
}

export interface TutorApplication {
  id: string; // e.g. DSTA-TUTOR/2026/782910
  createdAt: string;
  updatedAt: string;
  status: 'submitted' | 'screening' | 'interview_scheduled' | 'approved' | 'rejected';

  // Step 2: Personal Information
  passportPhoto?: string;
  fullName: string;
  nationality: string;
  stateOfOrigin: string;
  tribe: string;
  phoneCountryCode: string;
  phoneNumber: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
  maritalStatus: MaritalStatus;
  dateOfBirth: string;
  idType: TutorIdType;
  idNumber: string;
  emailAddress: string;
  residentialOfficeLocation: string;
  preferredTeachingMode: TeachingMode;
  preferredTeachingDays: TeachingDays;

  // Step 3: Academic & Professional Information
  highestQualification: TutorQualification;
  institution: string;
  studyStatus: StudyStatus;
  relevantCertifications: string[]; // List of professional certifications
  currentOccupation: string;
  organizationCompany: string;
  cvResumeUrl?: string;
  cvResumeFileName?: string;
  highestAcademicCertUrl?: string;
  highestAcademicCertFileName?: string;
  professionalCertUrl?: string;
  professionalCertFileName?: string;
  portfolioUrl?: string;
  portfolioFileName?: string;

  // Step 4: Course Selection & Positions
  selectedCoursesWithPositions: SelectedCoursePosition[];
  teachingLanguages: TutorLanguage[];

  // Step 5: Teaching & Industry Experience
  yearsOfExperience: string;
  previousExperiences: PreviousTeachingExperience[];
  practicalSkills: [string, string, string, string, string]; // Exactly 5 practical skills
  socialMediaHandle1: string;
  socialMediaHandle2: string;

  // Step 6: Motivation
  whySelectPosition: string;
  whyChooseDsTechAcademy: string;
  howDidYouHear: string;

  // Step 7: Emergency Contact
  emergencyContact: TutorEmergencyContact;

  // Step 8: Declaration
  agreedToTerms: boolean;
  declarationApplicantName: string;
  signatureData: string;
  declarationDate: string;
}

// 24 INSTRUCTOR CATEGORIES & POSITIONS DATASET
export interface InstructorCategory {
  id: string;
  number: number;
  name: string;
  iconName: string;
  positions: string[];
}

export const INSTRUCTOR_CATEGORIES: InstructorCategory[] = [
  {
    id: 'ai-automation',
    number: 1,
    name: 'Artificial Intelligence & Automation',
    iconName: 'Bot',
    positions: [
      'AI & Automation Instructor',
      'AI for Business & Productivity Instructor',
      'AI for Kids & Teens Instructor',
      'AI for Healthcare Instructor',
      'AI for Finance Instructor',
      'AI for Education Instructor',
      'AI for Agriculture Instructor',
      'AI for Legal Professionals Instructor',
      'AI for Government & Public Sector Instructor',
      'AI for CEOs & Executives Instructor'
    ]
  },
  {
    id: 'digital-marketing',
    number: 2,
    name: 'Digital Marketing, Sales & Business Growth',
    iconName: 'TrendingUp',
    positions: [
      'Digital Marketing Instructor',
      'Social Media Management Instructor',
      'SEO Instructor',
      'Sponsored Ads & Performance Marketing Instructor',
      'Sales & Business Development Instructor'
    ]
  },
  {
    id: 'content-creation',
    number: 3,
    name: 'Content Creation, Creative Media & Branding',
    iconName: 'Palette',
    positions: [
      'Content Creation & Video Editing Instructor',
      'Graphic Design & Branding Instructor',
      'Script Writing & Copywriting Instructor',
      'Photography & Videography Instructor',
      'Podcast Production Instructor',
      'Media & News Broadcasting Instructor',
      'Sports Content Creation & Monetization Instructor'
    ]
  },
  {
    id: 'it-software',
    number: 4,
    name: 'Information Technology & Software Development',
    iconName: 'Code',
    positions: [
      'Information Technology & Computer Science Instructor',
      'ICT Support & System Administration Instructor',
      'Website Design & Development Instructor',
      'Software Development Instructor',
      'Streaming App Development Instructor',
      'Mobile App Development Instructor',
      'UI/UX Design Instructor',
      'Programming & Coding Instructor',
      'Database & Systems Development Instructor'
    ]
  },
  {
    id: 'cybersecurity',
    number: 5,
    name: 'Cybersecurity & Digital Security',
    iconName: 'Shield',
    positions: [
      'Cybersecurity Instructor',
      'Ethical Hacking Instructor',
      'Network Security Instructor',
      'Cybersecurity Awareness & Digital Safety Instructor'
    ]
  },
  {
    id: 'data-fintech',
    number: 6,
    name: 'Data Science, Analytics & FinTech',
    iconName: 'BarChart3',
    positions: [
      'Data Analysis Instructor',
      'Business Intelligence Instructor',
      'Data Visualization Instructor',
      'Financial Technology (FinTech) Instructor',
      'Digital Banking Instructor',
      'Digital Finance & Business Analytics Instructor',
      'AI & Data Analytics for Finance Instructor'
    ]
  },
  {
    id: 'business-dev',
    number: 7,
    name: 'Business, Entrepreneurship & Professional Development',
    iconName: 'Briefcase',
    positions: [
      'Entrepreneurship & Business Startup Instructor',
      'Business Development Instructor',
      'Project Management Instructor',
      'Customer Service Instructor',
      'Leadership & Emotional Intelligence Instructor',
      'Corporate Etiquette Instructor',
      'Negotiation & Influencing Skills Instructor'
    ]
  },
  {
    id: 'hr-admin',
    number: 8,
    name: 'Human Resources & Administration',
    iconName: 'Users',
    positions: [
      'Human Resource Management Instructor',
      'Administrative & Office Management Instructor'
    ]
  },
  {
    id: 'executive-management',
    number: 9,
    name: 'Executive Leadership & Management',
    iconName: 'Crown',
    positions: [
      'CEO & Strategic Leadership Instructor',
      'Executive Business Management Instructor',
      'Restaurant Operations Management Instructor',
      'Hotel Operations Management Instructor',
      'NGO Operations Management Instructor',
      'Real Estate Business Management Instructor',
      'Construction Business Management Instructor',
      'AI & Digital Tools for Executives Instructor'
    ]
  },
  {
    id: 'real-estate',
    number: 10,
    name: 'Real Estate',
    iconName: 'Building',
    positions: [
      'Real Estate Sales & Marketing Instructor',
      'Real Estate Management Instructor',
      'Property Management Instructor',
      'Real Estate Investment Instructor',
      'Real Estate Digital Marketing Instructor',
      'Real Estate Content Creation Instructor',
      'Real Estate Photography & Videography Instructor'
    ]
  },
  {
    id: 'healthcare',
    number: 11,
    name: 'Healthcare',
    iconName: 'HeartPulse',
    positions: [
      'Healthcare Management & Digital Transformation Instructor',
      'AI for Healthcare Instructor',
      'Healthcare Digital Marketing Instructor',
      'Healthcare Content Creation Instructor'
    ]
  },
  {
    id: 'education-teaching',
    number: 12,
    name: 'Education & Teaching',
    iconName: 'GraduationCap',
    positions: [
      'AI for Teachers & Educators Instructor',
      'Digital Skills for Teachers Instructor',
      'Educational Content Creation Instructor',
      'EdTech & Digital Learning Instructor'
    ]
  },
  {
    id: 'agriculture-agritech',
    number: 13,
    name: 'Agriculture & Agribusiness',
    iconName: 'Sprout',
    positions: [
      'Agribusiness Management Instructor',
      'Agritech Instructor',
      'Agricultural Entrepreneurship Instructor',
      'Farm Business Management Instructor',
      'Agricultural Digital Marketing Instructor',
      'Agricultural Content Creation Instructor'
    ]
  },
  {
    id: 'hospitality-tourism',
    number: 14,
    name: 'Hospitality, Tourism & Events',
    iconName: 'Utensils',
    positions: [
      'Hospitality & Hotel Management Instructor',
      'Hotel Operations Instructor',
      'Restaurant Operations Instructor',
      'Tourism & Travel Management Instructor',
      'Event Planning & Management Instructor',
      'Event & Tourism Entrepreneurship Instructor',
      'Hotel & Restaurant Customer Management Instructor',
      'Hospitality Content Creation Instructor'
    ]
  },
  {
    id: 'legal-industry',
    number: 15,
    name: 'Legal Industry',
    iconName: 'Scale',
    positions: [
      'Legal Technology & AI Instructor',
      'Digital Marketing for Law Firms Instructor',
      'Legal Content Creation Instructor',
      'Law Firm Business Development Instructor'
    ]
  },
  {
    id: 'government-public',
    number: 16,
    name: 'Government, Politics & Public Administration',
    iconName: 'Landmark',
    positions: [
      'Public Relations & Government Communication Instructor',
      'E-Government & Digital Transformation Instructor',
      'Political Campaign Management Instructor',
      'Political Communication & Content Creation Instructor',
      'Public Administration Instructor'
    ]
  },
  {
    id: 'ngo-development',
    number: 17,
    name: 'NGO & Development Sector',
    iconName: 'HeartHandshake',
    positions: [
      'NGO Management Instructor',
      'Community Development Instructor',
      'Humanitarian Project Management Instructor',
      'NGO Fundraising & Resource Mobilization Instructor',
      'Monitoring & Evaluation (M&E) Instructor'
    ]
  },
  {
    id: 'fashion-beauty',
    number: 18,
    name: 'Fashion & Beauty',
    iconName: 'Shirt',
    positions: [
      'Fashion Business Management Instructor',
      'Fashion Digital Marketing Instructor',
      'Beauty Brand Management Instructor',
      'Fashion Content Creation Instructor',
      'E-Commerce for Fashion Brands Instructor'
    ]
  },
  {
    id: 'construction-engineering',
    number: 19,
    name: 'Construction & Engineering',
    iconName: 'HardHat',
    positions: [
      'Construction Project Management Instructor',
      'AutoCAD & Building Design Instructor',
      'Construction Business Development Instructor',
      'Construction Digital Marketing Instructor',
      'Construction Content Creation Instructor'
    ]
  },
  {
    id: 'oil-gas-energy',
    number: 20,
    name: 'Oil, Gas & Energy',
    iconName: 'Flame',
    positions: [
      'HSE Instructor',
      'Oil & Gas Project Management Instructor',
      'Energy Business Management Instructor',
      'Digital Skills for Energy Professionals Instructor',
      'Energy Content Creation Instructor'
    ]
  },
  {
    id: 'religious-ministry',
    number: 21,
    name: 'Religious Organizations & Faith-Based',
    iconName: 'Cross',
    positions: [
      'Church Media & Digital Ministry Instructor',
      'AI for Ministry & Administration Instructor',
      'Church Digital Marketing Instructor',
      'Religious Content Creation Instructor'
    ]
  },
  {
    id: 'manufacturing-production',
    number: 22,
    name: 'Manufacturing & Production',
    iconName: 'Factory',
    positions: [
      'Production Management Instructor',
      'Quality Assurance & Quality Control Instructor',
      'Inventory & Warehouse Management Instructor',
      'Manufacturing Operations Instructor'
    ]
  },
  {
    id: 'media-entertainment',
    number: 23,
    name: 'Media & Entertainment',
    iconName: 'Film',
    positions: [
      'Digital Journalism Instructor',
      'AI Film Production Instructor',
      'TV Presentation Instructor',
      'Comedy & Skit Production Instructor',
      'Entertainment Business Management Instructor'
    ]
  },
  {
    id: 'freelancing-remote',
    number: 24,
    name: 'Freelancing & Remote Work',
    iconName: 'Globe',
    positions: [
      'Freelancing & Remote Work Instructor',
      'Upwork & Fiverr Instructor'
    ]
  }
];

// NIGERIAN STATES & GENERAL LOCATIONS
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara', 'Diaspora / International'
];

export const NATIONALITIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States',
  'Canada', 'United Arab Emirates', 'Cameroon', 'Liberia', 'Sierra Leone', 'Other'
];

export const TUTOR_BENEFITS = [
  {
    number: '01',
    title: 'Attractive & Competitive Remuneration',
    desc: 'Lucrative compensation packages with flexible hourly rates, cohort milestone fees, or retainer models.'
  },
  {
    number: '02',
    title: 'Flexible Teaching Modes & Scheduling',
    desc: 'Teach physically at ultra-modern Abuja/Lagos tech hubs or instruct online from anywhere in the world.'
  },
  {
    number: '03',
    title: 'Faculty Brand Elevation & Recognition',
    desc: 'Elevate your personal thought-leadership brand across high-visibility West African tech summits and media.'
  },
  {
    number: '04',
    title: 'State-of-the-Art Media & Lab Infrastructure',
    desc: 'Full access to podcast recording suites, AI computing servers, video studios, and gigabit fiber internet.'
  },
  {
    number: '05',
    title: 'Dedicated Teaching Assistants & Lab Staff',
    desc: 'Focus entirely on lecturing; our lab assistants handle grading workflows, attendance, and student support.'
  },
  {
    number: '06',
    title: 'Curriculum Royalties & Content Monetization',
    desc: 'Earn recurring royalties when your masterclass materials and recorded bootcamps are purchased by corporate clients.'
  },
  {
    number: '07',
    title: 'Sponsored International Tech Certifications',
    desc: 'Get sponsored by DSTA for advanced global certifications (Google Cloud, AWS, Microsoft, PMI, Cisco).'
  },
  {
    number: '08',
    title: 'Corporate Training & Executive Consulting',
    desc: 'Priority assignment to high-value enterprise consulting projects and ministry digital transformation contracts.'
  },
  {
    number: '09',
    title: 'Executive Industry Networking Ecosystem',
    desc: 'Direct collaborative access to fellow veteran instructors, tech startup founders, and corporate C-suite executives.'
  },
  {
    number: '10',
    title: 'Verifiable Digital Credentials & CAC Letter',
    desc: 'Official appointment letter backed by CAC registration (RC-7945781) and cryptographic faculty badges.'
  },
  {
    number: '11',
    title: 'Performance Bonuses & Excellence Awards',
    desc: 'Annual faculty awards, top-tutor stipends, holiday bonuses, and sponsored international tech conference trips.'
  }
];
