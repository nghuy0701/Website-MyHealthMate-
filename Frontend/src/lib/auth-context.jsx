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
      const response = await userAPI.getMe();
      setUser(response.data);
    } catch (error) {
      // No active session
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
    } catch (error) {
      // Even if logout fails, clear user state
      setUser(null);
      throw error;
    }
  };

  const updateProfile = (updates) => {
    // TODO: Add API call to backend to update user profile
    // Example:
    // const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    // if (error) throw error;
    // setUser(data[0]);
    // localStorage.setItem('diabetes_user', JSON.stringify(data[0]));

    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('diabetes_user', JSON.stringify(updatedUser));
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