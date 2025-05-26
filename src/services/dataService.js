import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Normaliza los campos de receta del backend al formato del frontend
function mapBackendRecipe(receta) {
  return {
    id: receta.idReceta,
    title: receta.nombreReceta,
    description: receta.descripcionReceta,
    imageUrl: receta.fotoPrincipal,
    servings: receta.porciones,
    people: receta.cantidadPersonas,
    date: receta.fecha,
    ingredients: receta.ingredientes || [],
    instructions: receta.instrucciones || [],
    user: receta.usuario ? {
      id: receta.usuario.idUsuario,
      name: receta.usuario.nombre,
      email: receta.usuario.mail,
      type: receta.usuario.tipo
    } : null,
    // Agrega aquí más campos si tu frontend los necesita
  };
}

// Mapea un curso del backend al formato del frontend
function mapBackendCourse(curso) {
  return {
    id: curso.idCurso,
    idCurso: curso.idCurso,
    title: curso.descripcion || 'Sin título',
    descripcion: curso.descripcion || 'Sin descripción',
    contenidos: curso.contenidos || 'No especificado',
    requerimientos: curso.requerimientos || 'No especificado',
    duracion: curso.duracion && curso.duracion > 0 ? curso.duracion : '-',
    precio: curso.precio !== null && curso.precio !== undefined ? curso.precio : '-',
    modalidad: curso.modalidad || 'No especificado',
    imageUrl: 'https://via.placeholder.com/300x200?text=Curso',
    availableSeats: curso.vacantesDisponibles || 0,
    startDate: curso.fechaInicio || '',
    endDate: curso.fechaFin || '',
    location: curso.sede ? curso.sede.nombreSede : '',
    instructor: 'Chef Profesional',
    status: 'active',
    nextSession: curso.fechaInicio || '',
    totalHours: curso.duracion && curso.duracion > 0 ? curso.duracion : '-',
    topics: curso.contenidos ? curso.contenidos.split(',') : [],
    sede: curso.sede || null
  };
}

// Mapea un usuario del backend al formato del frontend
function mapBackendUser(usuario) {
  return {
    id: usuario.idUsuario,
    email: usuario.mail,
    nickname: usuario.nickname,
    name: usuario.nombre,
    address: usuario.direccion,
    avatar: usuario.avatar,
    type: usuario.tipo,
    paymentMethod: usuario.medio_pago,
    enabled: usuario.habilitado,
    // Agrega aquí más campos si tu frontend los necesita
  };
}

// Mapea un alumno del backend al formato del frontend
function mapBackendAlumno(alumno) {
  return {
    id: alumno.idAlumno,
    cardNumber: alumno.numeroTarjeta,
    dniFront: alumno.dniFrente,
    dniBack: alumno.dniFondo,
    tramite: alumno.tramite,
    accountBalance: alumno.cuentaCorriente,
    idCronograma: alumno.idCronograma,
    // Agrega aquí más campos si tu frontend los necesita
  };
}

// Mapea una sede del backend al formato del frontend
function mapBackendSede(sede) {
  return {
    id: sede.idSede,
    name: sede.nombreSede,
    address: sede.direccionSede,
    phone: sede.telefonoSede,
    email: sede.mailSede,
    whatsapp: sede.whatsApp,
    discountType: sede.tipoBonificacion,
    discount: sede.bonificacionCursos,
    promoType: sede.tipoPromocion,
    promo: sede.promocionCursos,
    // Agrega aquí más campos si tu frontend los necesita
  };
}

// Mapea un cronograma del backend al formato del frontend
function mapBackendCronograma(cronograma) {
  return {
    id: cronograma.idCronograma,
    idSede: cronograma.idSede,
    idCurso: cronograma.idCurso,
    startDate: cronograma.fechaInicio,
    endDate: cronograma.fechaFin,
    availableSeats: cronograma.vacantesDisponibles,
    // Agrega aquí más campos si tu frontend los necesita
  };
}

class DataService {
  constructor() {
    this.useBackend = true;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Check if backend is available
  async checkBackendAvailability() {
    try {
      await api.utils.checkConnection();
      this.useBackend = true;
      return true;
    } catch (error) {
      console.log('Backend not available, using mock data:', error.message);
      this.useBackend = false;
      return false;
    }
  }

  // Generic method to try backend first, then fallback to mock
  async tryBackendFirst(backendCall, mockData, cacheKey = null) {
    try {
      // Try to get from cache first if cacheKey is provided
      if (cacheKey) {
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Try backend
      if (this.useBackend) {
        const result = await backendCall();
        
        // Cache the result if successful
        if (cacheKey && result.success) {
          await this.saveToCache(cacheKey, result.data);
        }
        
        return result.data;
      }
    } catch (error) {
      console.log('Backend call failed, using mock data:', error.message);
      this.useBackend = false;
    }

    // Fallback to mock data
    return mockData;
  }

  // Cache management
  async getFromCache(key) {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.cacheTimeout) {
          return data;
        }
      }
    } catch (error) {
      console.log('Cache read error:', error);
    }
    return null;
  }

  async saveToCache(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.log('Cache write error:', error);
    }
  }

  // Recipe methods
  async getAllRecipes() {
    try {
      // Usar el endpoint real del backend
      const response = await api.recipes.getAll(); // Este debe mapear a /getAllRecetas
      return response.data.map(mapBackendRecipe) || [];
    } catch (error) {
      console.log('Error al obtener recetas:', error.message);
      return [];
    }
  }

  async getLatestRecipes() {
    try {
      const result = await api.recipes.getLatest();
      return result.data.map(mapBackendRecipe) || [];
    } catch (error) {
      console.log('Error al obtener últimas recetas:', error.message);
      return [];
    }
  }

  async getRecipeById(id) {
    try {
      const result = await api.recipes.getById(id);
      return result.data ? mapBackendRecipe(result.data) : null;
    } catch (error) {
      console.log('Error al obtener receta por ID:', error.message);
      return null;
    }
  }

  async searchRecipesByName(nombrePlato, orden = 'alfabetico') {
    try {
      const result = await api.recipes.getByName(nombrePlato, orden);
      return result.data.map(mapBackendRecipe) || [];
    } catch (error) {
      console.log('Error al buscar recetas por nombre:', error.message);
      return [];
    }
  }

  async searchRecipesByIngredient(ingrediente, orden = 'alfabetico') {
    try {
      const result = await api.recipes.getByIngredient(ingrediente, orden);
      return result.data.map(mapBackendRecipe) || [];
    } catch (error) {
      console.log('Error al buscar recetas por ingrediente:', error.message);
      return [];
    }
  }

  async searchRecipesWithoutIngredient(ingrediente, orden = 'alfabetico') {
    try {
      const result = await api.recipes.getWithoutIngredient(ingrediente, orden);
      return result.data.map(mapBackendRecipe) || [];
    } catch (error) {
      console.log('Error al buscar recetas sin ingrediente:', error.message);
      return [];
    }
  }

  async createRecipe(recipeData) {
    try {
      if (this.useBackend) {
        return await api.recipes.create(recipeData);
      }
    } catch (error) {
      console.log('Failed to create recipe on backend:', error);
    }

    // Fallback: save locally
    const newRecipe = {
      ...recipeData,
      idReceta: Date.now().toString(),
      fecha: new Date().toISOString().split('T')[0],
      status: 'pending_upload'
    };

    const localRecipes = await AsyncStorage.getItem('local_recipes');
    const recipes = localRecipes ? JSON.parse(localRecipes) : [];
    recipes.push(newRecipe);
    await AsyncStorage.setItem('local_recipes', JSON.stringify(recipes));

    return newRecipe;
  }

  // Course methods
  async getAllCourses(idUsuario) {
    // Forzar idUsuario a 1 si no viene definido
    const safeId = idUsuario ? idUsuario : 1;
    try {
      const response = await api.courses.getAll(safeId);
      return response.data.map(mapBackendCourse) || [];
    } catch (error) {
      console.log('Error al obtener cursos:', error.message);
      return [];
    }
  }

  async getCourseById(id) {
    try {
      const result = await api.courses.getById(id);
      return result.data ? mapBackendCourse(result.data) : null;
    } catch (error) {
      console.log('Error al obtener curso por ID:', error.message);
      return null;
    }
  }

  async getUserCourses(idUsuario) {
    try {
      const result = await api.courses.getByStudent(idUsuario);
      return result.data.map(mapBackendCourse) || [];
    } catch (error) {
      console.log('Error al obtener cursos del usuario:', error.message);
      return [];
    }
  }

  async getAvailableCourses(idUsuario) {
    try {
      const result = await api.courses.getAvailable(idUsuario);
      return result.data.map(mapBackendCourse) || [];
    } catch (error) {
      console.log('Error al obtener cursos disponibles:', error.message);
      return [];
    }
  }

  async enrollInCourse(idAlumno, idCronograma) {
    try {
      const result = await api.courses.enroll(idAlumno, idCronograma);
      return result.data;
    } catch (error) {
      console.log('Error al inscribirse en el curso:', error.message);
      throw error;
    }
  }

  async cancelEnrollment(idInscripcion, reintegroEnTarjeta) {
    try {
      const result = await api.courses.cancelEnrollment(idInscripcion, reintegroEnTarjeta);
      return result.data;
    } catch (error) {
      console.log('Error al cancelar inscripción:', error.message);
      throw error;
    }
  }

  // Auth methods
  async login(mail, password) {
    try {
      if (this.useBackend) {
        const result = await api.auth.login(mail, password);
        if (result.success) {
          await AsyncStorage.setItem('user_data', JSON.stringify(result.data));
          return result.data;
        }
      }
    } catch (error) {
      console.log('Login failed:', error);
    }

    // Fallback: check local users or create visitor session
    const mockUser = {
      idUsuario: 999,
      mail,
      nickname: 'Visitante',
      nombre: 'Usuario Visitante',
      tipo: 'visitante',
      isOffline: true
    };

    await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
    return mockUser;
  }

  async register(userData) {
    try {
      if (this.useBackend) {
        return await api.auth.register(userData);
      }
    } catch (error) {
      console.log('Registration failed:', error);
    }

    // Fallback: save locally for later sync
    const pendingUsers = await AsyncStorage.getItem('pending_registrations');
    const users = pendingUsers ? JSON.parse(pendingUsers) : [];
    users.push({ ...userData, timestamp: Date.now() });
    await AsyncStorage.setItem('pending_registrations', JSON.stringify(users));

    return { success: true, message: 'Registro guardado localmente' };
  }

  // Sync methods for when connection is restored
  async syncPendingData() {
    if (!this.useBackend) return;

    try {
      // Sync pending recipes
      const localRecipes = await AsyncStorage.getItem('local_recipes');
      if (localRecipes) {
        const recipes = JSON.parse(localRecipes);
        for (const recipe of recipes) {
          if (recipe.status === 'pending_upload') {
            try {
              await api.recipes.create(recipe);
              recipe.status = 'synced';
            } catch (error) {
              console.log('Failed to sync recipe:', error);
            }
          }
        }
        await AsyncStorage.setItem('local_recipes', JSON.stringify(recipes));
      }

      // Sync pending enrollments
      const localEnrollments = await AsyncStorage.getItem('local_enrollments');
      if (localEnrollments) {
        const enrollments = JSON.parse(localEnrollments);
        for (const enrollment of enrollments) {
          if (enrollment.status === 'pending_sync') {
            try {
              await api.courses.enroll(enrollment.idAlumno, enrollment.idCronograma);
              enrollment.status = 'synced';
            } catch (error) {
              console.log('Failed to sync enrollment:', error);
            }
          }
        }
        await AsyncStorage.setItem('local_enrollments', JSON.stringify(enrollments));
      }

      // Sync pending registrations
      const pendingUsers = await AsyncStorage.getItem('pending_registrations');
      if (pendingUsers) {
        const users = JSON.parse(pendingUsers);
        const syncedUsers = [];
        for (const user of users) {
          try {
            await api.auth.register(user);
          } catch (error) {
            console.log('Failed to sync user registration:', error);
            syncedUsers.push(user); // Keep for retry
          }
        }
        await AsyncStorage.setItem('pending_registrations', JSON.stringify(syncedUsers));
      }

    } catch (error) {
      console.log('Sync error:', error);
    }
  }

  // Initialize service
  async initialize() {
    await this.checkBackendAvailability();
    if (this.useBackend) {
      await this.syncPendingData();
    }
  }

  async getUserById(id) {
    try {
      const result = await api.users.getProfile(id);
      return result.data ? mapBackendUser(result.data) : null;
    } catch (error) {
      console.log('Error al obtener usuario por ID:', error.message);
      return null;
    }
  }

  async getAllAlumnos() {
    try {
      const response = await api.get('/alumnos');
      return response.data;
    } catch (error) {
      console.error('Error fetching alumnos:', error);
      throw error;
    }
  }

  async getAlumnoById(id) {
    try {
      const result = await api.alumnos.getById(id);
      return result.data ? mapBackendAlumno(result.data) : null;
    } catch (error) {
      console.log('Error al obtener alumno por ID:', error.message);
      return null;
    }
  }

  async getAllSedes() {
    try {
      const response = await api.get('/sedes');
      return response.data;
    } catch (error) {
      console.error('Error fetching sedes:', error);
      throw error;
    }
  }

  async getSedeById(id) {
    try {
      const result = await api.sedes.getById(id);
      return result.data ? mapBackendSede(result.data) : null;
    } catch (error) {
      console.log('Error al obtener sede por ID:', error.message);
      return null;
    }
  }

  async getAllCronogramas(idUsuario) {
    try {
      const result = await api.cronogramas.getAll(idUsuario);
      return result.data.map(mapBackendCronograma) || [];
    } catch (error) {
      console.log('Error al obtener cronogramas:', error.message);
      return [];
    }
  }

  async getCronogramaById(id) {
    try {
      const result = await api.cronogramas.getById(id);
      return result.data ? mapBackendCronograma(result.data) : null;
    } catch (error) {
      console.log('Error al obtener cronograma por ID:', error.message);
      return null;
    }
  }

  async getAllIngredientes() {
    try {
      const response = await api.get('/ingredientes');
      return response.data;
    } catch (error) {
      console.error('Error fetching ingredientes:', error);
      throw error;
    }
  }

  async getAllCalificaciones() {
    try {
      const response = await api.get('/calificaciones');
      return response.data;
    } catch (error) {
      console.error('Error fetching calificaciones:', error);
      throw error;
    }
  }

  async getAllCronogramaCursos() {
    try {
      const response = await api.get('/cronograma-cursos');
      return response.data;
    } catch (error) {
      console.error('Error fetching cronograma cursos:', error);
      throw error;
    }
  }

  async getAllInscripciones() {
    try {
      const response = await api.get('/inscripciones');
      return response.data;
    } catch (error) {
      console.error('Error fetching inscripciones:', error);
      throw error;
    }
  }

  async getMiListaRecetas() {
    try {
      const response = await api.recipeList.get();
      return response.data || [];
    } catch (error) {
      console.error('Error fetching lista de recetas seleccionadas:', error);
      return [];
    }
  }

  async getSugerenciasRecetas(tipo = null) {
    try {
      const params = tipo ? { tipo } : {};
      const response = await api.recipes.getSuggestions(tipo);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching sugerencias de recetas:', error);
      return [];
    }
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService; 