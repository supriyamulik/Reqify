import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('reqify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth
      localStorage.removeItem('reqify_token');
      localStorage.removeItem('reqify_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  /* ===================== AUTH ===================== */

  // Register new user
  register: async (name, email, password, role = 'analyst') => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Registration failed'
      );
    }
  },

  // Login user (Multi-Tenant)
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      // Backend now returns organization info
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Login failed'
      );
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch profile'
      );
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  },

  /* ===================== ADMIN ===================== */

  // Get all users in organization (Admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  },

  // Change user role (Admin only)
  changeUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/auth/users/${userId}/role`, {
        role,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to change role'
      );
    }
  },

  // Toggle user active status (Admin only)
  toggleUserStatus: async (userId) => {
    try {
      const response = await api.patch(
        `/auth/users/${userId}/toggle-status`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update status'
      );
    }
  },

  /* ===================== ORGANIZATIONS ===================== */

  // Create organization (Multi-Tenant Signup)
  createOrganization: async (organizationName, ownerName, email, password) => {
    try {
      const response = await api.post('/organizations', {
        organizationName,
        ownerName,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create organization'
      );
    }
  },

  // Get organization details
  getOrganization: async (slug) => {
    try {
      const response = await api.get(`/organizations/${slug}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to get organization'
      );
    }
  },

  // Get organization members
  getOrganizationMembers: async (slug) => {
    try {
      const response = await api.get(`/organizations/${slug}/members`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to get members'
      );
    }
  },

  /* ===================== INVITATIONS ===================== */

  // Send team invitation
  sendInvitation: async (email, role) => {
    try {
      const response = await api.post('/invitations', {
        email,
        role,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to send invitation'
      );
    }
  },

  // Get organization invitations
  getInvitations: async () => {
    try {
      const response = await api.get('/invitations');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to get invitations'
      );
    }
  },

  // Resend invitation
  resendInvitation: async (invitationId) => {
    try {
      const response = await api.post(`/invitations/${invitationId}/resend`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to resend invitation'
      );
    }
  },

  // Revoke invitation
  revokeInvitation: async (invitationId) => {
    try {
      const response = await api.delete(`/invitations/${invitationId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to revoke invitation'
      );
    }
  },
};

export default authService;