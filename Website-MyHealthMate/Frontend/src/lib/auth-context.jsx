import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from './api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await userAPI.getMe();
      setUser(response.data);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.loginUser({ email, password });
      setUser(response.data);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (email, password, userName, displayName, phone, gender, dob) => {
    try {
      const response = await authAPI.registerUser({
        email,
        password,
        userName,
        displayName,
        phone,
        gender,
        dob
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Đăng ký thất bại');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userId, updates) => {
    try {
      const response = await userAPI.updateMe(userId, updates);
      setUser((prev) => ({ ...prev, ...response.data }));
      return response;
    } catch (error) {
      throw new Error(error.message || 'Cập nhật thông tin thất bại');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
