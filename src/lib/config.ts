/**
 * Base API URL for backend requests
 * In production, use relative path
 * In development, use localhost
 */
export const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

/**
 * Base URL for the application
 * Always returns empty string (root path) regardless of environment
 */
export const getBaseUrl = (): string => {
  // Always use root path
  return '';
}; 