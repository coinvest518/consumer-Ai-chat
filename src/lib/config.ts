/**
 * Base API URL for backend requests
 * In development: Use /api (proxied by Vite to localhost:3000)
 * In production: Use VITE_API_BASE_URL environment variable or full URL
 */
export const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://consumerai.info/api');

// Ensure trailing slash is handled correctly
export const getApiUrl = (endpoint: string) => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Log environment state during initialization
 */
console.log('Environment:', {
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
  baseUrl: API_BASE_URL,
  deploymentUrl: import.meta.env.BASE_URL,
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasAstraToken: !!import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN,
  viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL,
});

/**
 * Base URL for the application
 * Always returns empty string (root path) regardless of environment
 */
export const getBaseUrl = (): string => {
  // Always use root path
  return '';
};