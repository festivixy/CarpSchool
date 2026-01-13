/**
 * CarpSchool API Client SDK
 * 
 * A complete JavaScript client for the CarpSchool REST API with authentication support.
 * Works in Node.js, React, React Native, and browser environments.
 * 
 * @version 1.0.0
 * @license MIT
 */

class CarpSchoolAPIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'CarpSchoolAPIError';
    this.status = status;
    this.response = response;
  }
}

class CarpSchoolAPI {
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'https://api.carp.school/api/v1';
    this.token = options.token || null;
    this.onTokenExpired = options.onTokenExpired || (() => {});
    this.onTokenRefreshed = options.onTokenRefreshed || (() => {});
  }

  /**
   * Set authentication token
   * @param {string} token - API token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Get current token
   * @returns {string|null}
   */
  getToken() {
    return this.token;
  }

  /**
   * Make HTTP request to API
   * @private
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token && !options.noAuth) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && this.token) {
        this.onTokenExpired();
        throw new CarpSchoolAPIError('Token expired', 401, data);
      }

      if (!response.ok) {
        throw new CarpSchoolAPIError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof CarpSchoolAPIError) {
        throw error;
      }
      throw new CarpSchoolAPIError(`Network error: ${error.message}`, 0, null);
    }
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Register new user account
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.username - Username
   * @param {string} userData.password - Password
   * @param {Object} userData.profile - Optional profile data
   * @returns {Promise<Object>} User data and token
   */
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
      noAuth: true
    });
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - Email (or username)
   * @param {string} credentials.username - Username (or email)
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} User data and token
   */
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
      noAuth: true
    });
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  /**
   * Logout current session
   * @returns {Promise<Object>}
   */
  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST'
    });
    
    this.setToken(null);
    return response.data;
  }

  /**
   * Logout all sessions
   * @returns {Promise<Object>}
   */
  async logoutAll() {
    const response = await this.request('/auth/logout-all', {
      method: 'POST'
    });
    
    this.setToken(null);
    return response.data;
  }

  /**
   * Refresh authentication token
   * @param {boolean} revokeOld - Whether to revoke old token
   * @returns {Promise<string>} New token
   */
  async refreshToken(revokeOld = false) {
    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: { revokeOld }
    });
    
    const newToken = response.data.token;
    this.setToken(newToken);
    this.onTokenRefreshed(newToken);
    
    return newToken;
  }

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>}
   */
  async changePassword(currentPassword, newPassword) {
    return await this.request('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword }
    });
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>}
   */
  async forgotPassword(email) {
    return await this.request('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      noAuth: true
    });
  }

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>}
   */
  async verifyEmail(token) {
    return await this.request('/auth/verify-email', {
      method: 'POST',
      body: { token },
      noAuth: true
    });
  }

  /**
   * Resend email verification
   * @param {string} email - User email
   * @returns {Promise<Object>}
   */
  async resendVerification(email) {
    return await this.request('/auth/resend-verification', {
      method: 'POST',
      body: { email },
      noAuth: true
    });
  }

  /**
   * Check username/email availability
   * @param {Object} check - What to check
   * @param {string} check.email - Email to check
   * @param {string} check.username - Username to check
   * @returns {Promise<Object>} Availability status
   */
  async checkAvailability(check) {
    const params = new URLSearchParams(check).toString();
    return await this.request(`/auth/check-availability?${params}`, {
      noAuth: true
    });
  }

  /**
   * Validate current token
   * @returns {Promise<Object>}
   */
  async validateToken() {
    return await this.request('/validate-key', {
      method: 'POST'
    });
  }

  // ============================================================================
  // USER & PROFILE METHODS
  // ============================================================================

  /**
   * Get current user information
   * @returns {Promise<Object>}
   */
  async getMe() {
    const response = await this.request('/me');
    return response.data;
  }

  /**
   * Get account status
   * @returns {Promise<Object>}
   */
  async getAccountStatus() {
    const response = await this.request('/account/status');
    return response.data;
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>}
   */
  async updateProfile(profileData) {
    return await this.request('/profile', {
      method: 'PUT',
      body: profileData
    });
  }

  /**
   * Get user profile
   * @returns {Promise<Object>}
   */
  async getProfile() {
    const response = await this.request('/profile');
    return response.data;
  }

  /**
   * Delete account
   * @param {string} password - Current password
   * @returns {Promise<Object>}
   */
  async deleteAccount(password) {
    const response = await this.request('/account', {
      method: 'DELETE',
      body: { 
        password, 
        confirmDelete: 'DELETE' 
      }
    });
    
    this.setToken(null);
    return response.data;
  }

  // ============================================================================
  // API KEY MANAGEMENT
  // ============================================================================

  /**
   * Generate new API key
   * @returns {Promise<string>} New API key
   */
  async generateAPIKey() {
    const response = await this.request('/api-keys', {
      method: 'POST'
    });
    return response.data.apiKey;
  }

  /**
   * List user's API keys
   * @returns {Promise<Array>}
   */
  async listAPIKeys() {
    const response = await this.request('/api-keys');
    return response.data;
  }

  /**
   * Get current API key info
   * @returns {Promise<Object>}
   */
  async getCurrentAPIKey() {
    const response = await this.request('/api-keys/current');
    return response.data;
  }

  /**
   * Revoke API key
   * @param {string} keyId - API key ID to revoke
   * @returns {Promise<Object>}
   */
  async revokeAPIKey(keyId) {
    return await this.request(`/api-keys/${keyId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Revoke all login-based tokens
   * @returns {Promise<Object>}
   */
  async revokeLoginTokens() {
    return await this.request('/api-keys/login-based', {
      method: 'DELETE'
    });
  }

  // ============================================================================
  // RIDES & CARPOOLING
  // ============================================================================

  /**
   * List rides with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Rides data with pagination
   */
  async listRides(options = {}) {
    const params = new URLSearchParams(options).toString();
    const response = await this.request(`/rides${params ? '?' + params : ''}`);
    return response;
  }

  /**
   * Create new ride
   * @param {Object} rideData - Ride data
   * @returns {Promise<Object>}
   */
  async createRide(rideData) {
    return await this.request('/rides', {
      method: 'POST',
      body: rideData
    });
  }

  /**
   * Get ride details
   * @param {string} rideId - Ride ID
   * @returns {Promise<Object>}
   */
  async getRide(rideId) {
    const response = await this.request(`/rides/${rideId}`);
    return response.data;
  }

  /**
   * Update ride
   * @param {string} rideId - Ride ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>}
   */
  async updateRide(rideId, updateData) {
    return await this.request(`/rides/${rideId}`, {
      method: 'PUT',
      body: updateData
    });
  }

  /**
   * Delete ride
   * @param {string} rideId - Ride ID
   * @returns {Promise<Object>}
   */
  async deleteRide(rideId) {
    return await this.request(`/rides/${rideId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Join ride
   * @param {string} rideId - Ride ID
   * @returns {Promise<Object>}
   */
  async joinRide(rideId) {
    return await this.request(`/rides/${rideId}/join`, {
      method: 'POST'
    });
  }

  /**
   * Leave ride
   * @param {string} rideId - Ride ID
   * @returns {Promise<Object>}
   */
  async leaveRide(rideId) {
    return await this.request(`/rides/${rideId}/leave`, {
      method: 'POST'
    });
  }

  /**
   * Get user's rides
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async getMyRides(options = {}) {
    const params = new URLSearchParams(options).toString();
    const response = await this.request(`/my-rides${params ? '?' + params : ''}`);
    return response;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get API health status
   * @returns {Promise<Object>}
   */
  async getHealth() {
    const response = await this.request('/health', { noAuth: true });
    return response.data;
  }

  /**
   * List schools
   * @returns {Promise<Array>}
   */
  async listSchools() {
    const response = await this.request('/schools');
    return response.data;
  }

  /**
   * Get notifications
   * @returns {Promise<Array>}
   */
  async getNotifications() {
    const response = await this.request('/notifications');
    return response.data;
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>}
   */
  async markNotificationRead(notificationId) {
    return await this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }
}

// ============================================================================
// REACT HOOK (for React/React Native)
// ============================================================================

/**
 * React hook for CarpSchool API authentication
 * Usage:
 * 
 * const { user, login, logout, loading, error } = useCarpSchoolAuth();
 */
function useCarpSchoolAuth(apiBaseURL) {
  if (typeof React === 'undefined') {
    throw new Error('useCarpSchoolAuth requires React to be available');
  }

  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [api] = React.useState(() => new CarpSchoolAPI({ baseURL: apiBaseURL }));

  const login = React.useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.login(credentials);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const logout = React.useCallback(async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const register = React.useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.register(userData);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    api
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

// Node.js / ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CarpSchoolAPI, CarpSchoolAPIError, useCarpSchoolAuth };
}

// ES6 modules
if (typeof window !== 'undefined') {
  window.CarpSchoolAPI = CarpSchoolAPI;
  window.CarpSchoolAPIError = CarpSchoolAPIError;
  window.useCarpSchoolAuth = useCarpSchoolAuth;
}

export { CarpSchoolAPI, CarpSchoolAPIError, useCarpSchoolAuth };
