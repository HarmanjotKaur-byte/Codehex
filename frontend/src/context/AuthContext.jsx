import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('paralipay_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getCurrentUser()
        .then((user) => {
          setCurrentUser(user);
        })
        .catch(() => {
          localStorage.removeItem('paralipay_token');
          setToken(null);
          setCurrentUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    localStorage.setItem('paralipay_token', res.access_token);
    setToken(res.access_token);
    setCurrentUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    localStorage.setItem('paralipay_token', res.access_token);
    setToken(res.access_token);
    setCurrentUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutUser();
      }
    } catch (_) {}
    localStorage.removeItem('paralipay_token');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    loading,
    refreshUser: async () => {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
      } catch (_) {}
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
