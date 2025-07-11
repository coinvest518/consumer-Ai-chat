"use strict";
exports.__esModule = true;
exports.getBaseUrl = exports.getApiUrl = exports.API_BASE_URL = void 0;
/**
 * Base API URL for backend requests
 * In development: Use /api (proxied by Vite to localhost:3000)
 * In production: Use VITE_API_BASE_URL environment variable or full URL
 */
exports.API_BASE_URL = import.meta.env.DEV
    ? '/api'
    : (import.meta.env.VITE_API_BASE_URL || 'https://consumerai.info/api');
// Ensure trailing slash is handled correctly
exports.getApiUrl = function (endpoint) {
    var baseUrl = exports.API_BASE_URL.endsWith('/') ? exports.API_BASE_URL.slice(0, -1) : exports.API_BASE_URL;
    var cleanEndpoint = endpoint.startsWith('/') ? endpoint : "/" + endpoint;
    return "" + baseUrl + cleanEndpoint;
};
/**
 * Log environment state during initialization
 */
console.log('Environment:', {
    isProd: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
    baseUrl: exports.API_BASE_URL,
    deploymentUrl: import.meta.env.BASE_URL,
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasAstraToken: !!import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN,
    viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL
});
/**
 * Base URL for the application
 * Always returns empty string (root path) regardless of environment
 */
exports.getBaseUrl = function () {
    // Always use root path
    return '';
};
