/**
 * Single Source of Truth for Company Registration & Corporate Compliance Details
 * DS TECH & DIGITAL MARKETING AGENCY LIMITED
 */

export const COMPANY_NAME = 'DS TECH & DIGITAL MARKETING AGENCY LIMITED';
export const COMPANY_NAME_SHORT = 'DS Tech Agency';

// Active CAC Registration Number
export const COMPANY_RC_NUMBER = '1,845,921';
export const COMPANY_RC_NUMBER_RAW = '1845921';

// Formatted Display Labels
export const COMPANY_CAC_RC_LABEL = 'CAC RC No. 1,845,921';
export const COMPANY_CAC_RC_FULL = 'CAC RC: 1,845,921';
export const COMPANY_RC_PREFIX = 'RC: 1,845,921';

// Tax and Corporate Identifiers
export const COMPANY_TIN = '24892019-0001';
export const COMPANY_SCUML_REF = 'SCUML-ABJ-2022-0941';

// Contact & Location
export const COMPANY_HEADQUARTERS = 'Area 1, Garki, Abuja, FCT, Nigeria';
export const COMPANY_REGIONAL_HUB = 'Adamawa Regional Hub, Yola, Nigeria';
export const COMPANY_PHONE = '+234 812 345 6789';
export const COMPANY_PHONE_ALT = '+234 813 123 4567';
export const COMPANY_EMAIL = 'support@dstechagency.com';
export const COMPANY_WEBSITE = 'https://www.dstechagency.com/';

/**
 * Normalizes any dynamic or backend CAC registration string to the active standard format "1,845,921".
 * If an updated backend registration number is provided, it formats it or falls back to COMPANY_RC_NUMBER.
 */
export function formatCompanyRc(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return COMPANY_RC_NUMBER;
  const cleaned = raw.replace(/^RC[:\s-]*/i, '').trim();
  if (
    !cleaned ||
    cleaned === '1849204' ||
    cleaned === '9550925' ||
    cleaned === '7945781' ||
    cleaned === '7849103' ||
    cleaned === '7850720' ||
    cleaned === '95' ||
    cleaned === '1845921'
  ) {
    return COMPANY_RC_NUMBER;
  }
  return cleaned;
}
