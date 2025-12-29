/**
 * Validate Vietnamese phone number (10 digits starting with 0)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate date is not in future
 */
export const isValidPastDate = (date: Date): boolean => {
  return date <= new Date();
};

/**
 * Validate blood type
 */
export const isValidBloodType = (bloodType: string): boolean => {
  const validTypes = ['A', 'B', 'AB', 'O'];
  return validTypes.includes(bloodType.toUpperCase());
};

/**
 * Validate Rhesus factor
 */
export const isValidRhesus = (rhesus: string): boolean => {
  const validRhesus = ['+', '-', 'Dương', 'Âm'];
  return validRhesus.includes(rhesus);
};

/**
 * Sanitize string input (remove extra spaces)
 */
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Check if date is expired
 */
export const isExpired = (expiryDate: Date): boolean => {
  return expiryDate < new Date();
};

/**
 * Format date to Vietnamese format (DD/MM/YYYY)
 */
export const formatDateVN = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN').format(date);
};
