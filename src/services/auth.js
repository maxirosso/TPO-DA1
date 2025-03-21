import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = 'user_data';
const TOKEN_STORAGE_KEY = 'user_token';

export const authService = {
  login: async (email, password) => {
    try {
      // In a real app, this would call your API
      // const response = await api.post('/auth/login', { email, password });
      
      // For now, simulate a successful login if credentials match
      if (email === 'user@example.com' && password === 'password') {
        const userData = {
          id: '1',
          name: 'Sarah Johnson',
          email: 'user@example.com',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
        };
        
        const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        
        // Store user data and token
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
        
        return { user: userData, token };
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
      // In a real app, this would call your API
      // const response = await api.post('/auth/register', userData);
      
      // For now, simulate a successful registration
      const newUser = {
        id: Date.now().toString(),
        name: userData.name || 'New User',
        email: userData.email,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
      };
      
      const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // Store user data and token
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      return { user: newUser, token };
    } catch (error) {
      console.error('Registration error:', error);
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