# API Service Documentation

## Overview

Centralized API service for all HTTP requests in the application. This provides a single point of configuration and maintains clean separation between API logic and components.

## Setup

### Environment Variables

Create a `.env` file in the root directory:

```bash
REACT_APP_API_BASE_URL=https://sabiguy.onrender.com/api/v1
```

You can use `.env.example` as a template for different environments.

## Usage

### Basic HTTP Methods

```javascript
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "services/api";

// GET request
const data = await apiGet("/users/providers?page=1&limit=10");

// POST request
const response = await apiPost("/auth/signin", {
  email: "user@example.com",
  password: "password",
});

// PUT request
const updated = await apiPut("/users/123", { name: "New Name" });

// PATCH request
const patched = await apiPatch("/users/123", { status: "active" });

// DELETE request
await apiDelete("/users/123");
```

### Organized API Endpoints

Use pre-built API namespaces for organized endpoint access:

```javascript
import { userAPI, authAPI, kycAPI, marketplaceAPI } from "services/api";

// User API
const providers = await userAPI.getServiceProviders(1, 10);
const user = await userAPI.getUserById("user-id");
const updated = await userAPI.updateUser("user-id", { name: "New Name" });

// Auth API
const loginResponse = await authAPI.signIn("email@test.com", "password");
await authAPI.logout();

// KYC API
const kycList = await kycAPI.getKYCList(1, 10);
await kycAPI.submitKYC(kycData);

// Marketplace API
const listings = await marketplaceAPI.getListings(1, 10);
await marketplaceAPI.createListing(listingData);
```

## Features

### ✅ Automatic Authentication

- Automatically includes Bearer token from localStorage if available
- Looks for tokens under keys: `token` or `authToken`

### ✅ Built-in Error Handling

- Catches and logs API errors
- Throws detailed error objects with status codes

### ✅ Content-Type Management

- Automatically sets `Content-Type: application/json`
- Properly serializes request bodies

### ✅ Extensible

- Easy to add new API endpoints
- Maintains consistent patterns across the app

## Adding New Endpoints

### 1. Update `apiConfig.js`

```javascript
ENDPOINTS: {
  BOOKINGS: {
    GET_LIST: "/bookings",
    GET_BY_ID: (id) => `/bookings/${id}`,
    CREATE: "/bookings",
  }
}
```

### 2. Update `api.js`

```javascript
export const bookingsAPI = {
  getBookings: (page = 1, limit = 10) =>
    apiGet(`/bookings?page=${page}&limit=${limit}`),

  getBookingById: (bookingId) => apiGet(`/bookings/${bookingId}`),

  createBooking: (data) => apiPost("/bookings", data),
};
```

### 3. Use in Component

```javascript
import { bookingsAPI } from "services/api";

const bookings = await bookingsAPI.getBookings();
```

## Error Handling

```javascript
try {
  const data = await userAPI.getServiceProviders();
} catch (error) {
  console.error("Error:", error.message);
  console.error("Status:", error.status);
}
```

## Best Practices

1. **Use Organized APIs**: Prefer using `userAPI`, `authAPI`, etc. over raw `apiGet()` calls
2. **Environment-Specific URLs**: Update base URL via `.env` files for different environments
3. **Token Management**: Store tokens in localStorage under `token` or `authToken` keys
4. **Error Handling**: Always wrap API calls in try-catch blocks
5. **Loading States**: Use loading and error states in components
6. **No Hardcoded URLs**: Never hardcode API URLs in components

## Files

- `src/services/api.js` - Main API service with all methods
- `src/services/apiConfig.js` - Configuration and endpoint definitions
- `.env` - Environment variables (gitignored)
- `.env.example` - Template for environment setup
