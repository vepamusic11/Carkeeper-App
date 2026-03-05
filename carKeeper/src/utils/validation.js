import { t } from './i18n';

/**
 * Trim and strip potentially dangerous characters for display-only text.
 * Does NOT replace server-side sanitization.
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/[<>]/g, '');
};

/**
 * Validate email format.
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return t('fieldRequired');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return t('invalidEmail');
  }
  return null;
};

/**
 * Validate required field.
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return t('fieldRequired');
  }
  return null;
};

/**
 * Validate numeric value within an optional range.
 * Returns error string or null.
 */
export const validateNumeric = (value, { min, max, allowEmpty = true } = {}) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return allowEmpty ? null : t('fieldRequired');
  }
  const num = Number(String(value).replace(',', '.'));
  if (isNaN(num)) {
    return t('invalidAmount');
  }
  if (min !== undefined && num < min) {
    return t('invalidAmount');
  }
  if (max !== undefined && num > max) {
    return t('invalidAmount');
  }
  return null;
};
