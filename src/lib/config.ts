/**
 * Base API URL for backend requests
 * In production, use relative path
 * In development, use localhost:5001
 */
export const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:5001/api';

/**
 * Log environment state during initialization
 */
console.log('Environment:', {
  isProd: import.meta.env.PROD,
  apiBaseUrl: API_BASE_URL,
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasAstraToken: !!import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN,
});

/**
 * Base URL for the application
 * Always returns empty string (root path) regardless of environment
 */
export const getBaseUrl = (): string => {
  // Always use root path
  return '';
}; 