import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = 'user_data';
const TOKEN_STORAGE_KEY = 'user_token';
const PENDING_USERS_KEY = 'pending_users';

export const authService = {
  login: async (email, password) => {
    try {
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
        // Automatically mark as verified for development
        isVerified: true
      };
      
      // Save to storage
      await AsyncStorage.setItem(PENDING_USERS_KEY, JSON.stringify(pendingUsers));
      
      // Auto-verify the email for development
      await authService.markEmailAsVerified(email);
      
      return { email, success: true };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Add this new function to mark emails as verified
  markEmailAsVerified: async (email) => {
    try {
      const verifiedEmailsStr = await AsyncStorage.getItem('verified_emails');
      const verifiedEmails = verifiedEmailsStr ? JSON.parse(verifiedEmailsStr) : [];
      
      if (!verifiedEmails.includes(email)) {
        verifiedEmails.push(email);
        await AsyncStorage.setItem('verified_emails', JSON.stringify(verifiedEmails));
      }
      
      return true;
    } catch (error) {
      console.error('Error marking email as verified:', error);
      return false;
    }
  },
  
  verifyCode: async (email, code) => {
    // Always return true for development
    return true;
  },
  
  resendVerificationCode: async (email) => {
    // Always return true for development
    return true;
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
  },

  checkUsernameAvailability: async (username) => {
    try {
      const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
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
    } catch (error) {
      console.error('Username check error:', error);
      throw error;
    }
  },
};

export default authService;