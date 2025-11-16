import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = {
  async request(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

const AdminContext = createContext(undefined);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Load from localStorage
      const savedAdmin = localStorage.getItem('admin_user');
      if (savedAdmin) {
        const adminData = JSON.parse(savedAdmin);
        setAdmin(adminData);
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
      setAdmin(null);
      localStorage.removeItem('admin_user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/admin/login', { email, password });
      
      if (response && response.data) {
        const adminData = response.data;
        setAdmin(adminData);
        localStorage.setItem('admin_user', JSON.stringify(adminData));
        toast.success('Đăng nhập admin thành công!');
        return adminData;
      }
    } catch (error) {
      const errorMessage = error.message || 'Đăng nhập thất bại';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/admin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
      localStorage.removeItem('admin_user');
      toast.success('Đã đăng xuất');
    }
  };

  const register = async (adminData) => {
    try {
      const response = await apiClient.post('/admin/register', adminData);
      
      if (response && response.data) {
        toast.success('Tạo tài khoản admin thành công!');
        return response.data;
      }
    } catch (error) {
      const errorMessage = error.message || 'Đăng ký thất bại';
      toast.error(errorMessage);
      throw error;
    }
  };

  const getAllAdmins = async () => {
    try {
      const response = await apiClient.get('/admin');
      return response.data;
    } catch (error) {
      toast.error('Không thể tải danh sách admin');
      throw error;
    }
  };

  const getAdminById = async (id) => {
    try {
      const response = await apiClient.get(`/admin/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Không thể tải thông tin admin');
      throw error;
    }
  };

  const updateAdmin = async (id, data) => {
    try {
      const response = await apiClient.put(`/admin/${id}`, data);
      toast.success('Cập nhật admin thành công!');
      
      // Update local admin data if updating self
      if (admin && admin._id === id) {
        const updatedAdmin = { ...admin, ...response.data };
        setAdmin(updatedAdmin);
        localStorage.setItem('admin_user', JSON.stringify(updatedAdmin));
      }
      
      return response.data;
    } catch (error) {
      toast.error('Không thể cập nhật admin');
      throw error;
    }
  };

  const deleteAdmin = async (id) => {
    try {
      await apiClient.delete(`/admin/${id}`);
      toast.success('Xóa admin thành công!');
    } catch (error) {
      toast.error('Không thể xóa admin');
      throw error;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isLoading,
        login,
        logout,
        register,
        getAllAdmins,
        getAdminById,
        updateAdmin,
        deleteAdmin
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
