import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api.config';
import { validarDatosRegistroUsuario } from '../utils/validaciones';

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
    console.error('Error al inicializar usuarios de prueba:', error);
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
    console.error('Error al marcar email como verificado:', error);
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
    console.error('Error al resetear la base de datos local:', error);
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
        // Siempre usar Axios para login para asegurar datos de formulario correctos
        const params = new URLSearchParams();
        params.append('mail', email);
        params.append('password', password);
        console.log('Cuerpo de solicitud de login:', params.toString()); // Registro de depuración
        const response = await axios.post(
          `${apiConfig.API_BASE_URL}/login`,
          params.toString(), // enviar como cadena de texto plana
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        console.log('Respuesta de login:', response.data); // Registro de depuración para ver token JWT
        if (response.data) {
          const responseData = response.data;
          // Manejar el nuevo formato de respuesta JWT
          let user, token;
          
          if (responseData.user && responseData.token) {
            // Nuevo formato JWT
            user = responseData.user;
            token = responseData.token;
          } else {
            // Formato antiguo alternativo
            user = responseData;
            token = null;
          }
          
          // Mapear datos de usuario del backend al formato esperado
          const mappedUser = {
            id: user.idUsuario || user.id,
            nombre: user.nombre || user.name,
            mail: user.mail || user.email,
            nickname: user.nickname || user.username,
            tipo: user.tipo || 'comun', // comun, visitante, alumno
            rol: user.rol, // Añadir campo rol del backend
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
      // Usar las utilidades de validación
      const validacion = validarDatosRegistroUsuario(userData);
      if (!validacion.valido) {
        throw new Error(validacion.errores[0]); // Mostrar el primer error
      }
      
      // Intentar registro con el backend usando el endpoint y carga correctos
      try {
        // Mapear campos del frontend a campos esperados por el backend
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
        
        // Manejar tipos específicos de errores HTTP
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
    } catch (error) {
      console.error('Error de registro:', error);
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
        console.error('Error al marcar email como verificado en el backend:', error);
        
        // Fallback local
        return await markEmailVerified(email);
      }
    } catch (error) {
      console.error('Error al marcar email como verificado:', error);
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
        // Siempre devolver true para desarrollo como fallback
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
        // Siempre devolver true para desarrollo como fallback
        return true;
      }
    } catch (error) {
      console.error('Error al reenviar código de verificación:', error);
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
        console.error('Error al completar perfil con el backend:', error);
        // Fallback local
        const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
        const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
        // Actualizar datos de perfil del usuario
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
      console.error('Error al completar perfil:', error);
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
        console.error('Error al verificar nombre de usuario con el backend:', error);
        
        // Fallback local
        const pendingUsersStr = await AsyncStorage.getItem(PENDING_USERS_KEY);
        const pendingUsers = pendingUsersStr ? JSON.parse(pendingUsersStr) : {};
        
        // Verificar si el nombre de usuario está en uso
        const isTaken = Object.values(pendingUsers).some(user => user.username === username);
        
        if (!isTaken) {
          return { available: true, suggestions: [] };
        }
        
        // Generar sugerencias si el nombre de usuario está en uso
        const suggestions = [];
        const baseUsername = username.replace(/\d+$/, ''); // Eliminar cualquier número al final
        
        // Añadir números aleatorios
        for (let i = 0; i < 3; i++) {
          const randomNum = Math.floor(Math.random() * 1000);
          suggestions.push(`${baseUsername}${randomNum}`);
        }
        
        // Añadir año actual
        const currentYear = new Date().getFullYear();
        suggestions.push(`${baseUsername}${currentYear}`);
        
        return {
          available: false,
          suggestions
        };
      }
    } catch (error) {
      console.error('Error al verificar disponibilidad de nombre de usuario:', error);
      // Devolver un valor predeterminado seguro para evitar fallos en la app
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
      // Crear objeto de usuario para la sesión
      const sessionUser = {
        id: userData.id,
        name: userData.name || email.split('@')[0],
        email: email,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
      };
      
      const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // Almacenar datos de usuario y token
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