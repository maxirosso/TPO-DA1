import AsyncStorage from '@react-native-async-storage/async-storage';
import EmailVerificationService from '../services/EmailVerificationService';

const USER_STORAGE_KEY = 'user_data';
const TOKEN_STORAGE_KEY = 'user_token';
const PENDING_USERS_KEY = 'pending_users';

export const authService = {
  login: async (email, password) => {
    try {
      // Check if email is verified
      const isVerified = await EmailVerificationService.isEmailVerified(email);
      if (!isVerified) {
        throw new Error('EMAIL_NOT_VERIFIED');
      }
      
      // In a real app, this would call your API
      // const response = await api.post('/auth/login', { email, password });
      
      // For now, simulate a successful login if credentials match
      // Get stored users to check credentials
      const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
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
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const { email, password, username, name } = userData;
      
      // Check if user already exists
      const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
      const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
      
      // Store the new user data
      pendingUsers[email] = {
        id: Date.now().toString(),
        email,
        password,
        username,
        name: name || username || '',
        createdAt: new Date().toISOString(),
      };
      
      // Save to storage
      await AsyncStorage.setItem(PENDING_USERS_KEY, JSON.stringify(pendingUsers));
      
      // Start the verification process
      const verificationSent = await EmailVerificationService.startVerification(email);
      
      if (!verificationSent) {
        throw new Error('Failed to send verification email');
      }
      
      return { email, success: true };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  verifyCode: async (email, code) => {
    try {
      const isValid = await EmailVerificationService.verifyCode(email, code);
      return isValid;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  },
  
  resendVerificationCode: async (email) => {
    try {
      const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
      const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
      
      // Check if email exists
      if (!pendingUsers[email]) {
        throw new Error('Email not found');
      }
      
      // Send new verification code
      return await EmailVerificationService.startVerification(email);
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },
  
  completeProfile: async (email, profileData) => {
    try {
      const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
      const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
      
      // Update user profile data
      if (pendingUsers[email]) {
        pendingUsers[email] = {
          ...pendingUsers[email],
          ...profileData,
          profileCompleted: true
        };
        
        await AsyncStorage.setItem(PENDING_USERS_KEY, JSON.stringify(pendingUsers));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Complete profile error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // Clear stored user data and token
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
  }
};

export default authService;