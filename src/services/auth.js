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
      await initializeTestUsers();
      try {
        // Always use Axios for login to ensure correct form data
        const params = new URLSearchParams();
        params.append('mail', email);
        params.append('password', password);
        console.log('Login request body:', params.toString()); // Debug log
        const response = await axios.post(
          `${apiConfig.API_BASE_URL}/login`,
          params.toString(), // send as plain string
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        if (response.data) {
          const user = response.data;
          // Map backend user data to expected format
          const mappedUser = {
            id: user.idUsuario || user.id,
            nombre: user.nombre || user.name,
            mail: user.mail || user.email,
            nickname: user.nickname || user.username,
            tipo: user.tipo || 'comun', // comun, visitante, alumno
            ...user
          };
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mappedUser));
          return { user: mappedUser, token: null };
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Login error with backend:', error);
        if (error.response && error.response.status === 401) {
          const localAuthResult = await attemptLocalAuthentication(email, password);
          if (localAuthResult) {
            return localAuthResult;
          }
          throw new Error('Invalid credentials');
        }
        const localAuthResult = await attemptLocalAuthentication(email, password);
        if (localAuthResult) {
          return localAuthResult;
        }
        throw error;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      // Validate username (nickname) is present and non-empty
      if (!userData.username || typeof userData.username !== 'string' || userData.username.trim() === '') {
        throw new Error('El nombre de usuario (nickname) es obligatorio.');
      }
      // Attempt registration with the backend using the correct endpoint and payload
      try {
        // Map frontend fields to backend expected fields
        const backendPayload = {
          mail: userData.email,
          password: userData.password,
          nombre: userData.name || userData.username.trim(),
          nickname: userData.username.trim(),
        };
        const response = await axios.post(`${apiConfig.API_BASE_URL}/registrarUsuario`, backendPayload);
        if (response.data && typeof response.data === 'string' && response.data.includes('exitosamente')) {
          return { success: true };
        } else if (response.data && typeof response.data === 'string' && response.data.includes('Ya existe')) {
          throw new Error('Email already registered');
        } else if (response.data && typeof response.data === 'string' && response.data.includes('nickname')) {
          throw new Error('El nombre de usuario (nickname) es obligatorio.');
        } else {
          throw new Error(response.data?.message || 'Error during registration');
        }
      } catch (error) {
        console.error('Registration error with backend:', error);
        // Fallback a modo local para desarrollo/testing
        const { email, password, username, name } = userData;
        if (!username || typeof username !== 'string' || username.trim() === '') {
          throw new Error('El nombre de usuario (nickname) es obligatorio.');
        }
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
          username: username.trim(),
          name: name || username.trim(),
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
          email: email,
          nombre: profileData.name,
          ...('direccion' in profileData ? { direccion: profileData.direccion } : {}),
          ...('avatar' in profileData ? { avatar: profileData.avatar } : {}),
          ...('medioPago' in profileData ? { medioPago: profileData.medioPago } : {})
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