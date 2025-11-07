import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Add API call to backend to check for existing user session
    const savedUser = localStorage.getItem('diabetes_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    // TODO: Add API call to backend for login
    // Example:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) throw error;
    // setUser(data.user);
    // localStorage.setItem('diabetes_user', JSON.stringify(data.user));

    // Mock login
    const mockUser = {
      id: '1',
      email,
      name: email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem('diabetes_user', JSON.stringify(mockUser));
  };

  const register = async (email, password, name) => {
    // TODO: Add API call to backend for registration
    // Example:
    // const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    // if (error) throw error;
    // setUser(data.user);
    // localStorage.setItem('diabetes_user', JSON.stringify(data.user));

    // Mock register
    const mockUser = {
      id: Date.now().toString(),
      email,
      name,
    };
    setUser(mockUser);
    localStorage.setItem('diabetes_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    // TODO: Add API call to backend for logout
    // Example:
    // await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('diabetes_user');
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