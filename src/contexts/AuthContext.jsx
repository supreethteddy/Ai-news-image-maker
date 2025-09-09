import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/api/client.js';
import { User } from '@/api/entities.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('newsplay_token');
      if (token) {
        apiClient.setToken(token);
        const userData = await User.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token is invalid
          apiClient.logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiClient.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await User.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await User.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    User.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await User.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
