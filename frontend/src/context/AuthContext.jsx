import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on application mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await authAPI.getMe();
      if (res && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      // 401 unauthenticated is normal if not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error('Login failed');
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error('Registration failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const isAdmin = user?.role === 'ADMIN';
  const isCandidate = user?.role === 'CANDIDATE';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        isCandidate,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
