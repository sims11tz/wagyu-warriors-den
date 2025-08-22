/**
 * Security utility functions for input sanitization and validation
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The user input to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 500); // Limit length to prevent abuse
};

/**
 * Validates and sanitizes handles/usernames
 * @param handle - The handle to validate
 * @returns Clean handle or null if invalid
 */
export const sanitizeHandle = (handle: string): string | null => {
  const cleaned = handle.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  
  if (cleaned.length < 3 || cleaned.length > 20) {
    return null;
  }
  
  return cleaned;
};

/**
 * Validates email format
 * @param email - Email to validate
 * @returns boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Sanitizes bio text content
 * @param bio - Bio text to sanitize
 * @returns Sanitized bio
 */
export const sanitizeBio = (bio: string): string => {
  return bio
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .slice(0, 500); // Limit bio length
};