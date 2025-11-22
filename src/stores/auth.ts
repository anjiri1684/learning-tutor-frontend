/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  time_zone?: string
  learning_goals?: string
  credit_balance?: number
  profile_picture_url?: string
  xp?: number
  referral_code?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser: User) => {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const newToken = response.data.token
      setToken(newToken)

      await fetchUser()

      if (user.value) {
        if (user.value.role === 'admin') {
          return { success: true, redirectPath: '/admin' }
        }
        if (user.value.role === 'teacher') {
          return { success: true, redirectPath: '/teacher' }
        }
      }
      return { success: true, redirectPath: '/dashboard' }
    } catch (error) {
      console.error('Login failed:', error)
      logout()
      return { success: false, message: 'Login failed. Please check your credentials.' }
    }
  }

  const fetchUser = async () => {
    if (!token.value) {
      user.value = null
      localStorage.removeItem('user')
      return
    }
    try {
      const response = await api.get('/profile/me')
      setUser(response.data)
      console.log('Fetched user:', response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout() 
    }
  }

  const register = async (credentials: {
    full_name: string
    email: string
    password: string
    referred_by_code?: string
  }) => {
    try {
      await api.post('/auth/register', credentials)
      await login({ email: credentials.email, password: credentials.password })
      return { success: true, message: '' }
    } catch (error: any) {
      console.error('Registration failed:', error)
      const message = error.response?.data?.error || 'An unknown error occurred.'
      return { success: false, message }
    }
  }

  const handleForgotPassword = async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email })
      return { success: true }
    } catch (error: any) {
      console.error('Forgot password error:', error)
      return {
        success: false, message: error.response?.data?.error || 'An unknown error occurred.'
      }
    }
  }

  const handleResetPassword = async (payload: { token: string; new_password: string }) => {
    try {
      const response = await api.post('/auth/reset-password', payload)
      return { success: true, message: response.data.message }
    } catch (error: any) {
      const message = error.response?.data?.error || 'An unknown error occurred.'
      return { success: false, message }
    }
  }

  const updateProfile = async (profileData: {
    full_name?: string
    time_zone?: string
    learning_goals?: string
    profile_picture_url?: string
  }) => {
    try {
      const response = await api.put('/profile/me', profileData)
      setUser(response.data)
      return { success: true, message: 'Profile updated successfully!' }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update profile.'
      return { success: false, message }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  onMounted(async () => {
    if (token.value && !user.value) {
      await fetchUser()
    }
  })

  return {
    token,
    user,
    login,
    logout,
    fetchUser,
    register,
    handleForgotPassword,
    handleResetPassword,
    updateProfile,
  }
})
