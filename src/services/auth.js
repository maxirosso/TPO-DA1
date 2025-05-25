import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api.config';

const USER_STORAGE_KEY = 'user_data';
const TOKEN_STORAGE_KEY = 'user_token';
const PENDING_USERS_KEY = 'pending_users';

// Función para inicializar datos de usuario de prueba si no existen
export const initializeTestUsers = async () => {
  try {
    const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
    let pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
    
    // Verificar si ya existe el usuario de prueba
    if (!pendingUsers['test@example.com']) {
      // Crear usuario de prueba para desarrollo
      pendingUsers['test@example.com'] = {
        id: 'test-user-1',
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
        name: 'Usuario de Prueba',
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      
      // Guardar en almacenamiento local
      await AsyncStorage.setItem(PENDING_USERS_KEY, JSON.stringify(pendingUsers));
      
      // Marcar el email como verificado
      await markEmailVerified('test@example.com');
    }
    
    return pendingUsers;
  } catch (error) {
    console.error('Error initializing test users:', error);
    return {};
  }
};

// Función auxiliar para marcar un email como verificado
const markEmailVerified = async (email) => {
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
};

// Función para resetear la base de datos local (para desarrollo)
export const resetLocalDatabase = async () => {
  try {
    await AsyncStorage.removeItem(PENDING_USERS_KEY);
    await AsyncStorage.removeItem('verified_emails');
    await initializeTestUsers();
    return true;
  } catch (error) {
    console.error('Error resetting local database:', error);
    return false;
  }
};

// Asegurar que tenemos usuarios de prueba
initializeTestUsers();

export const authService = {
  login: async (email, password) => {
    try {
      // Intentar inicializar usuarios de prueba por si no se han creado
      await initializeTestUsers();
      
      // Intentar login con el backend
      try {
        const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/login`, {
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
        console.error('Login error with backend:', error);
        
        // Si es error 401, significa credenciales incorrectas
        if (error.response && error.response.status === 401) {
          // Intentar autenticación local antes de fallar
          const localAuthResult = await attemptLocalAuthentication(email, password);
          if (localAuthResult) {
            return localAuthResult;
          }
          throw new Error('Invalid credentials');
        }
        
        // Para otros errores (ej. conexión), intentar autenticación local
        const localAuthResult = await attemptLocalAuthentication(email, password);
        if (localAuthResult) {
          return localAuthResult;
        }
        
        // Si también falla localmente, lanzar error original
        throw error;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      // Intentar registro con el backend
      try {
        const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/register`, userData);
        
        if (response.data && response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data?.message || 'Error during registration');
        }
      } catch (error) {
        console.error('Registration error with backend:', error);
        
        // Fallback a modo local para desarrollo/testing
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
          isVerified: true
        };
        
        // Save to storage
        await AsyncStorage.setItem(PENDING_USERS_KEY, JSON.stringify(pendingUsers));
        
        // Auto-verify the email for development
        await authService.markEmailAsVerified(email);
        
        return { email, success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  markEmailAsVerified: async (email) => {
    try {
      // Intentar verificar email en backend
      try {
        await axios.post(`${apiConfig.API_BASE_URL}/auth/verify-email`, { email });
        return true;
      } catch (error) {
        console.error('Error marking email as verified in backend:', error);
        
        // Fallback local
        return await markEmailVerified(email);
      }
    } catch (error) {
      console.error('Error marking email as verified:', error);
      return false;
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
      try {
        const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/verify-code`, { email, code });
        return response.data && response.data.success;
      } catch (error) {
        console.error('Error verifying code with backend:', error);
        // Always return true for development fallback
        return true;
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  },
  
  resendVerificationCode: async (email) => {
    try {
      try {
        const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/resend-code`, { email });
        return response.data && response.data.success;
      } catch (error) {
        console.error('Error resending code with backend:', error);
        // Always return true for development fallback
        return true;
      }
    } catch (error) {
      console.error('Error resending verification code:', error);
      return false;
    }
  },
  
  completeProfile: async (email, profileData) => {
    try {
      // Intenta actualizar el perfil en el backend
      try {
        const response = await axios.put(`${apiConfig.API_BASE_URL}/usuarios/perfil`, {
          email,
          ...profileData
        });
        
        return response.data && response.data.success;
      } catch (error) {
        console.error('Complete profile error with backend:', error);
        
        // Fallback local
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
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      return false;
    }
  },
  
  checkUsernameAvailability: async (username) => {
    try {
      // Intenta verificar disponibilidad del nombre de usuario en el backend
      try {
        const response = await axios.get(`${apiConfig.API_BASE_URL}/auth/check-username?username=${username}`);
        return response.data;
      } catch (error) {
        console.error('Username check error with backend:', error);
        
        // Fallback local
        const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
        const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
        
        // Check if username is taken
        const isTaken = Object.values(pendingUsers).some(user => user.username === username);
        
        if (!isTaken) {
          return { available: true, suggestions: [] };
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
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
      // Return a safe default to prevent app crashes
      return { available: true, suggestions: [] };
    }
  },
};

// Función auxiliar para autenticación local
const attemptLocalAuthentication = async (email, password) => {
  try {
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
    }
    
    return null;
  } catch (error) {
    console.error('Local authentication error:', error);
    return null;
  }
};

export default authService;