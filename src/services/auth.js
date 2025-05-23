import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api.config';

const USER_STORAGE_KEY = 'user_data';
const TOKEN_STORAGE_KEY = 'user_token';
const PENDING_USERS_KEY = 'pending_users';

// API Base URL desde la configuración centralizada
const API_BASE_URL = apiConfig.API_BASE_URL;

export const authService = {
  login: async (email, password) => {
    try {
      // Intentar login con el backend
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data && response.data.token) {
        const token = response.data.token;
        const user = response.data.user || {
          id: response.data.id,
          email: email,
          name: response.data.name || email.split('@')[0]
        };
        
        // Store user data and token
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
        
        return { user, token };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback a modo local para desarrollo/testing
      try {
        const pendingUsersStr = await AsyncStorage.getItem('pending_users');
        const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
        
        const userData = pendingUsers[email];
        
        if (userData && userData.password === password) {
          // Create user object for session
          const sessionUser = {
            id: userData.id,
            name: userData.name || email.split('@')[0],
            email: email,
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
          };
          
          const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
          
          // Store user data and token
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
          
          return { user: sessionUser, token };
        }
      } catch (localError) {
        console.error('Local fallback login error:', localError);
      }
      
      throw new Error('Invalid credentials');
    }
  },
  
  register: async (userData) => {
    try {
      // Intentar registro con el backend
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Error during registration');
      }
    } catch (error) {
      console.error('Registration error with backend:', error);
      
      // Fallback a modo local para desarrollo/testing
      try {
        const { email, password, username, name } = userData;
        
        // Check if user already exists
        const pendingUsersStr = await AsyncStorage.getItem('pending_users');
        const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
        
        if (pendingUsers[email]) {
          throw new Error('Email already registered');
        }
        
        // Store the new user data
        pendingUsers[email] = {
          id: Date.now().toString(),
          email,
          password,
          username,
          name: name || username || '',
          createdAt: new Date().toISOString(),
          isVerified: true
        };
        
        // Save to storage
        await AsyncStorage.setItem('pending_users', JSON.stringify(pendingUsers));
        
        // Auto-verify the email for development
        await authService.markEmailAsVerified(email);
        
        return { email, success: true };
      } catch (localError) {
        console.error('Local fallback registration error:', localError);
        throw localError;
      }
    }
  },
  
  markEmailAsVerified: async (email) => {
    try {
      // Intentar verificar email en backend
      await axios.post(`${API_BASE_URL}/auth/verify-email`, { email });
      return true;
    } catch (error) {
      console.error('Error marking email as verified in backend:', error);
      
      // Fallback local
      try {
        const verifiedEmailsStr = await AsyncStorage.getItem('verified_emails');
        const verifiedEmails = verifiedEmailsStr ? JSON.parse(verifiedEmailsStr) : [];
        
        if (!verifiedEmails.includes(email)) {
          verifiedEmails.push(email);
          await AsyncStorage.setItem('verified_emails', JSON.stringify(verifiedEmails));
        }
        
        return true;
      } catch (localError) {
        console.error('Local fallback error:', localError);
        return false;
      }
    }
  },
  
  logout: async () => {
    try {
      // No necesitamos llamada al backend, solo eliminar datos locales
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  verifyCode: async (email, code) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-code`, { email, code });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error verifying code with backend:', error);
      // Always return true for development fallback
      return true;
    }
  },
  
  resendVerificationCode: async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-code`, { email });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error resending code with backend:', error);
      // Always return true for development fallback
      return true;
    }
  },
  
  completeProfile: async (email, profileData) => {
    try {
      // Intenta actualizar el perfil en el backend
      const response = await axios.put(`${API_BASE_URL}/usuarios/perfil`, {
        email,
        ...profileData
      });
      
      return response.data && response.data.success;
    } catch (error) {
      console.error('Complete profile error with backend:', error);
      
      // Fallback local
      try {
        const pendingUsersStr = await AsyncStorage.getItem('pending_users');
        const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
        
        // Update user profile data
        if (pendingUsers[email]) {
          pendingUsers[email] = {
            ...pendingUsers[email],
            ...profileData,
            profileCompleted: true
          };
          
          await AsyncStorage.setItem('pending_users', JSON.stringify(pendingUsers));
          return true;
        }
        
        return false;
      } catch (localError) {
        console.error('Local fallback error:', localError);
        return false;
      }
    }
  },
  
  checkUsernameAvailability: async (username) => {
    try {
      // Intenta verificar disponibilidad del nombre de usuario en el backend
      const response = await axios.get(`${API_BASE_URL}/auth/check-username?username=${username}`);
      return response.data;
    } catch (error) {
      console.error('Username check error with backend:', error);
      
      // Fallback local
      try {
        const pendingUsersStr = await AsyncStorage.getItem('pending_users');
        const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
        
        // Check if username is taken
        const isTaken = Object.values(pendingUsers).some(user => user.username === username);
        
        if (!isTaken) {
          return { available: true };
        }
        
        // Generate suggestions if username is taken
        const suggestions = [];
        const baseUsername = username.replace(/\d+$/, ''); // Remove any trailing numbers
        
        // Add random numbers
        for (let i = 0; i < 3; i++) {
          const randomNum = Math.floor(Math.random() * 1000);
          suggestions.push(`${baseUsername}${randomNum}`);
        }
        
        // Add current year
        const currentYear = new Date().getFullYear();
        suggestions.push(`${baseUsername}${currentYear}`);
        
        return {
          available: false,
          suggestions
        };
      } catch (localError) {
        console.error('Local fallback error:', localError);
        throw localError;
      }
    }
  },
};

export default authService;