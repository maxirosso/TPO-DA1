import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Normaliza los campos de receta del backend al formato del frontend
export function mapBackendRecipe(receta) {
  return {
    id: receta.idReceta,
    idReceta: receta.idReceta,
    title: receta.nombreReceta,
    nombreReceta: receta.nombreReceta,
    description: receta.descripcionReceta,
    descripcionReceta: receta.descripcionReceta,
    imageUrl: receta.fotoPrincipal || null,
    fotoPrincipal: receta.fotoPrincipal,
    servings: receta.porciones,
    porciones: receta.porciones,
    people: receta.cantidadPersonas,
    cantidadPersonas: receta.cantidadPersonas,
    date: receta.fecha,
    fecha: receta.fecha,
    time: 30, // Default cooking time
    ingredients: Array.isArray(receta.ingredientes) ? receta.ingredientes.map(ing => ({
      name: ing.nombre || ing.name,
      amount: ing.cantidad && ing.unidadMedida ? `${ing.cantidad} ${ing.unidadMedida}`.trim() : (ing.amount || '1 unidad'),
      preparation: ''
    })) : [],
    ingredientes: receta.ingredientes || [],
    instructions: Array.isArray(receta.instrucciones) ? receta.instrucciones : 
                  typeof receta.instrucciones === 'string' ? 
                  receta.instrucciones.split('\n').map((step, index) => ({
                    step: index + 1,
                    text: step.trim()
                  })) : [],
    instrucciones: receta.instrucciones || [],
    pasos: receta.pasos || [],
    user: receta.usuario ? {
      id: receta.usuario.idUsuario,
      idUsuario: receta.usuario.idUsuario,
      name: receta.usuario.nombre,
      nombre: receta.usuario.nombre,
      email: receta.usuario.mail,
      mail: receta.usuario.mail,
      nickname: receta.usuario.nickname,
      type: receta.usuario.tipo,
      tipo: receta.usuario.tipo
    } : null,
    usuario: receta.usuario,
    author: receta.usuario ? receta.usuario.nombre : 'Desconocido',
    category: receta.tipoReceta ? receta.tipoReceta.descripcion : 
              receta.tipo ? receta.tipo.descripcion : 'Sin categoría',
    tipoReceta: receta.tipoReceta || receta.tipo,
    tags: receta.tipoReceta ? [receta.tipoReceta.descripcion] : [],
    rating: receta.calificacionPromedio || 0, // Mapear calificacionPromedio del backend
    calificacionPromedio: receta.calificacionPromedio || 0,
    reviews: receta.totalCalificaciones || 0,
    totalCalificaciones: receta.totalCalificaciones || 0,
    autorizada: receta.autorizada,
    // Recipe list completion status fields
    completed: receta.completada || false,
    completada: receta.completada || false,
    completedDate: receta.fechaCompletada,
    fechaCompletada: receta.fechaCompletada,
    addedDate: receta.fechaAgregada,
    fechaAgregada: receta.fechaAgregada
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
      console.log('📲 Solicitando todas las recetas al backend...');
      // Usar el endpoint real del backend
      const response = await api.recipes.getAll(); // Este debe mapear a /getAllRecetas
      console.log(`📊 Total de recetas recibidas: ${response.data?.length || 0}`);
      
      // Mapear y filtrar solo recetas autorizadas
      const recipes = response.data.map(mapBackendRecipe);
      const authorizedRecipes = recipes.filter(recipe => recipe.autorizada === true);
      
      console.log(`🔍 Recetas autorizadas filtradas: ${authorizedRecipes.length} de ${recipes.length}`);
      
      return authorizedRecipes;
    } catch (error) {
      console.log('❌ Error al obtener recetas:', error.message);
      return [];
    }
  }

  async getLatestRecipes() {
    try {
      console.log('📲 Solicitando últimas recetas al backend (ordenadas por ID descendente)...');
      const result = await api.recipes.getLatest();
      console.log(`📊 Recetas recibidas del backend: ${result.data?.length || 0}`);
      
      // Mapear las recetas del backend al formato frontend
      const recipes = result.data.map(mapBackendRecipe);
      
      // Mostrar información detallada de cada receta
      if (recipes.length > 0) {
        console.log('📝 Detalle de las recetas recibidas:');
        recipes.forEach(recipe => {
          console.log(`🍽️ Receta: ${recipe.title || recipe.nombreReceta}`);
          console.log(`   ID: ${recipe.id || recipe.idReceta}`);
          console.log(`   Autorizada: ${recipe.autorizada === true ? 'Sí' : 'No'}`);
          console.log(`   Fecha: ${recipe.date || recipe.fecha || 'No especificada'}`);
          console.log(`   Categoría: ${recipe.category || 'Sin categoría'}`);
          console.log(`   Autor: ${recipe.author || 'Desconocido'}`);
        });
      } else {
        console.log('⚠️ No se recibieron recetas del backend');
      }
      
      return recipes;
    } catch (error) {
      console.log('❌ Error al obtener últimas recetas:', error.message);
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
      // Map frontend orden to backend format
      let backendOrden;
      if (orden === 'newest') {
        backendOrden = 'nueva';
      } else if (orden === 'user') {
        backendOrden = 'usuario';
      } else {
        backendOrden = 'alfabetico';
      }
      console.log(`Searching recipes by name "${nombrePlato}" with order "${backendOrden}"`);
      const result = await api.recipes.getByName(nombrePlato, backendOrden);
      
      if (result && result.data) {
        const mappedRecipes = result.data.map(mapBackendRecipe) || [];
        console.log(`Found ${mappedRecipes.length} recipes with name containing "${nombrePlato}" in order:`, 
          mappedRecipes.map(r => r.title));
        return mappedRecipes;
      }
      
      console.log(`No recipes found with name containing "${nombrePlato}"`);
      return [];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`No recipes found with name containing "${nombrePlato}"`);
        return [];
      }
      console.log('Error al buscar recetas por nombre:', error.message);
      return [];
    }
  }

  async searchRecipesByIngredient(ingrediente, orden = 'alfabetico') {
    try {
      // Map frontend orden to backend format
      let backendOrden;
      if (orden === 'newest') {
        backendOrden = 'nueva';
      } else if (orden === 'user') {
        backendOrden = 'usuario';
      } else {
        backendOrden = 'alfabetico';
      }
      const result = await api.recipes.getByIngredient(ingrediente, backendOrden);
      return result.data.map(mapBackendRecipe) || [];
    } catch (error) {
      console.log('Error al buscar recetas por ingrediente:', error.message);
      return [];
    }
  }

  async searchRecipesWithoutIngredient(ingrediente, orden = 'alfabetico') {
    try {
      // Map frontend orden to backend format
      let backendOrden;
      if (orden === 'newest') {
        backendOrden = 'nueva';
      } else if (orden === 'user') {
        backendOrden = 'usuario';
      } else {
        backendOrden = 'alfabetico';
      }
      const result = await api.recipes.getWithoutIngredient(ingrediente, backendOrden);
      return result.data.map(mapBackendRecipe) || [];
    } catch (error) {
      console.log('Error al buscar recetas sin ingrediente:', error.message);
      return [];
    }
  }

  async searchRecipesByUser(usuario, orden = 'alfabetico') {
    try {
      // Map frontend orden to backend format  
      let backendOrden;
      if (orden === 'newest') {
        backendOrden = 'nueva';
      } else if (orden === 'user') {
        backendOrden = 'usuario';
      } else {
        backendOrden = 'alfabetico';
      }
      console.log(`Searching recipes by user "${usuario}" with order "${backendOrden}"`);
      const result = await api.recipes.getByUserProfile(usuario, backendOrden);
      const mappedRecipes = result.data.map(mapBackendRecipe) || [];
      console.log(`Found ${mappedRecipes.length} recipes by user "${usuario}"`);
      return mappedRecipes;
    } catch (error) {
      console.log('Error al buscar recetas por usuario:', error.message);
      // Fallback to local search
      const allRecipes = await this.getAllRecipes();
      return allRecipes.filter(recipe =>
        recipe.author && recipe.author.toLowerCase().includes(usuario.toLowerCase())
      );
    }
  }

  async getUserRecipes(idUsuario) {
    try {
      console.log(`Getting all recipes for user ID: ${idUsuario}`);
      const result = await api.recipes.getByUser(idUsuario);
      const mappedRecipes = result.data.map(mapBackendRecipe) || [];
      console.log(`Found ${mappedRecipes.length} recipes for user ${idUsuario} (including pending)`);
      return mappedRecipes;
    } catch (error) {
      console.log('Error al obtener recetas del usuario:', error.message);
      throw error;
    }
  }

  async deleteUserRecipe(idReceta, idUsuario) {
    try {
      console.log(`Deleting recipe ${idReceta} for user ${idUsuario}`);
      const result = await api.recipes.delete(idReceta, idUsuario);
      console.log('Recipe deleted successfully:', result);
      return { success: true, message: result.data || 'Receta eliminada correctamente' };
    } catch (error) {
      console.log('Error al eliminar receta:', error.message);
      return { success: false, message: error.message || 'No se pudo eliminar la receta' };
    }
  }

  async createRecipe(recipeData) {
    try {
      console.log('Creating recipe with data:', recipeData);
      
      if (this.useBackend) {
        // Formatear datos para el nuevo endpoint
        const formattedData = {
          nombreReceta: recipeData.title || recipeData.nombreReceta,
          descripcionReceta: recipeData.description || recipeData.descripcionReceta,
          fotoPrincipal: recipeData.imageUrl || recipeData.fotoPrincipal,
          porciones: parseInt(recipeData.servings || recipeData.porciones || 1),
          cantidadPersonas: parseInt(recipeData.servings || recipeData.cantidadPersonas || 1),
          instrucciones: Array.isArray(recipeData.instructions) 
            ? recipeData.instructions.map(i => i.text || i).join('\n')
            : (recipeData.instructions || recipeData.instrucciones || ''),
          usuario: {
            idUsuario: recipeData.user?.id || recipeData.usuario?.idUsuario || recipeData.idUsuario
          },
          idTipo: recipeData.tipoReceta || recipeData.idTipo || { idTipo: 1 },
          ingredientes: (recipeData.ingredients || recipeData.ingredientes || []).map(ing => {
            // Normalizar ingrediente
            if (typeof ing === 'string') {
              return {
                nombre: ing,
                cantidad: 1,
                unidadMedida: 'unidad'
              };
            }
            
            // Extraer cantidad y unidad desde amount si existe
            let cantidad = 1;
            let unidadMedida = 'unidad';
            
            if (ing.amount) {
              const match = ing.amount.match(/^(\d*\.?\d+)\s*(.*)$/);
              if (match) {
                cantidad = parseFloat(match[1]) || 1;
                unidadMedida = match[2].trim() || 'unidad';
              }
            } else if (ing.cantidad) {
              cantidad = parseFloat(ing.cantidad) || 1;
              unidadMedida = ing.unidadMedida || 'unidad';
            }
            
            return {
              nombre: ing.name || ing.nombre,
              cantidad: cantidad,
              unidadMedida: unidadMedida
            };
          })
        };
        
        console.log('Formatted recipe data:', formattedData);
        
        // Intentar con el nuevo endpoint primero
        try {
          const response = await api.recipes.create(formattedData);
          console.log('Recipe created successfully:', response);
          return response;
        } catch (primaryError) {
          console.log('Primary create endpoint failed:', primaryError);
          // Intentar con el endpoint alternativo
          const altResponse = await api.recipes.createAlternative(formattedData);
          console.log('Recipe created with alternative endpoint:', altResponse);
          return altResponse;
        }
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

  async getUserByEmail(email) {
    try {
      const result = await api.users.getByEmail(email);
      return result.data ? mapBackendUser(result.data) : null;
    } catch (error) {
      console.log('Error al obtener usuario por email:', error.message);
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

  async approveRecipe(idReceta, approve = true) {
    if (!this.useBackend) {
      throw new Error('Function requires backend connection');
    }
    
    try {
      console.log('DataService.approveRecipe called with:', { idReceta, approve });
      const response = await api.recipes.approve(idReceta, approve);
      console.log('DataService.approveRecipe response:', response);
      return response;
    } catch (error) {
      console.error('Error approving recipe:', error);
      throw error;
    }
  }

  async updateUserRecipe(recipeId, recipeData, userId) {
    try {
      console.log(`Updating recipe ${recipeId} for user ${userId}`, recipeData);
      
      // Formato esperado por el backend
      const formattedData = {
        nombreReceta: recipeData.title || recipeData.nombreReceta,
        descripcionReceta: recipeData.description || recipeData.descripcionReceta,
        fotoPrincipal: recipeData.imageUrl || recipeData.fotoPrincipal,
        porciones: parseInt(recipeData.servings || recipeData.porciones || 1),
        cantidadPersonas: parseInt(recipeData.servings || recipeData.cantidadPersonas || 1),
        instrucciones: Array.isArray(recipeData.instructions) 
          ? recipeData.instructions.map(i => i.text || i).join('\n')
          : (recipeData.instructions || recipeData.instrucciones || ''),
        usuario: {
          idUsuario: userId
        },
        idTipo: recipeData.tipoReceta || recipeData.idTipo || { idTipo: 1 },
        ingredientes: []
      };

      // Procesar ingredientes con un formato consistente
      const ingredientesToProcess = recipeData.ingredients || recipeData.ingredientes || [];
      console.log('Ingredientes a procesar:', JSON.stringify(ingredientesToProcess));
      
      if (ingredientesToProcess.length > 0) {
        formattedData.ingredientes = ingredientesToProcess.map(ing => {
          // Normalizar ingrediente según su formato
          if (typeof ing === 'string') {
            return {
              nombre: ing,
              cantidad: 1,
              unidadMedida: 'unidad'
            };
          }
          
          // Para ingredientes en formato de objeto
          let nombre = ing.name || ing.nombre || '';
          let cantidad = 1;
          let unidadMedida = ing.unit || ing.unidadMedida || 'unidad';
          
          // Analizar la cantidad si viene como string en 'amount'
          if (ing.amount && typeof ing.amount === 'string') {
            const match = ing.amount.match(/^(\d*\.?\d+)\s*(.*)$/);
            if (match) {
              cantidad = parseFloat(match[1]) || 1;
              if (!ing.unit && match[2].trim()) {
                unidadMedida = match[2].trim();
              }
            }
          } else if (ing.quantity) {
            // Si viene como quantity separado (formato de interfaz de edición)
            cantidad = parseFloat(ing.quantity) || 1;
          } else if (ing.cantidad) {
            // Si viene en formato backend
            cantidad = parseFloat(ing.cantidad) || 1;
          }
          
          console.log(`Ingrediente procesado: ${nombre}, ${cantidad} ${unidadMedida}`);
          
          return {
            nombre: nombre,
            cantidad: cantidad,
            unidadMedida: unidadMedida
          };
        });
      }
      
      console.log('Datos formateados para actualización:', JSON.stringify(formattedData, null, 2));
      const result = await api.recipes.update(recipeId, formattedData);
      console.log('Recipe updated successfully:', result);
      return { success: true, data: result.data || 'Receta actualizada correctamente' };
    } catch (error) {
      console.log('Error updating recipe:', error.message);
      return { success: false, message: error.message || 'No se pudo actualizar la receta' };
    }
  }

  async getPendingRecipes() {
    if (!this.useBackend) {
      throw new Error('Function requires backend connection');
    }
    
    try {
      const response = await api.recipes.getPendingRecipes();
      return response.data.map(mapBackendRecipe) || [];
    } catch (error) {
      console.error('Error getting pending recipes:', error);
      throw error;
    }
  }

  async createEmpresaUser(userData) {
    if (!this.useBackend) {
      throw new Error('Function requires backend connection');
    }
    
    try {
      const response = await api.auth.createEmpresaUser(userData);
      return response.data;
    } catch (error) {
      console.error('Error creating empresa user:', error);
      throw error;
    }
  }

  async createAdminUser(userData) {
    if (!this.useBackend) {
      throw new Error('Function requires backend connection');
    }
    
    try {
      const response = await api.auth.createAdminUser(userData);
      return response.data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  async updateUserProfile(userData) {
    try {
      const result = await api.users.updateProfile(userData);
      return result.data;
    } catch (error) {
      console.log('Error updating user profile:', error.message);
      throw error;
    }
  }

  async upgradeToStudent(idUsuario, studentData) {
    try {
      const result = await api.auth.upgradeToStudent(idUsuario, studentData);
      return result.data;
    } catch (error) {
      console.log('Error upgrading to student:', error.message);
      throw error;
    }
  }

  async registerVisitor(email, idUsuario) {
    try {
      const result = await api.auth.registerVisitor(email, idUsuario);
      return result.data;
    } catch (error) {
      console.log('Error registering visitor:', error.message);
      throw error;
    }
  }

  async registerStudent(email, idUsuario, medioPago, dniFrente, dniFondo, tramite) {
    try {
      const result = await api.auth.registerStudent(email, idUsuario, medioPago, dniFrente, dniFondo, tramite);
      return result.data;
    } catch (error) {
      console.log('Error registering student:', error.message);
      throw error;
    }
  }

  async resetPassword(email) {
    try {
      const result = await api.auth.resetPassword(email);
      return result.data;
    } catch (error) {
      console.log('Error resetting password:', error.message);
      throw error;
    }
  }

  // ===== RECIPE LIST METHODS (Lista de recetas a intentar) =====
  
  // Add recipe to pending list
  async addRecipeToPendingList(idReceta) {
    try {
      console.log('🔄 Adding recipe to pending list:', idReceta);
      
      // Step 1: Check if recipe already exists in current list
      const existingList = await this.getPendingRecipesList();
      const alreadyExists = existingList.some(r => {
        const existingId = String(r.id || r.idReceta);
        const targetId = String(idReceta);
        return existingId === targetId;
      });
      
      if (alreadyExists) {
        console.log('🚫 Recipe already in pending list');
        return { success: false, message: 'La receta ya está en tu lista de pendientes' };
      }
      
      // Step 2: Check if recipe was permanently removed before and clean up if needed
      const permanentlyRemoved = await this.getPermanentlyRemovedList();
      if (permanentlyRemoved.includes(String(idReceta))) {
        console.log('🚫 Recipe was permanently removed, removing from blacklist and adding back');
        // Remove from permanently removed list to allow re-adding
        const updatedRemoved = permanentlyRemoved.filter(id => id !== String(idReceta));
        await AsyncStorage.setItem('permanently_removed_recipes', JSON.stringify(updatedRemoved));
      }
      
      // Step 3: Get recipe details first
      const recipe = await this.getRecipeById(idReceta);
      if (!recipe) {
        return { success: false, message: 'No se pudo encontrar la receta' };
      }
      
      // Step 4: Get current user for backend request
      let currentUser = null;
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          currentUser = JSON.parse(userData);
        }
      } catch (error) {
        console.log('🚫 Error getting current user:', error.message);
      }

      // Step 5: Try backend first with user ID
      let backendSuccess = false;
      try {
        console.log('🔄 Adding recipe to backend with user ID:', currentUser?.idUsuario || 'none');
        
        // Use the existing API method but with user ID parameter
        const result = await api.recipeList.addByIdWithUser(idReceta, currentUser?.idUsuario);
        
        console.log('🔍 Backend response for add:', result);
        console.log('🔍 Backend response type:', typeof result);
        console.log('🔍 Backend response keys:', result ? Object.keys(result) : 'null');
        
        // Check if backend operation was successful
        // Backend might return different response formats
        const isBackendSuccess = result && (
          result.success === true ||  // Explicit success
          result.success !== false || // Not explicitly failed
          (typeof result === 'object' && !result.error) || // Object without error
          (typeof result === 'string' && result.includes('agregad')) // Success message
        );
        
        if (isBackendSuccess) {
          console.log('✅ Recipe added to pending list via backend');
          backendSuccess = true;
          
          // If backend succeeds, DON'T add to localStorage to avoid duplicates
          // The next getPendingRecipesList() call will fetch it from backend
          return { 
            success: true, 
            message: 'Receta agregada a tu lista de pendientes' 
          };
        } else {
          console.log('🚫 Backend response not recognized as success:', result);
        }
      } catch (backendError) {
        console.log('🚫 Backend failed for add:', backendError.message);
        console.log('🚫 Backend error details:', backendError);
      }
      
      // Step 6: ONLY add to localStorage if backend failed (fallback)
      console.log('💾 Backend failed, falling back to localStorage');
      const recipeToAdd = { 
        ...recipe, 
        id: recipe.id || recipe.idReceta, 
        idReceta: recipe.idReceta || recipe.id,
        addedDate: new Date().toISOString(), 
        completed: false 
      };
      
      const updatedList = [...existingList, recipeToAdd];
      await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(updatedList));
      console.log('✅ Recipe added to local pending list (fallback)');
      
      return { 
        success: true, 
        message: 'Receta agregada a tu lista de pendientes (sincronizada)' 
      };
      
    } catch (error) {
      console.error('❌ Error adding recipe to pending list:', error);
      return { success: false, message: 'Error al agregar receta a la lista de pendientes' };
    }
  }

  // Remove recipe from pending list PERMANENTLY (both backend and localStorage)
  async removeRecipeFromPendingList(idReceta) {
    try {
      console.log('🔄 PERMANENTLY removing recipe from pending list:', idReceta);
      
      let backendSuccess = false;
      
      // Step 1: Get current user for backend request
      let currentUser = null;
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          currentUser = JSON.parse(userData);
        }
      } catch (error) {
        console.log('🚫 Error getting current user:', error.message);
      }

      // Step 2: Remove from backend database
      try {
        console.log('🔄 Removing recipe from backend with user ID:', currentUser?.idUsuario || 'none');
        
        const result = await api.recipeList.removeWithUser(idReceta, currentUser?.idUsuario);
        
        console.log('🔍 Backend response for remove:', result);
        console.log('🔍 Backend response type:', typeof result);
        console.log('🔍 Backend response keys:', result ? Object.keys(result) : 'null');
        
        // Check if backend operation was successful
        const isBackendSuccess = result && (
          result.success === true ||  // Explicit success
          result.success !== false || // Not explicitly failed
          (typeof result === 'object' && !result.error) || // Object without error
          (typeof result === 'string' && result.includes('eliminad')) // Success message
        );
        
        if (isBackendSuccess) {
          console.log('✅ Recipe permanently removed from backend database');
          backendSuccess = true;
        } else {
          console.log('🚫 Backend response not recognized as success:', result);
        }
      } catch (backendError) {
        console.log('🚫 Backend failed for remove:', backendError.message);
        console.log('🚫 Backend error details:', backendError);
      }
      
      // Step 3: FORCE complete removal from localStorage
      await this.forceRemoveFromLocalStorage(idReceta);
      
      // Step 4: Add to permanently removed list to prevent re-adding
      await this.addToPermanentlyRemovedList(idReceta);
      
      // Step 5: Clear any cached data to force fresh reload
      await AsyncStorage.removeItem('cache_pending_recipes');
      
      // Step 6: Force refresh from backend on next getPendingRecipesList call
      console.log('🔄 Clearing localStorage to force backend refresh on next load');
      
      console.log('🧹 Complete cleanup finished for recipe:', idReceta);
      
      return { 
        success: true, 
        message: backendSuccess ? 
          'Receta eliminada permanentemente de tu lista' : 
          'Receta eliminada de tu lista de pendientes' 
      };
    } catch (error) {
      console.error('❌ Error removing recipe from pending list:', error);
      return { success: false, message: 'Error al eliminar receta de la lista de pendientes' };
    }
  }

  // Helper method to remove from localStorage
  async removeFromLocalStorage(idReceta) {
    try {
      const existingList = await this.getPendingRecipesList();
      console.log('🔍 Trying to remove recipe with ID:', idReceta, 'from list of', existingList.length, 'recipes');
      
      // Filter using both id and idReceta fields for compatibility
      const initialLength = existingList.length;
      const updatedList = existingList.filter(recipe => 
        recipe.id !== idReceta && 
        recipe.idReceta !== idReceta &&
        String(recipe.id) !== String(idReceta) &&
        String(recipe.idReceta) !== String(idReceta)
      );
      
      if (updatedList.length < initialLength) {
        await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(updatedList));
        console.log('✅ Recipe removed from local storage');
        return true;
      } else {
        console.log('❌ Recipe not found in local storage');
        return false;
      }
    } catch (error) {
      console.error('❌ Error removing from localStorage:', error);
      return false;
    }
  }

  // Cleanup method that completely removes a recipe from localStorage (including completion states)
  async cleanupLocalStorage(idReceta) {
    try {
      console.log('🧹 Cleaning up localStorage for recipe:', idReceta);
      
      // Get current localStorage data directly (not merged with backend)
      const stored = await AsyncStorage.getItem('pending_recipes_list');
      let localRecipes = stored ? JSON.parse(stored) : [];
      
      // Filter out the recipe completely
      const cleanedList = localRecipes.filter(recipe => {
        const recipeId = recipe.id || recipe.idReceta;
        const targetId = idReceta;
        return String(recipeId) !== String(targetId);
      });
      
      // Save the cleaned list
      await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(cleanedList));
      console.log(`✅ Recipe ${idReceta} completely removed from localStorage. Remaining: ${cleanedList.length}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error cleaning up localStorage:', error);
      return false;
    }
  }

  // FORCE remove from localStorage - more aggressive cleanup
  async forceRemoveFromLocalStorage(idReceta) {
    try {
      console.log('💀 FORCE removing recipe from localStorage:', idReceta);
      
      // Get current localStorage data
      const stored = await AsyncStorage.getItem('pending_recipes_list');
      let localRecipes = stored ? JSON.parse(stored) : [];
      
      console.log('📋 Before removal - recipes in localStorage:', localRecipes.map(r => ({
        id: r.id,
        idReceta: r.idReceta, 
        name: r.title || r.nombreReceta,
        completed: r.completed
      })));
      
      // More aggressive filtering - check all possible ID combinations
      const cleanedList = localRecipes.filter(recipe => {
        const recipeIdStr = String(recipe.id || '');
        const recipeIdRecetaStr = String(recipe.idReceta || '');
        const targetIdStr = String(idReceta);
        
        const shouldKeep = recipeIdStr !== targetIdStr && recipeIdRecetaStr !== targetIdStr;
        
        if (!shouldKeep) {
          console.log(`🗑️ Removing recipe: ${recipe.title || recipe.nombreReceta} (ID: ${recipe.id || recipe.idReceta})`);
        }
        
        return shouldKeep;
      });
      
      // Save the cleaned list
      await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(cleanedList));
      
      console.log('📋 After removal - recipes remaining:', cleanedList.map(r => ({
        id: r.id,
        idReceta: r.idReceta, 
        name: r.title || r.nombreReceta,
        completed: r.completed
      })));
      
      console.log(`💀 FORCE removal complete. Removed: ${localRecipes.length - cleanedList.length}, Remaining: ${cleanedList.length}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error in force removal:', error);
      return false;
    }
  }

  // Get pending recipes list (combines backend data with localStorage completion states)
  async getPendingRecipesList() {
    try {
      console.log('🔄 Getting pending recipes list...');
      
      let backendRecipes = [];
      let backendAvailable = false;
      
      // Get permanently removed recipes list
      const permanentlyRemoved = await this.getPermanentlyRemovedList();
      
      // Get current user for backend request
      let currentUser = null;
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          currentUser = JSON.parse(userData);
        }
      } catch (error) {
        console.log('🚫 Error getting current user:', error.message);
      }

      // Try to get recipes from backend first
      try {
        console.log('🔄 Getting recipes from backend with user ID:', currentUser?.idUsuario || 'none');
        
        const result = await api.recipeList.getWithUser(currentUser?.idUsuario);
        
        console.log('🔍 Backend response for get:', result);
        console.log('🔍 Backend response type:', typeof result);
        console.log('🔍 Backend response keys:', result ? Object.keys(result) : 'null');
        
        // Handle different response formats from backend
        let backendData = null;
        if (Array.isArray(result)) {
          // Direct array response
          backendData = result;
        } else if (result && Array.isArray(result.data)) {
          // Wrapped in data property
          backendData = result.data;
        } else if (result && result.recetas && Array.isArray(result.recetas)) {
          // Wrapped in recetas property
          backendData = result.recetas;
        } else if (result && typeof result === 'object' && !result.error) {
          // Object response, maybe success but no data
          backendData = [];
          console.log('🔍 Backend returned object without data array, treating as empty list');
        }
        
        if (backendData !== null) {
          backendRecipes = backendData
            .filter(recipe => {
              // Filter out permanently removed recipes
              const recipeId = String(recipe.idReceta || recipe.id);
              return !permanentlyRemoved.includes(recipeId);
            })
            .map(recipe => {
              const mapped = mapBackendRecipe(recipe);
              return {
                ...mapped,
                id: mapped.id || mapped.idReceta,
                idReceta: mapped.idReceta || mapped.id,
                // Keep the completed status from backend, don't override it
                completed: mapped.completed || false,
                addedDate: mapped.addedDate || new Date().toISOString()
              };
            });
          backendAvailable = true;
          console.log(`🗄️ Backend returned ${backendRecipes.length} recipes (filtered ${backendData.length - backendRecipes.length} permanently removed)`);
        } else {
          console.log('🚫 Backend response format not recognized as success:', result);
        }
      } catch (backendError) {
        console.log('🚫 Backend not available:', backendError.message);
      }
      
      // Get local storage data (for completion states and fallback)
      const stored = await AsyncStorage.getItem('pending_recipes_list');
      let localRecipes = stored ? JSON.parse(stored) : [];
      
      // Ensure compatibility - add missing id or idReceta fields
      localRecipes = localRecipes.map(recipe => ({
        ...recipe,
        id: recipe.id || recipe.idReceta,
        idReceta: recipe.idReceta || recipe.id
      }))
      .filter(recipe => {
        // Filter out permanently removed recipes from localStorage too
        const recipeId = String(recipe.id || recipe.idReceta);
        return !permanentlyRemoved.includes(recipeId);
      });
      
      console.log(`💾 localStorage contains ${localRecipes.length} recipes`);
      
      if (backendAvailable) {
        // STRICT MODE: Only show recipes that exist in backend
        const backendIds = new Set(backendRecipes.map(r => String(r.id || r.idReceta)));
        
        // First, clean up localStorage to remove orphaned recipes
        const cleanedLocalRecipes = localRecipes.filter(localRecipe => {
          const localId = String(localRecipe.id || localRecipe.idReceta);
          return backendIds.has(localId);
        });
        
        // Save cleaned localStorage if changed
        if (cleanedLocalRecipes.length !== localRecipes.length) {
          await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(cleanedLocalRecipes));
          console.log(`🧹 Cleaned ${localRecipes.length - cleanedLocalRecipes.length} orphaned recipes from localStorage`);
        }
        
        // Merge backend recipes with local completion states (only for existing recipes)
        const mergedRecipes = backendRecipes.map(backendRecipe => {
          const localMatch = cleanedLocalRecipes.find(localRecipe => {
            const backendId = String(backendRecipe.id || backendRecipe.idReceta);
            const localId = String(localRecipe.id || localRecipe.idReceta);
            return backendId === localId;
          });
          
          return {
            ...backendRecipe,
            // Backend is now the source of truth for completion status
            completed: backendRecipe.completed || false,
            completedDate: backendRecipe.completedDate || localMatch?.completedDate || null,
            addedDate: backendRecipe.addedDate || localMatch?.addedDate
          };
        });
        
        console.log(`✅ ${mergedRecipes.length} recipes merged (STRICT: backend-only + localStorage states)`);
        return mergedRecipes;
      } else {
        // Fallback to localStorage only
        console.log(`✅ ${localRecipes.length} recipes loaded from localStorage (fallback)`);
        return localRecipes;
      }
    } catch (error) {
      console.error('❌ Error getting pending recipes list:', error);
      return [];
    }
  }

  // Clean up orphaned recipes (recipes in localStorage that are no longer in backend)
  async cleanupOrphanedRecipes(backendRecipes, localRecipes) {
    try {
      const backendIds = new Set(backendRecipes.map(r => String(r.id || r.idReceta)));
      
      // Filter out local recipes that are no longer in the backend
      const cleanedLocalRecipes = localRecipes.filter(localRecipe => {
        const localId = String(localRecipe.id || localRecipe.idReceta);
        return backendIds.has(localId);
      });
      
      // Only update localStorage if there was a change
      if (cleanedLocalRecipes.length !== localRecipes.length) {
        await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(cleanedLocalRecipes));
        console.log(`🧹 Cleaned up ${localRecipes.length - cleanedLocalRecipes.length} orphaned recipes from localStorage`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up orphaned recipes:', error);
    }
  }

  // Mark recipe as completed in pending list (backend + localStorage fallback)
  async markRecipeAsCompleted(idReceta, completed = true) {
    try {
      console.log(`🔄 Marking recipe ${completed ? 'completed' : 'uncompleted'}:`, idReceta);
      
      // Get current user for backend request
      let currentUser = null;
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          currentUser = JSON.parse(userData);
        }
      } catch (error) {
        console.log('🚫 Error getting current user:', error.message);
      }

      // Try backend first
      try {
        console.log('🔄 Marking completion in backend with user ID:', currentUser?.idUsuario || 'none');
        
        const result = await api.recipeList.markAsCompleted(idReceta, completed, currentUser?.idUsuario);
        
        console.log('🔍 Backend response for mark completion:', result);
        console.log('🔍 Backend response type:', typeof result);
        
        // Check if backend operation was successful
        const isBackendSuccess = result && (
          result.success === true ||  // Explicit success
          result.success !== false || // Not explicitly failed
          (typeof result === 'object' && !result.error) || // Object without error
          (typeof result === 'string' && (result.includes('marcada') || result.includes('completed'))) // Success message
        );
        
        if (isBackendSuccess) {
          console.log('✅ Recipe completion status updated in backend');
          
          // Backend succeeded, return success immediately
          return { 
            success: true, 
            message: completed ? 'Receta marcada como completada' : 'Receta marcada como pendiente' 
          };
        } else {
          console.log('🚫 Backend response not recognized as success:', result);
        }
      } catch (backendError) {
        console.log('🚫 Backend failed for mark completion:', backendError.message);
        console.log('🚫 Backend error details:', backendError);
      }

      // Fallback to localStorage if backend fails
      console.log('🔄 Marking completion in localStorage as fallback');
      
      const storedList = await AsyncStorage.getItem('pending_recipes_list');
      const localList = storedList ? JSON.parse(storedList) : [];
      
      let recipeFound = false;
      const updatedList = localList.map(recipe => {
        const targetId = String(idReceta);
        const recipeIdStr = String(recipe.id || recipe.idReceta);
        
        if (recipeIdStr === targetId) {
          recipeFound = true;
          console.log('✅ Found recipe to mark in localStorage:', recipe.title || recipe.nombreReceta);
          return { 
            ...recipe, 
            completed, 
            completedDate: completed ? new Date().toISOString() : null 
          };
        }
        return recipe;
      });
      
      if (recipeFound) {
        await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(updatedList));
        console.log(`✅ Recipe completion state updated in localStorage`);
        return { 
          success: true, 
          message: `${completed ? 'Receta marcada como completada' : 'Receta marcada como pendiente'} (offline)` 
        };
      } else {
        console.log('❌ Recipe not found for marking');
        return { success: false, message: 'Receta no encontrada en tu lista' };
      }
    } catch (error) {
      console.error('❌ Error marking recipe as completed:', error);
      return { success: false, message: 'Error al actualizar el estado de la receta' };
    }
  }

  // Get pending recipes count
  async getPendingRecipesCount() {
    try {
      const list = await this.getPendingRecipesList();
      const pendingCount = list.filter(recipe => !recipe.completed).length;
      const completedCount = list.filter(recipe => recipe.completed).length;
      
      return {
        total: list.length,
        pending: pendingCount,
        completed: completedCount
      };
    } catch (error) {
      console.error('❌ Error getting pending recipes count:', error);
      return { total: 0, pending: 0, completed: 0 };
    }
  }

  // ===== PERMANENTLY REMOVED RECIPES MANAGEMENT =====
  
  // Add recipe to permanently removed list
  async addToPermanentlyRemovedList(idReceta) {
    try {
      const currentList = await this.getPermanentlyRemovedList();
      const recipeId = String(idReceta);
      
      if (!currentList.includes(recipeId)) {
        currentList.push(recipeId);
        await AsyncStorage.setItem('permanently_removed_recipes', JSON.stringify(currentList));
        console.log(`✅ Recipe ${recipeId} added to permanently removed list`);
      }
    } catch (error) {
      console.error('❌ Error adding to permanently removed list:', error);
    }
  }

  // Get permanently removed recipes list
  async getPermanentlyRemovedList() {
    try {
      const stored = await AsyncStorage.getItem('permanently_removed_recipes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error getting permanently removed list:', error);
      return [];
    }
  }

  // Clear permanently removed list (for debugging or reset)
  async clearPermanentlyRemovedList() {
    try {
      await AsyncStorage.removeItem('permanently_removed_recipes');
      console.log('🧹 Permanently removed list cleared');
    } catch (error) {
      console.error('❌ Error clearing permanently removed list:', error);
    }
  }

  // Clear ALL localStorage related to pending recipes (for debugging)
  async clearAllLocalStorage() {
    try {
      await AsyncStorage.removeItem('pending_recipes_list');
      await AsyncStorage.removeItem('permanently_removed_recipes');
      await AsyncStorage.removeItem('cache_pending_recipes');
      console.log('🧹 All localStorage for pending recipes cleared');
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
    }
  }

  // ===== DEBUG METHODS =====
  
  // Test backend connectivity
  async testBackendConnection() {
    try {
      console.log('🔄 Testing backend connection...');
      const result = await api.utils.checkConnection();
      console.log('✅ Backend connection successful:', result);
      return { success: true, message: 'Backend conectado correctamente' };
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return { success: false, message: `Backend no disponible: ${error.message}` };
    }
  }
  
  // Debug method to show current state
  async debugRecipeListState() {
    try {
      console.log('🔍 === DEBUG: Recipe List State ===');
      
      // Backend recipes
      let backendRecipes = [];
      try {
        const result = await api.recipeList.get();
        backendRecipes = result?.data || [];
        console.log('🗄️ Backend recipes:', backendRecipes.length);
      } catch (error) {
        console.log('🚫 Backend unavailable:', error.message);
      }
      
      // Local storage recipes
      const storedList = await AsyncStorage.getItem('pending_recipes_list');
      const localRecipes = storedList ? JSON.parse(storedList) : [];
      console.log('💾 Local storage recipes:', localRecipes.length);
      
      // Permanently removed
      const permanentlyRemoved = await this.getPermanentlyRemovedList();
      console.log('🚫 Permanently removed recipes:', permanentlyRemoved.length, permanentlyRemoved);
      
      // Current merged list
      const mergedList = await this.getPendingRecipesList();
      console.log('📋 Final merged list:', mergedList.length);
      
      console.log('🔍 === END DEBUG ===');
      
      return {
        backend: backendRecipes.length,
        localStorage: localRecipes.length,
        permanentlyRemoved: permanentlyRemoved.length,
        finalList: mergedList.length,
        permanentlyRemovedIds: permanentlyRemoved
      };
    } catch (error) {
      console.error('❌ Error in debug method:', error);
      return null;
    }
  }

  // Method to completely reset recipe list state (for troubleshooting)
  async resetRecipeListState() {
    try {
      console.log('🔄 Resetting recipe list state...');
      
      // Use the dedicated clear method
      await this.clearAllLocalStorage();
      
      console.log('✅ Recipe list state reset complete');
      return { success: true, message: 'Estado de lista de recetas reiniciado' };
    } catch (error) {
      console.error('❌ Error resetting recipe list state:', error);
      return { success: false, message: 'Error al reiniciar estado' };
    }
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService; 