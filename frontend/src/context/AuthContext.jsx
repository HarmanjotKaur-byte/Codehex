// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('paralipay_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const user = await getMe();
          setCurrentUser(user);
        } catch (err) {
          console.error('Failed to load user profile with existing token:', err);
          localStorage.removeItem('paralipay_token');
          setToken(null);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const resp = await apiLogin(credentials);
      localStorage.setItem('paralipay_token', resp.access_token);
      setToken(resp.access_token);
      setCurrentUser(resp.user);
      setLoading(false);
      return resp;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const resp = await apiRegister(userData);
      localStorage.setItem('paralipay_token', resp.access_token);
      setToken(resp.access_token);
      setCurrentUser(resp.user);
      setLoading(false);
      return resp;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiLogout();
      }
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('paralipay_token');
      setToken(null);
      setCurrentUser(null);
    }
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const user = await getMe();
        setCurrentUser(user);
        return user;
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
    return null;
  };

  const value = {
    currentUser,
    token,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!currentUser,
    loading,
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
