import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-dev-key-32-chars-required';

/**
 * Hash a national ID for secure storage
 * Using SHA256 for one-way hashing
 */
export function hashNationalId(nationalId: string): string {
  return crypto
    .createHash('sha256')
    .update(nationalId + ENCRYPTION_KEY)
    .digest('hex');
}

/**
 * Validate national ID format (Kenya-specific)
 * Format: 8 digits (no spaces or dashes)
 */
export function isValidNationalId(nationalId: string): boolean {
  // Remove spaces and dashes
  const cleaned = nationalId.replace(/[\s-]/g, '');
  // Must be 8 digits
  return /^\d{8}$/.test(cleaned);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
