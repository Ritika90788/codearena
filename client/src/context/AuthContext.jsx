import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('codearena_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and check current user session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('codearena_token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const data = await api.get('/auth/me');
        if (data && data.success && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem('codearena_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        localStorage.removeItem('codearena_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('codearena_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (userData) => {
    const data = await api.post('/auth/register', userData);
    if (data.success && data.token) {
      localStorage.setItem('codearena_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const candidateEntry = async (name, email) => {
    const data = await api.post('/auth/candidate-entry', { name, email });
    if (data.success && data.token) {
      localStorage.setItem('codearena_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Candidate intake failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.warn('Logout API error:', err.message);
    } finally {
      localStorage.removeItem('codearena_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (formData) => {
    const data = await api.put('/auth/profile', formData);
    if (data.success && data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Failed to update profile');
  };

  const switchRole = async () => {
    try {
      const data = await api.post('/auth/switch-role', {});
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('codearena_token', data.token);
          setToken(data.token);
        }
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isInstructor: user?.role === 'instructor',
    isCandidate: user?.role === 'candidate',
    login,
    register,
    candidateEntry,
    logout,
    updateProfile,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
