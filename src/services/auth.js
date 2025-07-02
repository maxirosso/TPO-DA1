import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api.config';
import { validarDatosRegistroUsuario } from '../utils/validaciones';

const USER_STORAGE_KEY = 'user_data';
const TOKEN_STORAGE_KEY = 'user_token';
const PENDING_USERS_KEY = 'pending_users';

export const initializeTestUsers = async () => {
  try {
    const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
    let pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
    
    if (!pendingUsers['test@example.com']) {
      pendingUsers['test@example.com'] = {
        id: 'test-user-1',
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
        name: 'Usuario de Prueba',
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      
      await AsyncStorage.setItem(PENDING_USERS_KEY, JSON.stringify(pendingUsers));
      
      await markEmailVerified('test@example.com');
    }
    
    return pendingUsers;
  } catch (error) {
    console.error('Error al inicializar usuarios de prueba:', error);
    return {};
  }
};

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
    console.error('Error al marcar email como verificado:', error);
    return false;
  }
};

export const resetLocalDatabase = async () => {
  try {
    await AsyncStorage.removeItem(PENDING_USERS_KEY);
    await AsyncStorage.removeItem('verified_emails');
    await initializeTestUsers();
    return true;
  } catch (error) {
    console.error('Error al resetear la base de datos local:', error);
    return false;
  }
};

initializeTestUsers();

export const authService = {
  login: async (email, password) => {
    try {
      await initializeTestUsers();
      try {
        const params = new URLSearchParams();
        params.append('mail', email);
        params.append('password', password);
        console.log('Cuerpo de solicitud de login:', params.toString()); 
        const response = await axios.post(
          `${apiConfig.API_BASE_URL}/login`,
          params.toString(), 
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        console.log('Respuesta de login:', response.data); 
        if (response.data) {
          const responseData = response.data;
          let user, token;
          
          if (responseData.user && responseData.token) {
            user = responseData.user;
            token = responseData.token;
          } else {
            user = responseData;
            token = null;
          }
          
          const mappedUser = {
            id: user.idUsuario || user.id,
            nombre: user.nombre || user.name,
            mail: user.mail || user.email,
            nickname: user.nickname || user.username,
            tipo: user.tipo || 'comun', // comun, visitante, alumno
            rol: user.rol, 
            ...user
          };
          
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mappedUser));
          if (token) {
            await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
          }
          
          return { user: mappedUser, token: token };
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      } catch (error) {
        console.error('Error de login con el backend:', error);
        if (error.response && error.response.status === 401) {
          const localAuthResult = await attemptLocalAuthentication(email, password);
          if (localAuthResult) {
            return localAuthResult;
          }
          throw new Error('Credenciales inválidas');
        }
        const localAuthResult = await attemptLocalAuthentication(email, password);
        if (localAuthResult) {
          return localAuthResult;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error de login:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const validacion = validarDatosRegistroUsuario(userData);
      if (!validacion.valido) {
        throw new Error(validacion.errores[0]); 
      }
      
      
      const isRegularUserOrStudent = userData.userType === 'regular' || userData.userType === 'student';
      
      if (isRegularUserOrStudent) {
        
        console.log('Usando registro por etapas para:', userData.userType);
        
        try {
          const params = new URLSearchParams();
          params.append('mail', userData.email.trim());
          params.append('alias', userData.username.trim());
          
          console.log('Enviando datos al backend (etapa 1):', params.toString());
          
          const response = await axios.post(
            `${apiConfig.API_BASE_URL}/registrarUsuarioEtapa1`,
            params.toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          );
          
          console.log('Respuesta del backend (etapa 1):', response.data);
          
          if (response.data && response.data.success) {
            return { success: true, message: response.data.message };
          } else {
            throw new Error(response.data?.error || 'Error durante el registro');
          }
          
        } catch (error) {
          console.error('Error de registro por etapas con el backend:', error);
          
          if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 400 && data && data.error) {
              throw new Error(data.error);
            } else if (status === 400) {
              throw new Error(data || 'Datos incorrectos');
            } else if (status === 500) {
              throw new Error('Error interno del servidor. Intenta nuevamente más tarde.');
            } else {
              throw new Error(`Error del servidor (${status}): ${data || 'Error desconocido'}`);
            }
          } else if (error.request) {
            throw new Error('Sin conexión al servidor. Verifica tu conexión a internet.');
          } else {
            throw new Error(error.message || 'Error de red');
          }
        }
      } else {
        
        console.log('Usando registro normal para otros tipos de usuario');
        
        try {
          const backendPayload = {
            mail: userData.email.trim(),
            password: userData.password,
            nombre: userData.name || userData.username.trim(),
            nickname: userData.username.trim(),
            habilitado: 'No', // Por defecto no habilitado hasta verificar email
            direccion: userData.direccion || '',
            avatar: userData.avatar || '',
            tipo: 'comun', // Tipo por defecto
            medio_pago: userData.medioPago || '',
            rol: 'user' // Rol por defecto
          };
          
          console.log('Enviando datos de registro al backend:', backendPayload);
          
          const response = await axios.post(`${apiConfig.API_BASE_URL}/registrarUsuario`, backendPayload);
          
          console.log('Respuesta del backend:', response);
          
          if (response.data && typeof response.data === 'string') {
            if (response.data.includes('exitosamente')) {
              return { success: true };
            } else if (response.data.includes('Ya existe')) {
              throw new Error('Email ya registrado');
            } else if (response.data.includes('nickname')) {
              throw new Error('El nombre de usuario (nickname) es obligatorio.');
            } else {
              throw new Error(response.data);
            }
          } else {
            throw new Error(response.data?.message || 'Error durante el registro');
          }
          
        } catch (error) {
          console.error('Error de registro con el backend:', error);
          
          if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 400) {
              if (typeof data === 'string') {
                if (data.includes('Ya existe')) {
                  throw new Error('Email ya registrado');
                } else if (data.includes('nickname')) {
                  throw new Error('El nombre de usuario (nickname) es obligatorio.');
                } else {
                  throw new Error(data || 'Datos incorrectos');
                }
              } else {
                throw new Error('Datos incorrectos. Verifica que todos los campos estén completos.');
              }
            } else if (status === 403) {
              throw new Error('No tienes permisos para realizar esta acción.');
            } else if (status === 409) {
              throw new Error('El usuario ya existe en el sistema.');
            } else if (status === 500) {
              throw new Error('Error interno del servidor. Intenta nuevamente más tarde.');
            } else {
              throw new Error(`Error del servidor (${status}): ${data || 'Error desconocido'}`);
            }
          } else if (error.request) {
            throw new Error('Sin conexión al servidor. Verifica tu conexión a internet.');
          } else {
            throw new Error(error.message || 'Error de red');
          }
        }
      }
    } catch (error) {
      console.error('Error de registro:', error);
      throw error;
    }
  },
  
  markEmailAsVerified: async (email) => {
    try {
      try {
        await axios.post(`${apiConfig.API_BASE_URL}/auth/verify-email`, { email });
        return true;
      } catch (error) {
        console.error('Error al marcar email como verificado en el backend:', error);
        
        return await markEmailVerified(email);
      }
    } catch (error) {
      console.error('Error al marcar email como verificado:', error);
      return false;
    }
  },
  
  logout: async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error de cierre de sesión:', error);
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
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },
  
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      return !!token;
    } catch (error) {
      console.error('Error en verificación de autenticación:', error);
      return false;
    }
  },

  verifyCode: async (email, code) => {
    try {
      try {
        const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/verify-code`, { email, code });
        return response.data && response.data.success;
      } catch (error) {
        console.error('Error al verificar código con el backend:', error);
        return true;
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
      return false;
    }
  },
  
  resendVerificationCode: async (email) => {
    try {
      try {
        const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/resend-code`, { email });
        return response.data && response.data.success;
      } catch (error) {
        console.error('Error al reenviar código con el backend:', error);
        return true;
      }
    } catch (error) {
      console.error('Error al reenviar código de verificación:', error);
      return false;
    }
  },
  
  completeProfile: async (email, profileData) => {
    try {
      console.log('Completando perfil:', { email, profileData });
      
      
      if (profileData.password) {
        try {
          const params = new URLSearchParams();
          params.append('mail', email);
          params.append('nombre', profileData.name || email.split('@')[0]);
          params.append('password', profileData.password);
          
          console.log('Enviando datos al backend:', params.toString());
          
          const response = await axios.post(
            `${apiConfig.API_BASE_URL}/completarRegistroUsuario`,
            params.toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          );
          
          console.log('Respuesta del backend:', response.data);
          
          if (response.data && typeof response.data === 'string') {
            if (response.data.includes('exitosamente')) {
              return true;
            } else {
              throw new Error(response.data);
            }
          }
          
          return false;
        } catch (error) {
          console.error('Error al completar registro con el backend:', error);
          
          if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 400) {
              throw new Error(data || 'Datos incorrectos');
            } else if (status === 500) {
              throw new Error('Error interno del servidor. Intenta nuevamente más tarde.');
            } else {
              throw new Error(`Error del servidor (${status}): ${data || 'Error desconocido'}`);
            }
          } else if (error.request) {
            throw new Error('Sin conexión al servidor. Verifica tu conexión a internet.');
          } else {
            throw new Error(error.message || 'Error de red');
          }
        }
      } else {
        
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
          console.error('Error al completar perfil con el backend:', error);
          
          // Fallback local
          const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
          const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
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
      }
    } catch (error) {
      console.error('Error al completar perfil:', error);
      throw error;
    }
  },
  
  checkUsernameAvailability: async (username) => {
    try {
      try {
        const response = await axios.get(`${apiConfig.API_BASE_URL}/auth/check-username?username=${username}`);
        return response.data;
      } catch (error) {
        console.error('Error al verificar nombre de usuario con el backend:', error);
        
        const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
        const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
        
        const isTaken = Object.values(pendingUsers).some(user => user.username === username);
        
        if (!isTaken) {
          return { available: true, suggestions: [] };
        }
        
        const suggestions = [];
        const baseUsername = username.replace(/\d+$/, ''); 
        
        for (let i = 0; i < 3; i++) {
          const randomNum = Math.floor(Math.random() * 1000);
          suggestions.push(`${baseUsername}${randomNum}`);
        }
        
        const currentYear = new Date().getFullYear();
        suggestions.push(`${baseUsername}${currentYear}`);
        
        return {
          available: false,
          suggestions
        };
      }
    } catch (error) {
      console.error('Error al verificar disponibilidad de nombre de usuario:', error);
      return { available: true, suggestions: [] };
    }
  },
};

const attemptLocalAuthentication = async (email, password) => {
  try {
    const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
    const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
    
    const userData = pendingUsers[email];
    
    if (userData && userData.password === password) {
      const sessionUser = {
        id: userData.id,
        name: userData.name || email.split('@')[0],
        email: email,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
      };
      
      const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      return { user: sessionUser, token };
    }
    
    return null;
  } catch (error) {
    console.error('Error de autenticación local:', error);
    return null;
  }
};

export default authService;