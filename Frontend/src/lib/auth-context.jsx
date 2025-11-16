import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from './api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First try to get from localStorage for instant UI
      const savedUser = localStorage.getItem('user_data');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      // Then verify with server
      const response = await userAPI.getMe();
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      // No active session
      setUser(null);
      localStorage.removeItem('user_data');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.loginUser({ email, password });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
      return response;
    } catch (error) {
      throw error;
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
        dob,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logoutUser();
      setUser(null);
      localStorage.removeItem('user_data');
    } catch (error) {
      // Even if logout fails, clear user state
      setUser(null);
      localStorage.removeItem('user_data');
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await userAPI.updateMe(updates);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await userAPI.getMe();
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, refreshUser, isLoading }}>
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