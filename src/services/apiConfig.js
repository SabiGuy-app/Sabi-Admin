/**
 * API Configuration
 * Centralized configuration for API service
 */

export const API_CONFIG = {
  BASE_URL:
    process.env.REACT_APP_API_BASE_URL || "https://sabiguy.onrender.com/api/v1",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const ENDPOINTS = {
  // User endpoints
  USERS: {
    GET_PROVIDERS: "/users/providers",
    GET_SERVICE_USERS: "/users/users",
    GET_ALL: "/users",
    GET_BY_ID: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  // Auth endpoints
  AUTH: {
    SIGN_IN: "/auth/signin",
    SIGN_UP: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
  },

  // KYC endpoints
  KYC: {
    GET_LIST: "/kyc",
    GET_BY_ID: (id) => `/kyc/${id}`,
    SUBMIT: "/kyc/submit",
    UPDATE: (id) => `/kyc/${id}`,
  },

  
};

export default {
  API_CONFIG,
  ENDPOINTS,
};
