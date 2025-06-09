import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import apiConfig from '../config/api.config';

// Base configuration - Updated to match the Spring Boot backend
const API_TIMEOUT = 10000; // 10 seconds

class ApiService {
  constructor() {
    this.timeout = API_TIMEOUT;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  get baseURL() {
    return apiConfig.API_BASE_URL;
  }

  // Get auth token from storage
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem('user_token');
      return token;
    } catch (error) {
      console.log('Error getting auth token:', error);
      return null;
    }
  }

  // Set auth token in storage
  async setAuthToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem('user_token', token);
      } else {
        await AsyncStorage.removeItem('user_token');
      }
    } catch (error) {
      console.log('Error setting auth token:', error);
    }
  }
  
  // Check network connectivity
  async isConnected() {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected;
    } catch (error) {
      return false;
    }
  }

  // Build headers with auth token
  async buildHeaders(customHeaders = {}) {
    const token = await this.getAuthToken();
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.buildHeaders(options.headers);
    
    const config = {
      method: 'GET',
      headers,
      timeout: this.timeout,
      ...options,
    };

    // Add body for POST/PUT requests
    if (
      config.body &&
      typeof config.body === 'object' &&
      config.headers &&
      config.headers['Content-Type'] &&
      config.headers['Content-Type'].includes('application/json')
    ) {
      config.body = JSON.stringify(config.body);
    }

    try {
      // Check connectivity first
      const connected = await this.isConnected();
      if (!connected) {
        throw new Error('No internet connection');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.text();
          // Try to parse as JSON first, fallback to text
          try {
            const jsonError = JSON.parse(errorData);
            errorMessage = jsonError.message || jsonError.error || errorData;
          } catch (parseError) {
            errorMessage = errorData || errorMessage;
          }
        } catch (textError) {
          // Use default error message if we can't read response
        }
        throw new Error(errorMessage);
      }

      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Handle text responses (like success messages)
          const textData = await response.text();
          // Try to parse as JSON if possible, otherwise keep as text
          try {
            data = JSON.parse(textData);
          } catch (jsonError) {
            data = textData;
          }
        }
      } catch (parseError) {
        console.warn('Error parsing response:', parseError);
        // Fallback to empty response
        data = '';
      }
      
      return { success: true, data };

    } catch (error) {
      console.log(`API Error [${config.method} ${url}]:`, error.message);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (error.message === 'No internet connection') {
        throw new Error('No internet connection');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // POST request with form data (for Spring Boot @RequestParam)
  async postForm(endpoint, data = {}) {
    const formData = new URLSearchParams();
    Object.keys(data).forEach(key => {
      // Handle null and undefined values
      const value = data[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
  }

  // PUT request
  async put(endpoint, data = {}, options = {}) {
    const queryString = options.params ? new URLSearchParams(options.params).toString() : '';
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'PUT',
      body: data,
    });
  }

  // PUT request with form data (for Spring Boot @RequestParam)
  async putForm(endpoint, data = {}) {
    const formData = new URLSearchParams();
    Object.keys(data).forEach(key => {
      // Handle null and undefined values
      const value = data[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file (for recipe images)
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    
    // Add file
    formData.append('archivos', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || 'image.jpg',
    });

    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const headers = await this.buildHeaders({
      'Content-Type': 'multipart/form-data',
    });

    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  // Scale function
  async scale(idReceta, tipo, porciones) {
    console.log('API scale called with:', { idReceta, tipo, porciones });
    const endpoint = `/ajustarPorciones/${idReceta}`;
    console.log('Scale endpoint:', endpoint);
    return this.get(endpoint, { tipo, porciones });
  }

  // Approve method
  async approve(idReceta, aprobar = true) {
    console.log('API approve called with:', { idReceta, aprobar });
    const params = { aprobar: aprobar.toString() };
    console.log('API approve params:', params);
    return this.put(`/aprobarReceta/${idReceta}`, {}, { params });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Convenience methods matching the Spring Boot backend endpoints
export const api = {
  // Auth endpoints (matching Spring Boot controller)
  auth: {
    login: (mail, password) => apiService.postForm('/login', { mail, password }),
    register: (userData) => apiService.post('/registrarUsuario', userData),
    registerVisitor: (mail, idUsuario) => apiService.postForm('/registrarVisitante', { mail, idUsuario }),
    registerStudent: (mail, idUsuario, medioPago, dniFrente, dniFondo, tramite) => 
      apiService.postForm('/registrarAlumno', { mail, idUsuario, medioPago, dniFrente, dniFondo, tramite }),
    forgotPassword: (mail) => apiService.postForm('/recuperarClave', { mail }),
    resetPassword: (mail) => apiService.postForm('/recuperarContrasena', { mail }),
    upgradeToStudent: (idUsuario, studentData) => apiService.put(`/cambiarAAlumno/${idUsuario}`, studentData),
    createEmpresaUser: (userData) => apiService.post('/crearUsuarioEmpresa', userData),
    createAdminUser: (userData) => apiService.post('/crearUsuarioAdmin', userData),
  },

  // Recipe endpoints (matching Spring Boot controller)
  recipes: {
    getAll: () => apiService.get('/getAllRecetas'),
    getLatest: () => apiService.get('/ultimasRecetas', { timestamp: new Date().getTime() }), // Las 3 últimas recetas
    getById: (id) => apiService.get(`/getRecetaById/${id}`),
    getByUser: (idUsuario) => apiService.get('/getRecetasUsuario', { idUsuario }),
    getByName: (nombrePlato, orden = 'alfabetico') => apiService.get('/getNombrereceta', { nombrePlato, orden }),
    getByType: (tipoPlato, orden = 'alfabetico') => apiService.get('/getTiporeceta', { tipoPlato, orden }),
    getByIngredient: (ingrediente, orden = 'alfabetico') => apiService.get('/getIngredienteReceta', { ingrediente, orden }),
    getWithoutIngredient: (ingrediente, orden = 'alfabetico') => apiService.get('/getSinIngredienteReceta', { ingrediente, orden }),
    getByUserProfile: (usuario, orden = 'alfabetico') => apiService.get('/getUsuarioReceta', { usuario, orden }),
    search: (nombre) => apiService.get('/buscarRecetas', { nombre }),
    create: (recipeData) => apiService.post('/crearRecetaConIngredientes', recipeData),
    createAlternative: (recipeData) => apiService.post('/CargarNuevasRecetas', recipeData), // Alternative endpoint
    createWithFiles: (receta, files) => apiService.uploadFile('/cargarReceta', files[0], receta),
    publish: (recipeData) => apiService.post('/publicarRecetas', recipeData),
    update: (idReceta, recipeData) => apiService.put(`/recetas/${idReceta}`, recipeData),
    delete: (idReceta, idUsuario) => {
      const endpoint = idUsuario ? 
        `/eliminarRecetaCompleta/${idReceta}?idUsuario=${idUsuario}` : 
        `/eliminarRecetaCompleta/${idReceta}`;
      return apiService.delete(endpoint);
    },
    scale: (idReceta, tipo, porciones) => apiService.scale(idReceta, tipo, porciones),
    scaleByIngredient: (idReceta, nombreIngrediente, nuevaCantidad) => 
      apiService.postForm(`/ajustarPorIngrediente/${idReceta}`, { nombreIngrediente, nuevaCantidad }),
    getSuggestions: (idTipo) => apiService.get('/sugerenciasRecetas', { idTipo }),
    approve: (idReceta, aprobar = true) => apiService.approve(idReceta, aprobar),
    approveRecipe: (idReceta, aprobar = true) => apiService.putForm(`/aprobarRecipe/${idReceta}`, { aprobar }),
    getPendingRecipes: () => apiService.get('/getRecetasPendientes'),
    getTypes: () => apiService.get('/getTiposReceta'),
  },

  // Course endpoints (matching Spring Boot controller)
  courses: {
    getAll: (idUsuario) => apiService.get('/getCursosDisponibles', { idUsuario }),
    getAvailable: (idUsuario) => apiService.get('/getCursosDisponibles', { idUsuario }),
    getByStudent: (idAlumno) => apiService.get(`/alumno/${idAlumno}`),
    create: (courseData) => apiService.post('/crearCurso', courseData),
    createSchedule: (scheduleData) => apiService.post('/crearCronograma', scheduleData),
    enroll: (idAlumno, idCronograma) => apiService.postForm('/inscripcionCurso', { idAlumno, idCronograma }),
    enrollAdvanced: (idAlumno, idCronograma) => apiService.postForm('/inscribirseACurso', { idAlumno, idCronograma }),
    unenroll: (idAlumno, idCronograma) => apiService.delete('/cancelarInscripcion', { idAlumno, idCronograma }),
    cancelEnrollment: (idInscripcion, reintegroEnTarjeta) => 
      apiService.postForm(`/baja/${idInscripcion}`, { reintegroEnTarjeta }),
    // Note: markAttendance endpoint not implemented in backend controller
  },

  // Note: Venue endpoints not implemented in backend controller

  // Student endpoints
  students: {
    register: (mail, idUsuario, medioPago, dniFrente, dniFondo, tramite) => 
      apiService.postForm('/registrarAlumno', { mail, idUsuario, medioPago, dniFrente, dniFondo, tramite }),
    // Note: getById and getAll endpoints not implemented in backend controller
  },

  // Note: Recipe type endpoints not implemented in backend controller

  // Rating endpoints
  ratings: {
    add: (idReceta, calificacion) => apiService.post(`/valorarReceta/${idReceta}`, calificacion),
    authorize: (idCalificacion) => apiService.put(`/autorizarComentario/${idCalificacion}`),
    getByRecipe: (idReceta) => apiService.get(`/getValoracionReceta/${idReceta}`),
  },

  // User endpoints
  users: {
    getByEmail: (mail) => apiService.get('/getUsuarioByEmail', { mail }),
    updateProfile: (userData) => apiService.put('/usuarios/perfil', userData),
  },

  // Reviews endpoints (matching Spring Boot controller)
  reviews: {
    getByRecipe: (idReceta) => apiService.get(`/getValoracionReceta/${idReceta}`),
    create: (idReceta, reviewData, idUsuario) => {
      const endpoint = `/valorarReceta/${idReceta}`;
      
      console.log('Reviews API call:', {
        endpoint,
        idUsuario,
        reviewData
      });
      
      if (idUsuario) {
        // Si tenemos ID de usuario, agregarlo como parámetro de consulta
        return apiService.request(`${endpoint}?idUsuario=${idUsuario}`, {
          method: 'POST',
          body: reviewData
        });
      } else {
        // Sin ID de usuario, envío normal
        return apiService.post(endpoint, reviewData);
      }
    },
    authorize: (idCalificacion) => apiService.put(`/autorizarComentario/${idCalificacion}`),
  },

  // Recipe list endpoints (Lista de recetas a intentar)
  recipeList: {
    add: (idUsuario, receta) => apiService.post(`/lista/${idUsuario}`, receta),
    addById: (idReceta) => apiService.post(`/agregarReceta/${idReceta}`),
    addByIdWithUser: (idReceta, idUsuario) => {
      const endpoint = idUsuario ? 
        `/agregarReceta/${idReceta}?idUsuario=${idUsuario}` : 
        `/agregarReceta/${idReceta}`;
      return apiService.post(endpoint);
    },
    remove: (idReceta) => apiService.delete(`/eliminarReceta/${idReceta}`),
    removeWithUser: (idReceta, idUsuario) => {
      const endpoint = idUsuario ? 
        `/eliminarReceta/${idReceta}?idUsuario=${idUsuario}` : 
        `/eliminarReceta/${idReceta}`;
      return apiService.delete(endpoint);
    },
    get: () => apiService.get('/getMiListaRecetas'),
    getWithUser: (idUsuario) => {
      const endpoint = idUsuario ? 
        `/getMiListaRecetas?idUsuario=${idUsuario}` : 
        `/getMiListaRecetas`;
      return apiService.get(endpoint);
    },
    markAsCompleted: (idReceta, completada, idUsuario) => {
      const endpoint = idUsuario ? 
        `/marcarRecetaCompletada/${idReceta}?completada=${completada}&idUsuario=${idUsuario}` : 
        `/marcarRecetaCompletada/${idReceta}?completada=${completada}`;
      return apiService.put(endpoint);
    },
  },

  // Saved recipes endpoints (Recetas guardadas)
  savedRecipes: {
    save: (idReceta) => {
      console.log(`[API] Guardando receta ${idReceta}`);
      return apiService.post(`/guardarReceta/${idReceta}`);
    },
    saveWithUser: (idReceta, idUsuario) => {
      const endpoint = idUsuario ? 
        `/guardarReceta/${idReceta}?idUsuario=${idUsuario}` : 
        `/guardarReceta/${idReceta}`;
      console.log(`[API] Guardando receta ${idReceta} con usuario ${idUsuario}, endpoint: ${endpoint}`);
      return apiService.post(endpoint);
    },
    get: () => {
      console.log('[API] Obteniendo recetas guardadas');
      return apiService.get('/recetasGuardadas');
    },
    getWithUser: (idUsuario) => {
      const endpoint = idUsuario ? 
        `/recetasGuardadas?idUsuario=${idUsuario}` : 
        `/recetasGuardadas`;
      console.log(`[API] Obteniendo recetas guardadas para usuario ${idUsuario}, endpoint: ${endpoint}`);
      return apiService.get(endpoint);
    },
    remove: (idReceta) => {
      console.log(`[API] Eliminando receta guardada ${idReceta}`);
      return apiService.delete(`/eliminarRecetaGuardada/${idReceta}`);
    },
    removeWithUser: (idReceta, idUsuario) => {
      const endpoint = idUsuario ? 
        `/eliminarRecetaGuardada/${idReceta}?idUsuario=${idUsuario}` : 
        `/eliminarRecetaGuardada/${idReceta}`;
      console.log(`[API] Eliminando receta guardada ${idReceta} con usuario ${idUsuario}, endpoint: ${endpoint}`);
      return apiService.delete(endpoint);
    },
  },

  // Utility endpoints
  utils: {
    checkConnection: () => apiService.get('/'),
  },
};