import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(null);

  // Decode minimal claims from our JWT fallback (dev mode)
  const getUserFromToken = (jwtToken) => {
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1] || ''));
      const minimalUser = {
        id: payload.userId || payload.sub || null,
        email: payload.email || null,
        name: payload.name || null,
      };
      return minimalUser;
    } catch (e) {
      return null;
    }
  };

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for stored token
        const storedToken = localStorage.getItem('supabase_token');
        
        if (storedToken) {
          console.log('🔍 Found stored token, using token claims for faster startup...');
          
          // Use token claims immediately for faster startup
          const minimalUser = getUserFromToken(storedToken);
          if (minimalUser) {
            setUser(minimalUser);
            setToken(storedToken);
            console.log('✅ User restored from token claims');
          } else {
            localStorage.removeItem('supabase_token');
            setUser(null);
            setToken(null);
          }
          
          // Fetch fresh profile in background (non-blocking)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`
              }
            });
            
            if (response.ok) {
              const profileData = await response.json();
              if (profileData.success && profileData.data) {
                console.log('✅ Fresh user profile fetched from database:', profileData.data);
                setUser(profileData.data);
              }
            }
          } catch (profileError) {
            console.log('⚠️ Background profile fetch failed, using token claims');
          }
        } else {
          console.log('🔍 No stored token found');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with backend API:', email);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Login successful:', data.message);
        console.log('🔑 Token received:', data.data.token);
        
        // Store the token immediately
        setToken(data.data.token);
        localStorage.setItem('supabase_token', data.data.token);
        
        // Use user data from login response if available (faster)
        if (data.data.user) {
          console.log('✅ Using user data from login response');
          setUser(data.data.user);
          return { 
            success: true, 
            message: data.message,
            user: data.data.user 
          };
        }
        
        // Fallback: derive user from token if no user data in response
        console.log('⚠️ No user data in response, using token claims');
        const minimalUser = getUserFromToken(data.data.token);
        setUser(minimalUser || null);
        return { 
          success: true, 
          message: data.message,
          user: minimalUser 
        };
      } else {
        console.log('❌ Login failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration with backend API:', email);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Registration successful:', data.message);
        return { 
          success: true, 
          message: data.message,
          user: data.data?.user 
        };
      } else {
        console.log('Registration failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      
      // Clear local state and storage
      setUser(null);
      setToken(null);
      localStorage.removeItem('supabase_token');
      localStorage.removeItem('user');
      
      // Redirect to landing page
      window.location.href = '/';
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData) => {
    console.log('UpdateProfile function called');
    return { success: false, message: 'UpdateProfile not implemented yet' };
  };

  const changePassword = async (currentPassword, newPassword) => {
    console.log('ChangePassword function called');
    return { success: false, message: 'ChangePassword not implemented yet' };
  };

  // Fetch user credits
  const fetchCredits = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/credits/balance`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCredits(data.credits);
        }
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  // Refresh credits (can be called after operations that use credits)
  const refreshCredits = () => {
    if (token) {
      fetchCredits();
    }
  };

  // Fetch credits when user logs in or token changes
  React.useEffect(() => {
    if (token && user) {
      fetchCredits();
    } else {
      setCredits(null);
    }
  }, [token, user]);

  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    loading,
    credits,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshCredits,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};