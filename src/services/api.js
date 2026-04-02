/**
 * Centralized API Service
 * Base URL from environment variables
 */

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

// Log for debugging
if (!process.env.REACT_APP_API_BASE_URL) {
  console.warn(
    "[API] REACT_APP_API_BASE_URL not defined in .env, using default: ",
    API_BASE_URL
  );
} else {
  console.log("[API] Base URL loaded:", API_BASE_URL);
}

/**
 * Generic fetch wrapper
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} Response data
 */
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Get token from localStorage if available
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    console.log(`[API] ${options.method || "GET"} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // If not JSON, get text and log error
      const text = await response.text();
      console.error(`[API] Non-JSON response: ${text.substring(0, 200)}`);

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - Response is not JSON`
        );
      }
      throw new Error("API returned non-JSON response");
    }

    if (!response.ok) {
      const error = new Error(
        data.message || `API Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${error.message}:`, error);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint, options = {}) => {
  return apiFetch(endpoint, {
    ...options,
    method: "GET",
  });
};

/**
 * POST request
 */
export const apiPost = (endpoint, data = {}, options = {}) => {
  return apiFetch(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const apiPut = (endpoint, data = {}, options = {}) => {
  return apiFetch(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request
 */
export const apiPatch = (endpoint, data = {}, options = {}) => {
  return apiFetch(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = (endpoint, options = {}) => {
  return apiFetch(endpoint, {
    ...options,
    method: "DELETE",
  });
};

/**
 * User API endpoints
 */
export const userAPI = {
  // Get all service providers
  getServiceProviders: (page = 1, limit = 10) =>
    apiGet(`/users/providers?page=${page}&limit=${limit}`),

  // Get all service users (buyers)
  getServiceUsers: (page = 1, limit = 10) =>
    apiGet(`/users/buyers?page=${page}&limit=${limit}`),

  // Get all users
  getAllUsers: (page = 1, limit = 10) =>
    apiGet(`/users?page=${page}&limit=${limit}`),

  // Get user by ID
  getUserById: (userId) => apiGet(`/users/${userId}`),

  // Update user
  updateUser: (userId, data) => apiPut(`/users/${userId}`, data),

  // Delete user
  deleteUser: (userId) => apiDelete(`/users/${userId}`),
};

/**
 * Authentication API endpoints
 */
export const authAPI = {
  signIn: (email, password) => apiPost("/auth/signin", { email, password }),

  signUp: (data) => apiPost("/auth/signup", data),

  logout: () => apiPost("/auth/logout", {}),

  refreshToken: () => apiPost("/auth/refresh-token", {}),

  // Admin endpoints
  adminLogin: (email, password) => apiPost("/admin/login", { email, password }),

  adminCreate: (email, password, fullName) =>
    apiPost("/admin/create", { email, password, fullName }),
};

/**
 * Admin Dashboard API endpoints
 */
export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: () => apiGet("/admin/dashboard/stats"),

  // Get dashboard metrics
  getDashboardMetrics: (timeRange = "30d") =>
    apiGet(`/admin/dashboard/metrics?timeRange=${timeRange}`),
};

/**
 * KYC API endpoints
 */
export const kycAPI = {
  getKYCList: (page = 1, limit = 10) =>
    apiGet(`/kyc?page=${page}&limit=${limit}`),

  getKYCById: (kycId) => apiGet(`/kyc/${kycId}`),

  submitKYC: (data) => apiPost("/kyc/submit", data),

  updateKYC: (kycId, data) => apiPut(`/kyc/${kycId}`, data),

  // Get provider details for KYC
  getProviderById: (providerId) => apiGet(`/providers/${providerId}`),

  // Verify KYC for a provider
  verifyProviderKYC: (providerId) =>
    apiPatch(`/admin/providers/${providerId}/kyc/verify`),

  // Reject KYC for a provider
  rejectProviderKYC: (providerId, reason) =>
    apiPost(`/providers/${providerId}/kyc/reject`, { reason }),
};

/**
 * Marketplace API endpoints
 */
export const marketplaceAPI = {
  getListings: (page = 1, limit = 10) =>
    apiGet(`/marketplace?page=${page}&limit=${limit}`),

  getListingById: (listingId) => apiGet(`/marketplace/${listingId}`),

  createListing: (data) => apiPost("/marketplace", data),

  updateListing: (listingId, data) => apiPut(`/marketplace/${listingId}`, data),

  deleteListing: (listingId) => apiDelete(`/marketplace/${listingId}`),
};

/**
 * Transactions API endpoints
 */
export const transactionsAPI = {
  // Get completed payment transactions
  getCompletedPayments: (page = 1, limit = 30) =>
    apiGet(
      `/transactions?type=payment&status=completed&page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc`
    ),

  // Get all transactions
  getTransactions: (page = 1, limit = 10) =>
    apiGet(`/transactions?page=${page}&limit=${limit}`),

  // Get transactions by type
  getTransactionsByType: (type, page = 1, limit = 10) =>
    apiGet(`/transactions?type=${type}&page=${page}&limit=${limit}`),

  // Get transactions by status
  getTransactionsByStatus: (status, page = 1, limit = 10) =>
    apiGet(`/transactions?status=${status}&page=${page}&limit=${limit}`),

  // Get transaction by ID
  getTransactionById: (transactionId) =>
    apiGet(`/transactions/${transactionId}`),
};

/**
 * Bookings API endpoints
 */
export const bookingsAPI = {
  // Get all bookings
  getBookings: (
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc"
  ) =>
    apiGet(
      `/bookings?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    ),

  // Get booking by ID
  getBookingById: (bookingId) => apiGet(`/bookings/${bookingId}`),

  // Create booking
  createBooking: (data) => apiPost("/bookings", data),

  // Update booking
  updateBooking: (bookingId, data) => apiPut(`/bookings/${bookingId}`, data),

  // Cancel booking
  cancelBooking: (bookingId) => apiDelete(`/bookings/${bookingId}`),
};

const apiService = {
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  userAPI,
  authAPI,
  dashboardAPI,
  kycAPI,
  marketplaceAPI,
  transactionsAPI,
  bookingsAPI,
};

export default apiService;

