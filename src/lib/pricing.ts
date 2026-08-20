// Single Authoritative Source of Truth for DS TECH Academy Official Fixed Pricing

export type AcademyDuration = '1-Month' | '3-Month' | '6-Month' | '1 Month' | '3 Months' | '6 Months';
export type AcademyTrainingMode = 'Virtual' | 'Physical' | 'Hybrid';

export interface PricingTier {
  duration: '1-Month' | '3-Month' | '6-Month';
  durationLabel: string;
  durationMonths: number;
  rates: {
    Virtual: number;
    Physical: number;
    Hybrid: number;
  };
  formattedRates: {
    Virtual: string;
    Physical: string;
    Hybrid: string;
  };
  highlights: string[];
}

export const OFFICIAL_ACADEMY_PRICING_MATRIX: Record<'1 Month' | '3 Months' | '6 Months', Record<AcademyTrainingMode, number>> = {
  '1 Month': {
    Virtual: 50000,
    Physical: 100000,
    Hybrid: 150000,
  },
  '3 Months': {
    Virtual: 100000,
    Physical: 200000,
    Hybrid: 300000,
  },
  '6 Months': {
    Virtual: 200000,
    Physical: 300000,
    Hybrid: 400000,
  },
};

export const ACADEMY_PRICING_TIERS: PricingTier[] = [
  {
    duration: '1-Month',
    durationLabel: '1-Month Intensive Foundations',
    durationMonths: 1,
    rates: {
      Virtual: 50000,
      Physical: 100000,
      Hybrid: 150000,
    },
    formattedRates: {
      Virtual: '₦50,000',
      Physical: '₦100,000',
      Hybrid: '₦150,000',
    },
    highlights: [
      'Comprehensive Core Syllabus',
      'Live Lab Demonstrations & Practical Projects',
      'DSTA Certificate of Completion',
      '24/7 Access to Student LMS Portal',
    ],
  },
  {
    duration: '3-Month',
    durationLabel: '3-Month Professional Diploma',
    durationMonths: 3,
    rates: {
      Virtual: 100000,
      Physical: 200000,
      Hybrid: 300000,
    },
    formattedRates: {
      Virtual: '₦100,000',
      Physical: '₦200,000',
      Hybrid: '₦300,000',
    },
    highlights: [
      'Full Hands-on Practicals & Real-world Projects',
      'Weekly 1-on-1 Faculty Mentorship & Code Audits',
      'Portfolio Defense & Industry Review',
      'Official CAC-Accredited DSTA Diploma (RC: 95)',
    ],
  },
  {
    duration: '6-Month',
    durationLabel: '6-Month Advanced Executive Mastery',
    durationMonths: 6,
    rates: {
      Virtual: 200000,
      Physical: 300000,
      Hybrid: 400000,
    },
    formattedRates: {
      Virtual: '₦200,000',
      Physical: '₦300,000',
      Hybrid: '₦400,000',
    },
    highlights: [
      'Comprehensive Deep-dive Industry Apprenticeship',
      'Direct Paid Internship Placement Pipeline',
      'Executive Leadership & Direct Client Engagements',
      'Lifetime Alumni Network & Career Placement Support',
    ],
  },
];

/**
 * Normalizes duration string or number to standard matrix key
 */
export function normalizeDuration(duration?: string | number): '1 Month' | '3 Months' | '6 Months' {
  if (!duration) return '1 Month';
  const str = String(duration).toLowerCase().trim();
  if (str.includes('6') || str.includes('six')) return '6 Months';
  if (str.includes('3') || str.includes('three')) return '3 Months';
  return '1 Month';
}

/**
 * Normalizes training mode string to standard matrix key
 */
export function normalizeMode(mode?: string): AcademyTrainingMode {
  if (!mode) return 'Physical';
  const str = mode.toLowerCase().trim();
  if (str.includes('virt') || str.includes('online')) return 'Virtual';
  if (str.includes('hyb')) return 'Hybrid';
  return 'Physical';
}

/**
 * Authoritative tuition price calculation for any Academy course.
 * Price is determined by duration, training mode, and the course's base price.
 */
export function getAcademyTuition(duration?: string | number, mode?: string, basePrice: number = 50000): number {
  const normDuration = normalizeDuration(duration);
  const normMode = normalizeMode(mode);

  let multiplier = 1;
  if (normDuration === '1 Month') {
    if (normMode === 'Virtual') multiplier = 1;
    else if (normMode === 'Physical') multiplier = 2;
    else if (normMode === 'Hybrid') multiplier = 3;
  } else if (normDuration === '3 Months') {
    if (normMode === 'Virtual') multiplier = 2;
    else if (normMode === 'Physical') multiplier = 4;
    else if (normMode === 'Hybrid') multiplier = 6;
  } else if (normDuration === '6 Months') {
    if (normMode === 'Virtual') multiplier = 4;
    else if (normMode === 'Physical') multiplier = 6;
    else if (normMode === 'Hybrid') multiplier = 8;
  }

  // Scale relative to 50,000 standard base
  const standardBase = 50000;
  const scale = basePrice / standardBase;
  return Math.round(standardBase * scale * multiplier);
}

/**
 * Formats a number to Nigerian Naira string (e.g. ₦100,000)
 */
export function formatNGN(amount: number): string {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

/**
 * Returns formatted tuition string for given duration and mode
 */
export function formatAcademyTuition(duration?: string | number, mode?: string): string {
  return formatNGN(getAcademyTuition(duration, mode));
}

/**
 * Returns minimum starting price for all academy courses (₦50,000 for 1-Month Virtual)
 */
export const MIN_ACADEMY_TUITION = 50000;
