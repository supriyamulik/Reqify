import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('reqify_token');
    const storedUser = localStorage.getItem('reqify_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('reqify_token');
        localStorage.removeItem('reqify_user');
      }
    }
    setLoading(false);
  }, []);

  // In AuthContext.jsx - Update login method
  // Login function (Multi-Tenant)
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (response.success) {
        const { user, token, organization } = response.data;

        // Store in state
        setUser(user);
        setToken(token);

        // Store in localStorage
        localStorage.setItem('reqify_token', token);
        localStorage.setItem('reqify_user', JSON.stringify(user));

        return { success: true, user, organization };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.'
      };
    }
  };

  // Register (Analyst / Reviewer only)
  const register = async (name, email, password, role = 'analyst') => {
    try {
      if (!['analyst', 'reviewer'].includes(role)) {
        return {
          success: false,
          message: 'Only Analyst or Reviewer roles allowed',
        };
      }

      const response = await authService.register(
        name,
        email,
        password,
        role
      );

      if (response.success) {
        const { user, token } = response.data;

        setUser(user);
        setToken(token);

        localStorage.setItem('reqify_token', token);
        localStorage.setItem('reqify_user', JSON.stringify(user));

        return { success: true, user };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  };
  // Add this AFTER the register function and BEFORE the value object

  // Create organization (Multi-Tenant)
  const createOrganization = async (organizationName, ownerName, email, password) => {
    try {
      const response = await authService.createOrganization(
        organizationName,
        ownerName,
        email,
        password
      );

      if (response.success) {
        const { user, organization, token } = response.data;

        // Store in state
        setUser(user);
        setToken(token);

        // Store in localStorage
        localStorage.setItem('reqify_token', token);
        localStorage.setItem('reqify_user', JSON.stringify(user));

        return { success: true, user, organization };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Create Organization error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create organization'
      };
    }
  };
  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('reqify_token');
    localStorage.removeItem('reqify_user');
  };

  // Update user
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('reqify_user', JSON.stringify(updatedUser));
  };

  // Role check
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  // Auth check
  const isAuthenticated = () => !!user && !!token;

  // ✅ SINGLE value object
  const value = {
    user,
    token,
    loading,
    login,
    register,
    createOrganization,  // ← ADD THIS LINE
    logout,
    updateUser,
    hasRole,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
