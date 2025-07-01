import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    time: 30, 
    ingredients: Array.isArray(receta.ingredientes) ? receta.ingredientes.map(ing => ({
      name: ing.nombre || ing.name,
      amount: ing.cantidad && ing.unidadMedida ? `${ing.cantidad} ${ing.unidadMedida}`.trim() : (ing.amount || '1 unidad'),
      preparation: ''
    })) : [],
    ingredientes: receta.ingredientes || [],
    instructions: Array.isArray(receta.pasos) && receta.pasos.length > 0 ? 
                  receta.pasos.map((paso, index) => ({
                    step: paso.nroPaso || index + 1,
                    text: paso.texto || paso.text || paso.toString(),
                    hasImage: !!paso.imagen,
                    imageUrl: paso.imagen || null
                  })) :
                  Array.isArray(receta.instrucciones) ? receta.instrucciones : 
                  typeof receta.instrucciones === 'string' ? 
                  receta.instrucciones.split('\n').map((step, index) => ({
                    step: index + 1,
                    text: step.trim(),
                    hasImage: false,
                    imageUrl: null
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
    rating: receta.calificacionPromedio || 0, 
    calificacionPromedio: receta.calificacionPromedio || 0,
    reviews: receta.totalCalificaciones || 0,
    totalCalificaciones: receta.totalCalificaciones || 0,
    autorizada: receta.autorizada,
    completed: receta.completada || false,
    completada: receta.completada || false,
    completedDate: receta.fechaCompletada,
    fechaCompletada: receta.fechaCompletada,
    addedDate: receta.fechaAgregada,
    fechaAgregada: receta.fechaAgregada,
    additionalImages: Array.isArray(receta.multimedia) ? 
                     receta.multimedia.filter(media => media.tipo === 'foto_receta').map(media => media.url) : 
                     [],
    multimedia: receta.multimedia || []
  };
}

function mapBackendCourse(curso) {
  console.log('=== MAPPING BACKEND COURSE ===');
  console.log('Curso recibido:', curso);
  
  let status = 'active';
  const today = new Date();
  const startDate = new Date(curso.fechaInicio);
  const endDate = new Date(curso.fechaFin);
  
  if (curso.estadoInscripcion) {
    if (curso.estadoInscripcion === 'cancelado') {
      status = 'cancelled'; 
    } else if (today < startDate) {
      status = 'upcoming';
    } else if (today > endDate) {
      status = 'completed';
    } else {
      status = 'active';
    }
  } else {
    status = 'available';
  }
  
  const mappedCourse = {
    id: curso.idCurso,
    idCurso: curso.idCurso,
    idCronograma: curso.idCronograma,
    idInscripcion: curso.idInscripcion, 
    title: curso.descripcion || 'Sin título',
    descripcion: curso.descripcion || 'Sin descripción',
    contenidos: curso.contenidos || 'No especificado',
    requerimientos: curso.requerimientos || 'No especificado',
    duracion: curso.duracion && curso.duracion > 0 ? curso.duracion : '-',
    precio: curso.precio !== null && curso.precio !== undefined ? curso.precio : '-',
    modalidad: curso.modalidad || 'No especificado',
    insumos: curso.insumos, 
    imageUrl: 'https://via.placeholder.com/300x200?text=Curso',
    availableSeats: curso.vacantesDisponibles || 0,
    startDate: curso.fechaInicio || '',
    endDate: curso.fechaFin || '',
    location: curso.sede ? curso.sede.nombre || curso.sede.nombreSede : '',
    instructor: 'Chef Profesional',
    status: status, 
    nextSession: curso.fechaInicio || '',
    totalHours: curso.duracion && curso.duracion > 0 ? curso.duracion : '-',
    topics: curso.contenidos ? curso.contenidos.split(',') : [],
    sede: curso.sede || null,
    progress: curso.progress || 0,
    attendance: curso.attendance || [], 
    estadoInscripcion: curso.estadoInscripcion,
    estadoPago: curso.estadoPago,
    fechaInscripcion: curso.fechaInscripcion,
    monto: curso.monto
  };
  
  console.log('Curso mapeado:', mappedCourse);
  return mappedCourse;
}

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
    
  };
}

function mapBackendAlumno(alumno) {
  return {
    id: alumno.idAlumno,
    cardNumber: alumno.numeroTarjeta,
    dniFront: alumno.dniFrente,
    dniBack: alumno.dniFondo,
    tramite: alumno.tramite,
    accountBalance: alumno.cuentaCorriente,
    cuentaCorriente: alumno.cuentaCorriente, 
    idCronograma: alumno.idCronograma,
    mail: alumno.mail,
    nombre: alumno.nombre,
    nickname: alumno.nickname,
    tipo: alumno.tipo,
  };
}

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
    
  };
}

function mapBackendCronograma(cronograma) {
  return {
    id: cronograma.idCronograma,
    idSede: cronograma.idSede,
    idCurso: cronograma.idCurso,
    startDate: cronograma.fechaInicio,
    endDate: cronograma.fechaFin,
    availableSeats: cronograma.vacantesDisponibles,
    
  };
}

class DataService {
  constructor() {
    this.useBackend = true;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  async checkBackendAvailability() {
    try {
      await api.utils.checkConnection();
      this.useBackend = true;
      return true;
    } catch (error) {
      console.log('Backend no disponible, usando datos simulados:', error.message);
      this.useBackend = false;
      return false;
    }
  }

  async tryBackendFirst(backendCall, mockData, cacheKey = null) {
    try {
      if (cacheKey) {
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
          return cached;
        }
      }

      if (this.useBackend) {
        const result = await backendCall();
        
        if (cacheKey && result.success) {
          await this.saveToCache(cacheKey, result.data);
        }
        
        return result.data;
      }
    } catch (error) {
      console.log('Llamada al backend fallida, usando datos simulados:', error.message);
      this.useBackend = false;
    }

    return mockData;
  }

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
      console.log('Error de lectura de caché:', error);
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
      console.log('Error de escritura en caché:', error);
    }
  }

  async getAllRecipes() {
    try {
      console.log('📲 Solicitando todas las recetas al backend...');
      const response = await api.recipes.getAll(); 
      console.log(`Total de recetas recibidas: ${response.data?.length || 0}`);
      
      const recipes = response.data.map(mapBackendRecipe);
      const authorizedRecipes = recipes.filter(recipe => recipe.autorizada === true);
      
      console.log(`Recetas autorizadas filtradas: ${authorizedRecipes.length} de ${recipes.length}`);
      
      return authorizedRecipes;
    } catch (error) {
      console.log('Error al obtener recetas:', error.message);
      return [];
    }
  }

  async getLatestRecipes() {
    try {
      console.log('Solicitando últimas recetas al backend (ordenadas por ID descendente)...');
      const result = await api.recipes.getLatest();
      console.log(`Recetas recibidas del backend: ${result.data?.length || 0}`);
      
      const recipes = result.data.map(mapBackendRecipe);
      
      if (recipes.length > 0) {
        console.log('Detalle de las recetas recibidas:');
        recipes.forEach(recipe => {
          console.log(`Receta: ${recipe.title || recipe.nombreReceta}`);
          console.log(`   ID: ${recipe.id || recipe.idReceta}`);
          console.log(`   Autorizada: ${recipe.autorizada === true ? 'Sí' : 'No'}`);
          console.log(`   Fecha: ${recipe.date || recipe.fecha || 'No especificada'}`);
          console.log(`   Categoría: ${recipe.category || 'Sin categoría'}`);
          console.log(`   Autor: ${recipe.author || 'Desconocido'}`);
        });
      } else {
        console.log('No se recibieron recetas del backend');
      }
      
      return recipes;
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
        
        const formattedData = {
          nombreReceta: recipeData.title || recipeData.nombreReceta,
          descripcionReceta: recipeData.description || recipeData.descripcionReceta,
          fotoPrincipal: recipeData.imageUrl || recipeData.fotoPrincipal,
          porciones: parseInt(recipeData.servings || recipeData.porciones || 1),
          cantidadPersonas: parseInt(recipeData.servings || recipeData.cantidadPersonas || 1),
          pasos: Array.isArray(recipeData.instructions) 
            ? recipeData.instructions.map((inst, index) => ({
                texto: inst.text || inst.toString()
              }))
            : [],
          instrucciones: Array.isArray(recipeData.instructions) 
            ? recipeData.instructions.map(i => i.text || i).join('\n')
            : (recipeData.instructions || recipeData.instrucciones || ''),
          usuario: {
            idUsuario: recipeData.user?.id || recipeData.usuario?.idUsuario || recipeData.idUsuario
          },
          idTipo: recipeData.tipoReceta || recipeData.idTipo || { idTipo: 1 },
          ingredientes: (recipeData.ingredients || recipeData.ingredientes || []).map(ing => {
            if (typeof ing === 'string') {
              return {
                nombre: ing,
                cantidad: 1,
                unidadMedida: 'unidad'
              };
            }
            
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
        
        try {
          const response = await api.recipes.create(formattedData);
          console.log('Recipe created successfully:', response);
          return response;
        } catch (primaryError) {
          console.log('Primary create endpoint failed:', primaryError);
          const altResponse = await api.recipes.createAlternative(formattedData);
          console.log('Recipe created with alternative endpoint:', altResponse);
          return altResponse;
        }
      }
    } catch (error) {
      console.log('Failed to create recipe on backend:', error);
    }

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

  
  async getAllCourses(idUsuario) {
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
      console.log('getUserCourses - ID Usuario recibido:', idUsuario);
      
      const userData = await AsyncStorage.getItem('user_data');
      let userInfo = null;
      if (userData) {
        userInfo = JSON.parse(userData);
        console.log('Información del usuario:', userInfo);
      }
      
      if (userInfo && userInfo.tipo && userInfo.tipo !== 'alumno') {
        console.log('Usuario no es alumno, tipo:', userInfo.tipo);
        console.log('Para ver cursos, el usuario debe estar registrado como alumno');
        return [];
      }
      
      console.log('Llamando al endpoint /alumno/' + idUsuario);
      const result = await api.courses.getByStudent(idUsuario);
      
      if (result && result.data) {
        console.log('Cursos encontrados:', result.data.length);
        return result.data.map(mapBackendCourse) || [];
      } else {
        console.log('No se encontraron datos de cursos');
        return [];
      }
    } catch (error) {
      // Solo mostrar logs detallados en desarrollo
      if (__DEV__) {
        console.log('Información de error en getUserCourses para debugging:');
        console.log('- Error message:', error.message);
        
        if (error.response) {
          const status = error.response.status;
          console.log(`- Status HTTP: ${status}`);
          
          if (status === 404) {
            console.log('- Usuario no encontrado como alumno - probablemente no está registrado como alumno');
          } else if (status === 500) {
            console.log('- Error del servidor - revisar logs del backend');
          }
        }
      }
      
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
      console.log('=== INSCRIBIRSE CURSO DEBUG DATASERVICE ===');
      console.log('idAlumno:', idAlumno);
      console.log('idCronograma:', idCronograma);
      console.log('API Base URL:', api.baseURL);
      
      const result = await api.courses.enroll(idAlumno, idCronograma);
      console.log('Inscripción exitosa:', result);
      return result.data;
    } catch (error) {
      // Solo mostrar logs detallados en desarrollo
      if (__DEV__) {
        console.log('Error al inscribirse en el curso para debugging:');
        console.log('- Error:', error.message);
        console.log('- Status:', error.response?.status);
      }
      throw error;
    }
  }

  async cancelEnrollment(idInscripcion, reintegroEnTarjeta) {
    try {
      console.log('=== CANCELAR INSCRIPCION DEBUG DATASERVICE ===');
      console.log('idInscripcion:', idInscripcion);
      console.log('reintegroEnTarjeta:', reintegroEnTarjeta);
      console.log('API Base URL:', api.baseURL);
      
      const result = await api.courses.cancelEnrollment(idInscripcion, reintegroEnTarjeta);
      console.log('Resultado exitoso:', result);
      return result.data;
    } catch (error) {
      // Solo mostrar logs detallados en desarrollo
      if (__DEV__) {
        console.log('Error al cancelar inscripción para debugging:');
        console.log('- Error:', error.message);
        console.log('- Status:', error.response?.status);
      }
      throw error;
    }
  }

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

   
    const pendingUsers = await AsyncStorage.getItem('pending_registrations');
    const users = pendingUsers ? JSON.parse(pendingUsers) : [];
    users.push({ ...userData, timestamp: Date.now() });
    await AsyncStorage.setItem('pending_registrations', JSON.stringify(users));

    return { success: true, message: 'Registro guardado localmente' };
  }

  
  async syncPendingData() {
    if (!this.useBackend) return;

    try {
     
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
      const pendingUsers = await AsyncStorage.getItem('pending_registrations');
      if (pendingUsers) {
        const users = JSON.parse(pendingUsers);
        const syncedUsers = [];
        for (const user of users) {
          try {
            await api.auth.register(user);
          } catch (error) {
            console.log('Failed to sync user registration:', error);
            syncedUsers.push(user); 
          }
        }
        await AsyncStorage.setItem('pending_registrations', JSON.stringify(syncedUsers));
      }

    } catch (error) {
      console.log('Sync error:', error);
    }
  }

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
      console.error('Error al obtener calificaciones:', error);
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
      console.error('Error al obtener inscripciones:', error);
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
      console.error('Error al obtener sugerencias de recetas:', error);
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
      
      const formattedData = {
        nombreReceta: recipeData.title || recipeData.nombreReceta,
        descripcionReceta: recipeData.description || recipeData.descripcionReceta,
        fotoPrincipal: recipeData.imageUrl || recipeData.fotoPrincipal,
        porciones: parseInt(recipeData.servings || recipeData.porciones || 1),
        cantidadPersonas: parseInt(recipeData.servings || recipeData.cantidadPersonas || 1),
        pasos: Array.isArray(recipeData.instructions) 
          ? recipeData.instructions.map((inst, index) => ({
              texto: inst.text || inst.toString()
            }))
          : [],
        instrucciones: Array.isArray(recipeData.instructions) 
          ? recipeData.instructions.map(i => i.text || i).join('\n')
          : (recipeData.instructions || recipeData.instrucciones || ''),
        usuario: {
          idUsuario: userId
        },
        idTipo: recipeData.tipoReceta || recipeData.idTipo || { idTipo: 1 },
        ingredientes: [],
        fotos: recipeData.fotos || [],
        fotosInstrucciones: recipeData.fotosInstrucciones || []
      };

      const ingredientesToProcess = recipeData.ingredients || recipeData.ingredientes || [];
      console.log('Ingredientes a procesar:', JSON.stringify(ingredientesToProcess));
      
      if (ingredientesToProcess.length > 0) {
        formattedData.ingredientes = ingredientesToProcess.map(ing => {
          if (typeof ing === 'string') {
            return {
              nombre: ing,
              cantidad: 1,
              unidadMedida: 'unidad'
            };
          }
          
          let nombre = ing.name || ing.nombre || '';
          let cantidad = 1;
          let unidadMedida = ing.unit || ing.unidadMedida || 'unidad';
          
          if (ing.amount && typeof ing.amount === 'string') {
            const match = ing.amount.match(/^(\d*\.?\d+)\s*(.*)$/);
            if (match) {
              cantidad = parseFloat(match[1]) || 1;
              if (!ing.unit && match[2].trim()) {
                unidadMedida = match[2].trim();
              }
            }
          } else if (ing.quantity) {
            cantidad = parseFloat(ing.quantity) || 1;
          } else if (ing.cantidad) {
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
      const result = await api.recipes.updateWithSteps(recipeId, formattedData);
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

  async registerVisitor(email, alias) {
    try {
      const result = await api.auth.registerVisitor(email, alias);
      return result.data;
    } catch (error) {
      console.log('Error registering visitor:', error.message);
      throw error;
    }
  }

  async registerVisitorStage1(email, alias) {
    try {
      const result = await api.auth.registerVisitorStage1(email, alias);
      return result.data;
    } catch (error) {
      console.log('Error registering visitor stage 1:', error.message);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log('Backend error data:', errorData);
        
        const enhancedError = new Error(errorData.error || error.message);
        enhancedError.aliasUnavailable = errorData.aliasUnavailable;
        enhancedError.suggestions = errorData.suggestions;
        enhancedError.success = errorData.success;
        enhancedError.backendResponse = errorData;
        
        throw enhancedError;
      }
      
      throw error;
    }
  }

  async verifyVisitorCode(email, codigo) {
    try {
      const result = await api.auth.verifyVisitorCode(email, codigo);
      return result.data;
    } catch (error) {
      console.log('Error verifying visitor code:', error.message);
      throw error;
    }
  }

  async resendVisitorCode(email) {
    try {
      const result = await api.auth.resendVisitorCode(email);
      return result.data;
    } catch (error) {
      console.log('Error resending visitor code:', error.message);
      throw error;
    }
  }

  async getSugerenciasAlias(baseAlias) {
    return api.auth.getSugerenciasAlias(baseAlias);
  }

  async registerUserStage1(email, alias) {
    try {
      const response = await api.auth.registerUserStage1(email, alias);
      return response.data;  
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw new Error('Error de comunicación con el servidor.');
    }
  }

  async verifyUserCode(email, codigo) {
    try {
      const response = await api.auth.verifyUserCode(email, codigo);
      return response.data;
    } catch (error) {
      console.log('Error verifying user code:', error.message);
      throw error;
    }
  }

  async completeUserRegistration(email, nombre, password) {
    try {
      const result = await api.auth.completeUserRegistration(email, nombre, password);
      return result.data;
    } catch (error) {
      console.log('Error completing user registration:', error.message);
      throw error;
    }
  }

  async resendUserCode(email) {
    try {
      const result = await api.auth.resendUserCode(email);
      return result.data;
    } catch (error) {
      console.log('Error resending user code:', error.message);
      throw error;
    }
  }

  async registerStudent(email, idUsuario, medioPago, dniFrente, dniFondo, tramite) {
    try {
      const result = await api.auth.registerStudent(email, idUsuario, medioPago, dniFrente, dniFondo, tramite);
      return result.data;
    } catch (error) {
      console.log('Error al registrar alumno:', error.message);
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


  async addRecipeToPendingList(idReceta) {
    try {
      console.log('Agregando receta a la lista pendiente:', idReceta);
      
      const existingList = await this.getPendingRecipesList();
      const alreadyExists = existingList.some(r => {
        const existingId = String(r.id || r.idReceta);
        const targetId = String(idReceta);
        return existingId === targetId;
      });
      
      if (alreadyExists) {
        console.log('La receta ya está en la lista pendiente');
        return { success: false, message: 'La receta ya está en tu lista de pendientes' };
      }
      
      const permanentlyRemoved = await this.getPermanentlyRemovedList();
      if (permanentlyRemoved.includes(String(idReceta))) {
        console.log('La receta fue eliminada permanentemente, eliminando de la lista negra y volviendo a agregar');
        const updatedRemoved = permanentlyRemoved.filter(id => id !== String(idReceta));
        await AsyncStorage.setItem('permanently_removed_recipes', JSON.stringify(updatedRemoved));
      }
      
      const recipe = await this.getRecipeById(idReceta);
      if (!recipe) {
        return { success: false, message: 'No se pudo encontrar la receta' };
      }
      
      let currentUser = null;
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          currentUser = JSON.parse(userData);
        }
      } catch (error) {
        console.log('Error al obtener usuario actual:', error.message);
      }

      let backendSuccess = false;
      try {
        console.log('Agregando receta al backend con ID de usuario:', currentUser?.idUsuario || 'ninguno');
        
        const result = await api.recipeList.addByIdWithUser(idReceta, currentUser?.idUsuario);
        
        console.log('Respuesta del backend para agregar:', result);
        console.log('Tipo de respuesta del backend:', typeof result);
        console.log('Claves de respuesta del backend:', result ? Object.keys(result) : 'null');
        
        const isBackendSuccess = result && (
          result.success === true ||  
          result.success !== false || 
          (typeof result === 'object' && !result.error) || 
          (typeof result === 'string' && result.includes('agregad')) 
        );
        
        if (isBackendSuccess) {
          console.log('Receta agregada a la lista pendiente vía backend');
          backendSuccess = true;
          
          return { 
            success: true, 
            message: 'Receta agregada a tu lista de pendientes' 
          };
        } else {
          console.log('Respuesta del backend no reconocida como éxito:', result);
        }
      } catch (backendError) {
        console.log('Backend falló para agregar:', backendError.message);
        console.log('Detalles del error del backend:', backendError);
      }
      
      console.log('Backend falló, recurriendo a localStorage');
      const recipeToAdd = { 
        ...recipe, 
        id: recipe.id || recipe.idReceta, 
        idReceta: recipe.idReceta || recipe.id,
        addedDate: new Date().toISOString(), 
        completed: false 
      };
      
      const updatedList = [...existingList, recipeToAdd];
      await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(updatedList));
      console.log('Receta agregada a la lista pendiente local (respaldo)');
      
      return { 
        success: true, 
        message: 'Receta agregada a tu lista de pendientes (sincronizada)' 
      };
      
    } catch (error) {
      console.error('Error al agregar receta a la lista pendiente:', error);
      return { success: false, message: 'Error al agregar receta a la lista de pendientes' };
    }
  }

  async removeRecipeFromPendingList(idReceta) {
    try {
      console.log('Eliminando PERMANENTEMENTE la receta de la lista pendiente:', idReceta);
      
      let backendSuccess = false;
      
      let currentUser = null;
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          currentUser = JSON.parse(userData);
        }
      } catch (error) {
        console.log('Error al obtener usuario actual:', error.message);
      }

      try {
        console.log('Eliminando receta del backend con ID de usuario:', currentUser?.idUsuario || 'ninguno');
        
        const result = await api.recipeList.removeWithUser(idReceta, currentUser?.idUsuario);
        
        console.log('Respuesta del backend para eliminar:', result);
        console.log('Tipo de respuesta del backend:', typeof result);
        console.log('Claves de respuesta del backend:', result ? Object.keys(result) : 'null');
        
        const isBackendSuccess = result && (
          result.success === true || 
          result.success !== false ||
          (typeof result === 'object' && !result.error) ||
          (typeof result === 'string' && result.includes('eliminad')) 
        );
        
        if (isBackendSuccess) {
          console.log('Receta eliminada permanentemente de la base de datos del backend');
          backendSuccess = true;
        } else {
          console.log('Respuesta del backend no reconocida como éxito:', result);
        }
      } catch (backendError) {
        console.log('Backend falló para eliminar:', backendError.message);
        console.log('Detalles del error del backend:', backendError);
      }
      
      await this.forceRemoveFromLocalStorage(idReceta);
      
      await this.addToPermanentlyRemovedList(idReceta);
      
      await AsyncStorage.removeItem('cache_pending_recipes');
      
      console.log('Limpiando localStorage para forzar actualización del backend en la próxima carga');
      
      console.log('Limpieza completa finalizada para la receta:', idReceta);
      
      return { 
        success: true, 
        message: backendSuccess ? 
          'Receta eliminada permanentemente de tu lista' : 
          'Receta eliminada de tu lista de pendientes' 
      };
    } catch (error) {
      console.error('Error al eliminar receta de la lista pendiente:', error);
      return { success: false, message: 'Error al eliminar receta de la lista de pendientes' };
    }
  }

  async removeFromLocalStorage(idReceta) {
    try {
      const existingList = await this.getPendingRecipesList();
      console.log('Intentando eliminar receta con ID:', idReceta, 'de la lista de', existingList.length, 'recetas');
      
      const initialLength = existingList.length;
      const updatedList = existingList.filter(recipe => 
        recipe.id !== idReceta && 
        recipe.idReceta !== idReceta &&
        String(recipe.id) !== String(idReceta) &&
        String(recipe.idReceta) !== String(idReceta)
      );
      
      if (updatedList.length < initialLength) {
        await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(updatedList));
        console.log('Receta eliminada del almacenamiento local');
        return true;
      } else {
        console.log('Receta no encontrada en el almacenamiento local');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar del almacenamiento local:', error);
      return false;
    }
  }

  async cleanupLocalStorage(idReceta) {
    try {
      console.log('Limpiando almacenamiento local para la receta:', idReceta);
      
      const stored = await AsyncStorage.getItem('pending_recipes_list');
      let localRecipes = stored ? JSON.parse(stored) : [];
      
      const cleanedList = localRecipes.filter(recipe => {
        const recipeId = recipe.id || recipe.idReceta;
        const targetId = idReceta;
        return String(recipeId) !== String(targetId);
      });
      
      await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(cleanedList));
      console.log(`Receta ${idReceta} completamente eliminada del almacenamiento local. Restantes: ${cleanedList.length}`);
      
      return true;
    } catch (error) {
      console.error('Error al limpiar almacenamiento local:', error);
      return false;
    }
  }

  async forceRemoveFromLocalStorage(idReceta) {
    try {
      console.log('FORZANDO eliminación de receta del almacenamiento local:', idReceta);
      
      const stored = await AsyncStorage.getItem('pending_recipes_list');
      let localRecipes = stored ? JSON.parse(stored) : [];
      
      console.log('Antes de la eliminación - recetas en almacenamiento local:', localRecipes.map(r => ({
        id: r.id,
        idReceta: r.idReceta, 
        name: r.title || r.nombreReceta,
        completed: r.completed
      })));
      
      const cleanedList = localRecipes.filter(recipe => {
        const recipeIdStr = String(recipe.id || '');
        const recipeIdRecetaStr = String(recipe.idReceta || '');
        const targetIdStr = String(idReceta);
        
        const shouldKeep = recipeIdStr !== targetIdStr && recipeIdRecetaStr !== targetIdStr;
        
        if (!shouldKeep) {
          console.log(`Eliminando receta: ${recipe.title || recipe.nombreReceta} (ID: ${recipe.id || recipe.idReceta})`);
        }
        
        return shouldKeep;
      });
      
      await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(cleanedList));
      
      console.log('Después de la eliminación - recetas restantes:', cleanedList.map(r => ({
        id: r.id,
        idReceta: r.idReceta, 
        name: r.title || r.nombreReceta,
        completed: r.completed
      })));
      
      console.log(`Eliminación FORZADA completa. Eliminadas: ${localRecipes.length - cleanedList.length}, Restantes: ${cleanedList.length}`);
      
      return true;
    } catch (error) {
      console.error('Error en eliminación forzada:', error);
      return false;
    }
  }

  async getPendingRecipesList() {
    try {
      console.log('Getting pending recipes list...');
      
      let backendRecipes = [];
      let backendAvailable = false;
      
      const permanentlyRemoved = await this.getPermanentlyRemovedList();
      
      let currentUser = null;
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          currentUser = JSON.parse(userData);
        }
      } catch (error) {
        console.log('Error getting current user:', error.message);
      }

      try {
        console.log('Getting recipes from backend with user ID:', currentUser?.idUsuario || 'none');
        
        const result = await api.recipeList.getWithUser(currentUser?.idUsuario);
        
        console.log('Backend response for get:', result);
        console.log('Backend response type:', typeof result);
        console.log('Backend response keys:', result ? Object.keys(result) : 'null');
        
        let backendData = null;
        if (Array.isArray(result)) {
          backendData = result;
        } else if (result && Array.isArray(result.data)) {
          backendData = result.data;
        } else if (result && result.recetas && Array.isArray(result.recetas)) {
          backendData = result.recetas;
        } else if (result && typeof result === 'object' && !result.error) {
          backendData = [];
          console.log('Backend returned object without data array, treating as empty list');
        }
        
        if (backendData !== null) {
          backendRecipes = backendData
            .filter(recipe => {
              const recipeId = String(recipe.idReceta || recipe.id);
              return !permanentlyRemoved.includes(recipeId);
            })
            .map(recipe => {
              const mapped = mapBackendRecipe(recipe);
              return {
                ...mapped,
                id: mapped.id || mapped.idReceta,
                idReceta: mapped.idReceta || mapped.id,
                completed: mapped.completed || false,
                addedDate: mapped.addedDate || new Date().toISOString()
              };
            });
          backendAvailable = true;
          console.log(`Backend returned ${backendRecipes.length} recipes (filtered ${backendData.length - backendRecipes.length} permanently removed)`);
        } else {
          console.log('Backend response format not recognized as success:', result);
        }
      } catch (backendError) {
        console.log('Backend not available:', backendError.message);
      }
      
     
      const stored = await AsyncStorage.getItem('pending_recipes_list');
      let localRecipes = stored ? JSON.parse(stored) : [];
      
     
      localRecipes = localRecipes.map(recipe => ({
        ...recipe,
        id: recipe.id || recipe.idReceta,
        idReceta: recipe.idReceta || recipe.id
      }))
      .filter(recipe => {
        
        const recipeId = String(recipe.id || recipe.idReceta);
        return !permanentlyRemoved.includes(recipeId);
      });
      
      console.log(`localStorage contains ${localRecipes.length} recipes`);
      
      if (backendAvailable) {
       
        const backendIds = new Set(backendRecipes.map(r => String(r.id || r.idReceta)));
        
       
        const cleanedLocalRecipes = localRecipes.filter(localRecipe => {
          const localId = String(localRecipe.id || localRecipe.idReceta);
          return backendIds.has(localId);
        });
        
        
        if (cleanedLocalRecipes.length !== localRecipes.length) {
          await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(cleanedLocalRecipes));
          console.log(`Cleaned ${localRecipes.length - cleanedLocalRecipes.length} orphaned recipes from localStorage`);
        }
        
        
        const mergedRecipes = backendRecipes.map(backendRecipe => {
          const localMatch = cleanedLocalRecipes.find(localRecipe => {
            const backendId = String(backendRecipe.id || backendRecipe.idReceta);
            const localId = String(localRecipe.id || localRecipe.idReceta);
            return backendId === localId;
          });
          
          return {
            ...backendRecipe,
            
            completed: backendRecipe.completed || false,
            completedDate: backendRecipe.completedDate || localMatch?.completedDate || null,
            addedDate: backendRecipe.addedDate || localMatch?.addedDate
          };
        });
        
        console.log(`${mergedRecipes.length} recipes merged (STRICT: backend-only + localStorage states)`);
        return mergedRecipes;
      } else {
        console.log(`${localRecipes.length} recipes loaded from localStorage (fallback)`);
        return localRecipes;
      }
    } catch (error) {
      console.error('Error getting pending recipes list:', error);
      return [];
    }
  }

  
  async cleanupOrphanedRecipes(backendRecipes, localRecipes) {
    try {
      const backendIds = new Set(backendRecipes.map(r => String(r.id || r.idReceta)));
            const cleanedLocalRecipes = localRecipes.filter(localRecipe => {
        const localId = String(localRecipe.id || localRecipe.idReceta);
        return backendIds.has(localId);
      });
      
      
      if (cleanedLocalRecipes.length !== localRecipes.length) {
        await AsyncStorage.setItem('pending_recipes_list', JSON.stringify(cleanedLocalRecipes));
        console.log(`Cleaned up ${localRecipes.length - cleanedLocalRecipes.length} orphaned recipes from localStorage`);
      }
    } catch (error) {
      console.error('Error cleaning up orphaned recipes:', error);
    }
  }

  
  async markRecipeAsCompleted(idReceta, completed = true) {
    try {
      console.log(`Marking recipe ${completed ? 'completed' : 'uncompleted'}:`, idReceta);
      
      
      let currentUser = null;
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          currentUser = JSON.parse(userData);
        }
      } catch (error) {
        console.log('Error getting current user:', error.message);
      }

     
      try {
        console.log('Marking completion in backend with user ID:', currentUser?.idUsuario || 'none');
        
        const result = await api.recipeList.markAsCompleted(idReceta, completed, currentUser?.idUsuario);
        
        console.log('Backend response for mark completion:', result);
        console.log('Backend response type:', typeof result);
        
       
        const isBackendSuccess = result && (
          result.success === true ||  
          result.success !== false || 
          (typeof result === 'object' && !result.error) || 
          (typeof result === 'string' && (result.includes('marcada') || result.includes('completed'))) 
        );
        
        if (isBackendSuccess) {
          console.log('Recipe completion status updated in backend');
          
          
          return { 
            success: true, 
            message: completed ? 'Receta marcada como completada' : 'Receta marcada como pendiente' 
          };
        } else {
          console.log('Backend response not recognized as success:', result);
        }
      } catch (backendError) {
        console.log('Backend failed for mark completion:', backendError.message);
        console.log('Backend error details:', backendError);
      }

      
      console.log('Marking completion in localStorage as fallback');
      
      const storedList = await AsyncStorage.getItem('pending_recipes_list');
      const localList = storedList ? JSON.parse(storedList) : [];
      
      let recipeFound = false;
      const updatedList = localList.map(recipe => {
        const targetId = String(idReceta);
        const recipeIdStr = String(recipe.id || recipe.idReceta);
        
        if (recipeIdStr === targetId) {
          recipeFound = true;
          console.log('Found recipe to mark in localStorage:', recipe.title || recipe.nombreReceta);
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
        console.log(`Recipe completion state updated in localStorage`);
        return { 
          success: true, 
          message: `${completed ? 'Receta marcada como completada' : 'Receta marcada como pendiente'} (offline)` 
        };
      } else {
        console.log('Recipe not found for marking');
        return { success: false, message: 'Receta no encontrada en tu lista' };
      }
    } catch (error) {
      console.error('Error marking recipe as completed:', error);
      return { success: false, message: 'Error al actualizar el estado de la receta' };
    }
  }

  
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
      console.error('Error getting pending recipes count:', error);
      return { total: 0, pending: 0, completed: 0 };
    }
  }

  
  async addToPermanentlyRemovedList(idReceta) {
    try {
      const currentList = await this.getPermanentlyRemovedList();
      const recipeId = String(idReceta);
      
      if (!currentList.includes(recipeId)) {
        currentList.push(recipeId);
        await AsyncStorage.setItem('permanently_removed_recipes', JSON.stringify(currentList));
        console.log(`Recipe ${recipeId} added to permanently removed list`);
      }
    } catch (error) {
      console.error('Error adding to permanently removed list:', error);
    }
  }

  
  async getPermanentlyRemovedList() {
    try {
      const stored = await AsyncStorage.getItem('permanently_removed_recipes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting permanently removed list:', error);
      return [];
    }
  }

  
  async clearPermanentlyRemovedList() {
    try {
      await AsyncStorage.removeItem('permanently_removed_recipes');
      console.log('Permanently removed list cleared');
    } catch (error) {
      console.error('Error clearing permanently removed list:', error);
    }
  }

  
  async clearAllLocalStorage() {
    try {
      await AsyncStorage.removeItem('pending_recipes_list');
      await AsyncStorage.removeItem('permanently_removed_recipes');
      await AsyncStorage.removeItem('cache_pending_recipes');
      console.log('🧹 All localStorage for pending recipes cleared');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  
  async testBackendConnection() {
    try {
      console.log('Testing backend connection...');
      const result = await api.utils.checkConnection();
      console.log('Backend connection successful:', result);
      return { success: true, message: 'Backend conectado correctamente' };
    } catch (error) {
      console.error('Backend connection failed:', error);
      return { success: false, message: `Backend no disponible: ${error.message}` };
    }
  }
  

  async debugRecipeListState() {
    try {
      console.log('=== DEBUG: Recipe List State ===');
      
      
      let backendRecipes = [];
      try {
        const result = await api.recipeList.get();
        backendRecipes = result?.data || [];
        console.log('Backend recipes:', backendRecipes.length);
      } catch (error) {
        console.log('Backend unavailable:', error.message);
      }
      
      
      const storedList = await AsyncStorage.getItem('pending_recipes_list');
      const localRecipes = storedList ? JSON.parse(storedList) : [];
      console.log('Local storage recipes:', localRecipes.length);
      
      
      const permanentlyRemoved = await this.getPermanentlyRemovedList();
      console.log('Permanently removed recipes:', permanentlyRemoved.length, permanentlyRemoved);
      
     
      const mergedList = await this.getPendingRecipesList();
      console.log('Final merged list:', mergedList.length);
      
      console.log('=== END DEBUG ===');
      
      return {
        backend: backendRecipes.length,
        localStorage: localRecipes.length,
        permanentlyRemoved: permanentlyRemoved.length,
        finalList: mergedList.length,
        permanentlyRemovedIds: permanentlyRemoved
      };
    } catch (error) {
      console.error('Error in debug method:', error);
      return null;
    }
  }

  
  async resetRecipeListState() {
    try {
      console.log('Resetting recipe list state...');
      
     
      await this.clearAllLocalStorage();
      
      console.log('Recipe list state reset complete');
      return { success: true, message: 'Estado de lista de recetas reiniciado' };
    } catch (error) {
      console.error('Error resetting recipe list state:', error);
      return { success: false, message: 'Error al reiniciar estado' };
    }
  }

  async debugConnection() {
    console.log('=== DEBUG DE CONEXIÓN ===');
    
    try {
      const baseUrl = api.baseURL;
      console.log('URL base de la API:', baseUrl);
      
      const response = await fetch(baseUrl);
      console.log('Conexión básica exitosa, status:', response.status);
      
      const testResponse = await fetch(`${baseUrl}/`);
      const testText = await testResponse.text();
      console.log('Endpoint de prueba:', testText);
      
      return {
        success: true,
        baseUrl,
        message: 'Conexión exitosa'
      };
    } catch (error) {
      console.error('Error en debug de conexión:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }

  async registerAttendance(userId, courseId) {
    console.log('=== REGISTRAR ASISTENCIA REAL ===');
    console.log('UserId (idAlumno):', userId);
    console.log('CourseId (idCronograma):', courseId);
    console.log('API Base URL:', api.baseURL);
    console.log('Endpoint completo:', `${api.baseURL}/registrarAsistencia`);
    
    try {
      console.log('Registrando asistencia en backend...');
      
      // Verificar que los parámetros sean válidos
      if (!userId || !courseId) {
        throw new Error(`Parámetros inválidos - userId: ${userId}, courseId: ${courseId}`);
      }
      
      const requestBody = new URLSearchParams({
        idAlumno: userId.toString(),
        idCronograma: courseId.toString()
      });
      
      console.log('uerpo de la petición:', requestBody.toString());
      
      // Llamar al endpoint real del backend
      const response = await fetch(`${api.baseURL}/registrarAsistencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        if (__DEV__) {
          console.log('Error response texto:', errorText);
        }
        
        // Analizar el tipo de error
        let errorMessage = `Error ${response.status}`;
        if (errorText.includes('Alumno no encontrado')) {
          errorMessage = 'Usuario no encontrado en el sistema';
        } else if (errorText.includes('Cronograma no encontrado')) {
          errorMessage = 'Curso no encontrado en el sistema';
        } else if (errorText.includes('Connection') || errorText.includes('timeout')) {
          errorMessage = 'Error de conexión con el servidor';
        } else {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.text();
      console.log('Asistencia registrada exitosamente en backend:', result);
      
      return {
        success: true,
        message: result || 'Asistencia registrada exitosamente',
        backend: true
      };
      
    } catch (error) {
      // Solo mostrar logs detallados en desarrollo
      if (__DEV__) {
        console.log('Información de error para debugging:');
        console.log('- Error completo:', error.name + ': ' + error.message);
        console.log('- Stack trace disponible en debugging');
      }
      
      // En lugar de siempre retornar éxito, vamos a propagar algunos errores importantes
      if (error.message?.includes('no encontrado') || 
          error.message?.includes('inválidos') ||
          error.message?.includes('not found')) {
        
        if (__DEV__) {
          console.log('🚨 Error crítico - propagando al usuario');
        }
        throw error; // Propagar errores críticos
      }
      
      // Solo para errores de red/conexión, usar modo offline
      if (__DEV__) {
        console.log('🔄 Intentando modo offline...');
      }
      
      try {
        const pendingAttendance = await AsyncStorage.getItem('pending_attendance') || '[]';
        const attendanceList = JSON.parse(pendingAttendance);
        
        const attendanceRecord = {
          idAlumno: userId,
          idCronograma: courseId,
          fecha: new Date().toISOString(),
          sincronizado: false,
          error: error.message
        };
        
        attendanceList.push(attendanceRecord);
        await AsyncStorage.setItem('pending_attendance', JSON.stringify(attendanceList));
        
        if (__DEV__) {
          console.log('💾 Asistencia guardada offline para sincronización posterior');
        }
        
        // Retornar éxito para errores de red
        return {
          success: true,
          message: 'Asistencia registrada (se sincronizará cuando haya conexión)',
          offline: true,
          originalError: error.message
        };
      } catch (storageError) {
        if (__DEV__) {
          console.log('💥 Error guardando asistencia offline:', storageError.message);
        }
        
        // Si también falla el offline, propagar el error original
        throw new Error(`Error de conexión y almacenamiento offline falló: ${error.message}`);
      }
    }
  }
}

const dataService = new DataService();

export default dataService; 