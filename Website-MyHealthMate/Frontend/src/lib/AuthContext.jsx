import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, userAPI } from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await userAPI.getMe()
      setUser(response.data)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setError(null)
      const response = await authAPI.loginUser(credentials)
      setUser(response.data)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await authAPI.registerUser(userData)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    try {
      await authAPI.logoutUser()
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }))
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
