import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import apiConfig from '../config/api.config';

// Configuración base 
const API_TIMEOUT = 10000; 

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

  // Obtener token de autenticación del almacenamiento
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem('user_token');
      return token;
    } catch (error) {
      console.log('Error al obtener token de autenticación:', error);
      return null;
    }
  }

  // Guardar token de autenticación en el almacenamiento
  async setAuthToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem('user_token', token);
      } else {
        await AsyncStorage.removeItem('user_token');
      }
    } catch (error) {
      console.log('Error al guardar token de autenticación:', error);
    }
  }
  
  // Verificar conectividad de red
  async isConnected() {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected;
    } catch (error) {
      return false;
    }
  }

  // Construir cabeceras con token de autenticación
  async buildHeaders(customHeaders = {}) {
    const token = await this.getAuthToken();
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Método de solicitud genérico
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.buildHeaders(options.headers);
    
    const config = {
      method: 'GET',
      headers,
      timeout: this.timeout,
      ...options,
    };

    // Agregar cuerpo para solicitudes POST/PUT
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
      // Verificar conectividad primero
      const connected = await this.isConnected();
      if (!connected) {
        throw new Error('Sin conexión a internet');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Manejar errores HTTP
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData = null;
        
        try {
          const responseText = await response.text();
          // Intentar analizar como JSON primero, si falla usar texto
          try {
            errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || responseText;
          } catch (parseError) {
            errorMessage = responseText || errorMessage;
          }
        } catch (textError) {
          // Usar mensaje de error predeterminado si no podemos leer la respuesta
        }
        
        // Crear error específico con información adicional
        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        
        // Si hay información estructurada del backend, preservarla
        if (errorData && typeof errorData === 'object') {
          error.response = { data: errorData };
          // Preservar campos específicos para sugerencias de alias
          if (errorData.aliasUnavailable) {
            error.aliasUnavailable = errorData.aliasUnavailable;
          }
          if (errorData.suggestions) {
            error.suggestions = errorData.suggestions;
          }
          if (errorData.success !== undefined) {
            error.success = errorData.success;
          }
        }
        
        throw error;
      }

      // Analizar respuesta según el tipo de contenido
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Manejar respuestas de texto (como mensajes de éxito)
          const textData = await response.text();
          // Intentar analizar como JSON si es posible, de lo contrario mantener como texto
          try {
            data = JSON.parse(textData);
          } catch (jsonError) {
            data = textData;
          }
        }
      } catch (parseError) {
        console.warn('Error al analizar respuesta:', parseError);
        // Respuesta vacía como alternativa
        data = '';
      }
      
      return { success: true, data };

    } catch (error) {
      console.log(`Error de API [${config.method} ${url}]:`, error.message);
      
      // Manejar tipos de errores específicos
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado');
      }
      
      if (error.message === 'Sin conexión a internet') {
        throw new Error('Sin conexión a internet');
      }
      
      throw error;
    }
  }

  // Solicitud GET
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  // Solicitud POST
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }


  async postForm(endpoint, data = {}) {
    const formData = new URLSearchParams();
    Object.keys(data).forEach(key => {
      // Manejar valores nulos e indefinidos
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

  // Solicitud PUT
  async put(endpoint, data = {}, options = {}) {
    const queryString = options.params ? new URLSearchParams(options.params).toString() : '';
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'PUT',
      body: data,
    });
  }

  // Solicitud PUT con datos de formulario (para Spring Boot @RequestParam)
  async putForm(endpoint, data = {}) {
    const formData = new URLSearchParams();
    Object.keys(data).forEach(key => {
      // Manejar valores nulos e indefinidos
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

  // Solicitud DELETE
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Cargar archivo (para imágenes de recetas)
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    
    // Agregar archivo
    formData.append('archivos', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || 'image.jpg',
    });

    // Agregar datos adicionales
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

  // Función de escalado
  async scale(idReceta, tipo, porciones) {
    console.log('API scale llamada con:', { idReceta, tipo, porciones });
    const endpoint = `/ajustarPorciones/${idReceta}`;
    console.log('Endpoint de escalado:', endpoint);
    return this.get(endpoint, { tipo, porciones });
  }

  // Método de aprobación
  async approve(idReceta, aprobar = true) {
    console.log('API approve llamada con:', { idReceta, aprobar });
    const params = { aprobar: aprobar.toString() };
    console.log('Parámetros de API approve:', params);
    return this.put(`/aprobarReceta/${idReceta}`, {}, { params });
  }

  // Método de upgrade a alumno
  async upgradeToStudent(idUsuario, studentData) {
    // Crear FormData para manejar archivos e información
    const formData = new FormData();
    
    // Agregar datos del formulario
    if (studentData.numeroTramiteDNI) {
      formData.append('tramite', studentData.numeroTramiteDNI);
    }
    if (studentData.numeroTarjeta) {
      formData.append('nroTarjeta', studentData.numeroTarjeta);
    }
    if (studentData.password) {
      formData.append('password', studentData.password);
    }
    
    // Agregar imágenes del DNI
    if (studentData.fotoDNIFrente && studentData.fotoDNIFrente.uri) {
      formData.append('dniFrente', {
        uri: studentData.fotoDNIFrente.uri,
        type: 'image/jpeg',
        name: 'dni_frente.jpg',
      });
    }
    
    if (studentData.fotoDNIDorso && studentData.fotoDNIDorso.uri) {
      formData.append('dniFondo', {
        uri: studentData.fotoDNIDorso.uri,
        type: 'image/jpeg',
        name: 'dni_dorso.jpg',
      });
    }
    
    return this.request(`/cambiarAAlumno/${idUsuario}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }
}

// Crear instancia singleton
const apiService = new ApiService();

export default apiService;


export const api = {

  auth: {
    login: (mail, password) => apiService.postForm('/login', { mail, password }),
    register: (userData) => apiService.post('/registrarUsuario', userData),
    // Verificación de username
    checkUsername: (username) => apiService.get('/auth/check-username', { username }),
    // Visitantes (sin código de verificación)
    registerVisitor: (mail, alias) => apiService.postForm('/registrarVisitante', { mail, alias }),
    // Visitantes (con código de verificación en 2 etapas)
    registerVisitorStage1: (mail, alias) => apiService.postForm('/registrarVisitanteEtapa1', { mail, alias }),
    verifyVisitorCode: (mail, codigo) => apiService.postForm('/verificarCodigoVisitante', { mail, codigo }),
    resendVisitorCode: (mail) => apiService.postForm('/reenviarCodigoVisitante', { mail }),
    getSugerenciasAlias: (baseAlias) => apiService.get('/sugerenciasAlias', { baseAlias }),
    // Usuarios (con código de verificación en 2 etapas)
    registerUserStage1: (mail, alias) => apiService.postForm('/registrarUsuarioEtapa1', { mail, alias }),
    verifyUserCode: (mail, codigo) => apiService.postForm('/verificarCodigoUsuario', { mail, codigo }),
    completeUserRegistration: (mail, nombre, password) => apiService.postForm('/completarRegistroUsuario', { mail, nombre, password }),
    resendUserCode: (mail) => apiService.postForm('/reenviarCodigoUsuario', { mail }),
    // Alumnos (igual que usuarios + datos adicionales)
    registerStudent: (mail, idUsuario, medioPago, dniFrente, dniFondo, tramite) => 
      apiService.postForm('/registrarAlumno', { mail, idUsuario, medioPago, dniFrente, dniFondo, tramite }),
    forgotPassword: (mail) => apiService.postForm('/recuperarClave', { mail }),
    resetPassword: (mail) => apiService.postForm('/recuperarContrasena', { mail }),
    upgradeToStudent: (idUsuario, studentData) => apiService.upgradeToStudent(idUsuario, studentData),
    createEmpresaUser: (userData) => apiService.post('/crearUsuarioEmpresa', userData),
    createAdminUser: (userData) => apiService.post('/crearUsuarioAdmin', userData),
  },

  // Endpoints de recetas 
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
    createAlternative: (recipeData) => apiService.post('/CargarNuevasRecetas', recipeData), // Endpoint alternativo
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

  // Endpoints de cursos 
  courses: {
    getAll: (idUsuario) => apiService.get('/getCursosDisponibles', { idUsuario }),
    getAvailable: (idUsuario) => apiService.get('/getCursosDisponibles', { idUsuario }),
    getByStudent: (idAlumno) => apiService.get(`/alumno/${idAlumno}`),
    create: (courseData) => apiService.post('/crearCurso', courseData),
    createSchedule: (scheduleData) => apiService.post('/crearCronograma', scheduleData),
    enroll: (idAlumno, idCronograma) => apiService.postForm('/inscribirseACurso', { idAlumno, idCronograma }),
    enrollAdvanced: (idAlumno, idCronograma) => apiService.postForm('/inscribirseACurso', { idAlumno, idCronograma }),
    unenroll: (idAlumno, idCronograma) => apiService.delete('/cancelarInscripcion', { idAlumno, idCronograma }),
    cancelEnrollment: (idInscripcion, reintegroEnTarjeta) => 
      apiService.postForm(`/baja/${idInscripcion}`, { reintegroEnTarjeta }),
  },


  // Endpoints de estudiantes
  students: {
    register: (mail, idUsuario, medioPago, dniFrente, dniFondo, tramite) => 
      apiService.postForm('/registrarAlumno', { mail, idUsuario, medioPago, dniFrente, dniFondo, tramite }),
    // todavia no esta implementado del todo. 
  },


  // Endpoints de calificaciones
  ratings: {
    add: (idReceta, calificacion) => apiService.post(`/valorarReceta/${idReceta}`, calificacion),
    authorize: (idCalificacion) => apiService.put(`/autorizarComentario/${idCalificacion}`),
    getByRecipe: (idReceta) => apiService.get(`/getValoracionReceta/${idReceta}`),
  },

  // Endpoints de usuarios
  users: {
    getByEmail: (mail) => apiService.get('/getUsuarioByEmail', { mail }),
    updateProfile: (userData) => apiService.put('/usuarios/perfil', userData),
  },

  // Endpoints de reseñas 
  reviews: {
    getByRecipe: (idReceta) => apiService.get(`/getValoracionReceta/${idReceta}`),
    create: (idReceta, reviewData, idUsuario) => {
      const endpoint = `/valorarReceta/${idReceta}`;
      
      console.log('Llamada a API de reseñas:', {
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

  // Endpoints de lista de recetas (Lista de recetas a intentar)
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

  // Endpoints de recetas guardadas
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

  // Endpoints de utilidad
  utils: {
    checkConnection: () => apiService.get('/'),
  },
};