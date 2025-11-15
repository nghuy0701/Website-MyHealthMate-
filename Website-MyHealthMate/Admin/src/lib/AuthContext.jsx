import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Default admin user for the in-memory store
const defaultAdmin = { 
  email: 'admin@example.com', 
  password: 'password', 
  name: 'Admin User',
  roles: ['ADMIN'],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([defaultAdmin]); // In-memory user store

  const login = async (email, password) => {
    console.log('Attempting to log in with:', email);
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      console.log('Login successful for:', foundUser.email);
      setUser(foundUser);
      return Promise.resolve();
    } else {
      console.log('Login failed for:', email);
      return Promise.reject(new Error('Invalid credentials'));
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (email, password, name, secretKey) => {
    console.log('Registering new user:', { email, name });

    if (users.find(u => u.email === email)) {
      return Promise.reject(new Error('User with this email already exists.'));
    }

    let newUser;
    if (secretKey) {
      if (secretKey === 'MY_SECRET_KEY') { // Dummy secret key
        console.log('Admin registration');
        newUser = { email, password, name, roles: ['ADMIN'] };
      } else {
        throw new Error('Khóa bí mật không hợp lệ.');
      }
    } else {
      console.log('Standard user registration');
      newUser = { email, password, name, roles: ['USER'] };
    }
    
    setUsers(prevUsers => [...prevUsers, newUser]);
    console.log('Current users:', [...users, newUser]);
    // We don't log the user in automatically. They must now log in.
    return Promise.resolve();
  };

  const value = { user, isAuthenticated: !!user, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
