"use strict";
exports.__esModule = true;
exports.getBaseUrl = exports.getApiUrl = exports.API_BASE_URL = void 0;
/**
 * Base API URL for backend requests
 * In development: Use localhost URLs
 * In production: Use VITE_API_BASE_URL environment variable or production URL
 */
var PRODUCTION_API_URL = 'https://consumerai.info/api';
var DEVELOPMENT_API_URL = 'http://localhost:3000/api';
exports.API_BASE_URL = (function () {
    // Development environment
    if (import.meta.env.DEV) {
        return DEVELOPMENT_API_URL;
    }
    // Production environment
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    // Production fallback based on deployment URL
    var hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return DEVELOPMENT_API_URL;
    }
    return PRODUCTION_API_URL;
})();
// Get API URL based on environment and endpoint
exports.getApiUrl = function (endpoint) {
    var cleanEndpoint = endpoint.startsWith('/') ? endpoint : "/" + endpoint;
    // Handle local development
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
        return "" + DEVELOPMENT_API_URL + cleanEndpoint;
    }
    // Handle production with environment variable
    if (import.meta.env.VITE_API_BASE_URL) {
        var baseUrl = import.meta.env.VITE_API_BASE_URL.endsWith('/')
            ? import.meta.env.VITE_API_BASE_URL.slice(0, -1)
            : import.meta.env.VITE_API_BASE_URL;
        return "" + baseUrl + cleanEndpoint;
    }
    // Production fallback
    return "" + PRODUCTION_API_URL + cleanEndpoint;
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
