import axios from 'axios';

// Simple in-memory cache for recipes
const recipeCache = {};

// Replace with your actual API base URL when you have one
const API_BASE_URL = 'https://your-api-endpoint.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add authorization token from storage if available
    // const token = await AsyncStorage.getItem('userToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Example API methods
export const recipeService = {
  getRecipes: async (params = {}) => {
    try {
      // For development, return mock data
      return mockRecipes;
      // For production:
      // const response = await api.get('/recipes', { params });
      // return response.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },
  
  getRecipeById: async (id) => {
    try {
      // Normalizar el ID asegurándose de que sea un string
      const recipeId = String(id);
      console.log(`Fetching recipe with normalized ID: ${recipeId}`);
      
      // Check cache first
      if (recipeCache[recipeId]) {
        console.log(`Using cached data for recipe ID: ${recipeId}`);
        return JSON.parse(JSON.stringify(recipeCache[recipeId])); // Return a deep copy
      }
      
      // Para desarrollo, retornar datos de simulación
      let recipe = mockRecipes.find(recipe => String(recipe.id) === recipeId);
      
      // Si la receta no se encuentra, lanzar un error
      if (!recipe) {
        console.error(`Recipe with ID ${recipeId} not found. Available IDs: ${mockRecipes.map(r => r.id).join(', ')}`);
        throw new Error(`Receta con id ${recipeId} no encontrada`);
      }
      
      console.log(`Found recipe: ${recipe.title} with ID: ${recipe.id}`);
      
      // Añadir datos específicos para cada receta basado en su ID
      const specificRecipeData = {
        '1': {
          ingredients: [
            {name: 'quinoa cocida', amount: '1 taza'},
            {name: 'tomates cherry', amount: '1 taza', preparation: 'partidos por la mitad'},
            {name: 'pepino', amount: '1', preparation: 'cortado en cubos'},
            {name: 'aceitunas Kalamata', amount: '1/2 taza', preparation: 'sin hueso'},
            {name: 'queso feta', amount: '1/4 taza', preparation: 'desmenuzado'},
            {name: 'hummus', amount: '1/4 taza'},
            {name: 'aceite de oliva', amount: '2 cucharadas'},
            {name: 'jugo de limón', amount: '1 cucharada'},
            {name: 'orégano seco', amount: '1 cucharadita'},
            {name: 'sal y pimienta', amount: 'al gusto'}
          ],
          instructions: [
            {text: 'Cocina la quinoa según las instrucciones del paquete y déjala enfriar.', hasImage: false},
            {text: 'En un tazón grande, combina la quinoa enfriada, los tomates, el pepino y las aceitunas.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf'},
            {text: 'En un tazón pequeño, mezcla el aceite de oliva, el jugo de limón, el orégano, la sal y la pimienta.', hasImage: false},
            {text: 'Vierte el aderezo sobre la ensalada y mezcla para combinar.', hasImage: false},
            {text: 'Divide la mezcla en tazones para servir y decora con queso feta y hummus.', hasImage: true}
          ]
        },
        '2': {
          ingredients: [
            {name: 'pan integral', amount: '2 rebanadas'},
            {name: 'aguacate maduro', amount: '1'},
            {name: 'tomate', amount: '1', preparation: 'cortado en rodajas finas'},
            {name: 'huevo', amount: '1', preparation: 'frito o pochado'},
            {name: 'sal marina', amount: 'al gusto'},
            {name: 'pimienta recién molida', amount: 'al gusto'},
            {name: 'hojuelas de chile', amount: '1 pizca', preparation: 'opcional'},
            {name: 'cilantro fresco', amount: '1 cucharada', preparation: 'picado'}
          ],
          instructions: [
            {text: 'Tuesta el pan integral hasta que esté crujiente.', hasImage: false},
            {text: 'Machaca el aguacate en un tazón pequeño y añade sal y pimienta al gusto.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d'},
            {text: 'Extiende la mezcla de aguacate sobre el pan tostado.', hasImage: false},
            {text: 'Añade las rodajas de tomate y el huevo por encima.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1603046891744-76e6300dd89f'},
            {text: 'Espolvorea con cilantro y hojuelas de chile si lo deseas.', hasImage: false}
          ]
        },
        '3': {
          ingredients: [
            {name: 'bayas mixtas congeladas', amount: '1 taza', preparation: 'arándanos, fresas, frambuesas'},
            {name: 'plátano', amount: '1', preparation: 'maduro, congelado en trozos'},
            {name: 'leche de almendras', amount: '1/2 taza'},
            {name: 'yogur de coco', amount: '1/4 taza', preparation: 'opcional'},
            {name: 'semillas de chía', amount: '1 cucharada'},
            {name: 'miel o sirope de agave', amount: '1 cucharadita', preparation: 'opcional'},
            {name: 'granola sin gluten', amount: '1/4 taza', preparation: 'para decorar'},
            {name: 'frutas frescas', amount: 'al gusto', preparation: 'para decorar'}
          ],
          instructions: [
            {text: 'En una licuadora, combina las bayas congeladas, el plátano, la leche de almendras, el yogur y las semillas de chía.', hasImage: false},
            {text: 'Licúa hasta obtener una mezcla espesa y suave. Añade más leche si es necesario.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7d3be1d'},
            {text: 'Prueba y añade miel o sirope si deseas más dulzor.', hasImage: false},
            {text: 'Sirve en un tazón y decora con granola y frutas frescas.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1586511934875-5c5411eebf79'}
          ]
        },
        '4': {
          ingredients: [
            {name: 'filetes de salmón', amount: '4', preparation: 'de 150g cada uno'},
            {name: 'aceite de oliva', amount: '2 cucharadas'},
            {name: 'limón', amount: '1', preparation: 'el jugo y la ralladura'},
            {name: 'dientes de ajo', amount: '2', preparation: 'finamente picados'},
            {name: 'eneldo fresco', amount: '2 cucharadas', preparation: 'picado'},
            {name: 'tomillo fresco', amount: '1 cucharada', preparation: 'picado'},
            {name: 'sal marina', amount: '1 cucharadita'},
            {name: 'pimienta negra', amount: '1/2 cucharadita', preparation: 'recién molida'}
          ],
          instructions: [
            {text: 'Precalienta la parrilla o sartén a fuego medio-alto.', hasImage: false},
            {text: 'En un tazón, mezcla el aceite, el jugo y ralladura de limón, el ajo, las hierbas, la sal y la pimienta.', hasImage: false},
            {text: 'Frota la mezcla sobre los filetes de salmón y déjalos marinar durante 10 minutos.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369'},
            {text: 'Cocina el salmón en la parrilla o sartén, con la piel hacia abajo primero, durante 4-5 minutos por cada lado.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927'},
            {text: 'Sirve inmediatamente con rodajas de limón adicionales.', hasImage: false}
          ]
        },
        '5': {
          ingredients: [
            {name: 'pimientos grandes', amount: '4', preparation: 'variados colores, cortados por la mitad'},
            {name: 'quinua', amount: '1 taza'},
            {name: 'caldo de verduras', amount: '2 tazas'},
            {name: 'cebolla', amount: '1', preparation: 'picada finamente'},
            {name: 'dientes de ajo', amount: '2', preparation: 'picados'},
            {name: 'calabacín', amount: '1', preparation: 'pequeño, cortado en cubos'},
            {name: 'maíz dulce', amount: '1/2 taza', preparation: 'fresco o congelado'},
            {name: 'queso rallado', amount: '1/2 taza', preparation: 'opcional'},
            {name: 'comino molido', amount: '1 cucharadita'},
            {name: 'pimentón', amount: '1 cucharadita'},
            {name: 'aceite de oliva', amount: '2 cucharadas'}
          ],
          instructions: [
            {text: 'Precalienta el horno a 180°C (350°F).', hasImage: false},
            {text: 'Limpia los pimientos, retirando las semillas y membranas.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1590165882377-8f3dae2921e9'},
            {text: 'Cocina la quinua en el caldo de verduras según las instrucciones del paquete.', hasImage: false},
            {text: 'En una sartén, calienta el aceite y saltea la cebolla y el ajo hasta que estén transparentes.', hasImage: false},
            {text: 'Añade el calabacín, el maíz, el comino y el pimentón y saltea por 5 minutos más.', hasImage: false},
            {text: 'Mezcla la quinua cocida con las verduras salteadas y añade la mitad del queso.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38'},
            {text: 'Rellena los pimientos con la mezcla y colócalos en una bandeja para horno.', hasImage: false},
            {text: 'Espolvorea el resto del queso por encima y hornea durante 25-30 minutos.', hasImage: false}
          ]
        },
        '6': {
          ingredients: [
            {name: 'lechuga mixta', amount: '4 tazas', preparation: 'lavada y secada'},
            {name: 'tomates cherry', amount: '1 taza', preparation: 'cortados por la mitad'},
            {name: 'pepino', amount: '1', preparation: 'cortado en rodajas finas'},
            {name: 'zanahoria', amount: '1', preparation: 'grande, rallada'},
            {name: 'aguacate', amount: '1', preparation: 'cortado en cubos'},
            {name: 'cebolla roja', amount: '1/4', preparation: 'en rodajas finas'},
            {name: 'aceite de oliva', amount: '3 cucharadas', preparation: 'extra virgen'},
            {name: 'vinagre balsámico', amount: '1 cucharada'},
            {name: 'mostaza Dijon', amount: '1 cucharadita'},
            {name: 'miel', amount: '1 cucharadita', preparation: 'opcional'},
            {name: 'sal y pimienta', amount: 'al gusto'}
          ],
          instructions: [
            {text: 'En un tazón grande, coloca la lechuga como base.', hasImage: false},
            {text: 'Añade los tomates, pepino, zanahoria, aguacate y cebolla.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999'},
            {text: 'En un tazón pequeño, mezcla el aceite, vinagre, mostaza, miel, sal y pimienta para hacer la vinagreta.', hasImage: false},
            {text: 'Vierte la vinagreta sobre la ensalada justo antes de servir.', hasImage: false},
            {text: 'Mezcla suavemente para que todos los ingredientes se cubran con la vinagreta.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af'}
          ]
        },
        '8': {
          ingredients: [
            {name: 'queso mascarpone', amount: '500g', preparation: 'a temperatura ambiente'},
            {name: 'huevos', amount: '6', preparation: 'separados en yemas y claras'},
            {name: 'azúcar', amount: '150g'},
            {name: 'café expreso', amount: '300ml', preparation: 'enfriado'},
            {name: 'bizcochos de soletilla', amount: '200g'},
            {name: 'cacao en polvo', amount: '50g', preparation: 'para espolvorear'},
            {name: 'licor de café (opcional)', amount: '2 cucharadas'}
          ],
          instructions: [
            {text: 'Batir las yemas con 100g de azúcar hasta blanquear.', hasImage: false},
            {text: 'Añadir el mascarpone y mezclar suavemente hasta obtener una crema homogénea.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9'},
            {text: 'Montar las claras a punto de nieve con el resto del azúcar.', hasImage: false},
            {text: 'Incorporar las claras a la mezcla de mascarpone con movimientos envolventes.', hasImage: false},
            {text: 'Mezclar el café con el licor si lo usas.', hasImage: false},
            {text: 'Mojar los bizcochos en el café y colocar una capa en el fondo de un recipiente.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1623421536546-42bd40f156cd'},
            {text: 'Cubrir con una capa de la crema de mascarpone.', hasImage: false},
            {text: 'Repetir el proceso terminando con una capa de crema.', hasImage: false},
            {text: 'Refrigerar durante al menos 4 horas, preferiblemente toda la noche.', hasImage: false},
            {text: 'Espolvorear con cacao en polvo antes de servir.', hasImage: false}
          ]
        },
        
        '9': {
          ingredients: [
            {name: 'aguacates maduros', amount: '3', preparation: 'pelados y sin hueso'},
            {name: 'cebolla roja', amount: '1/2', preparation: 'finamente picada'},
            {name: 'cilantro fresco', amount: '2 cucharadas', preparation: 'picado'},
            {name: 'limón', amount: '1', preparation: 'el jugo'},
            {name: 'tomate', amount: '1', preparation: 'sin semillas, picado'},
            {name: 'chile jalapeño', amount: '1', preparation: 'sin semillas, finamente picado'},
            {name: 'ajo', amount: '1 diente', preparation: 'machacado'},
            {name: 'sal', amount: 'al gusto'},
            {name: 'chips de tortilla', amount: 'para servir'}
          ],
          instructions: [
            {text: 'En un recipiente, machaca los aguacates con un tenedor hasta obtener la textura deseada.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7'},
            {text: 'Añade la cebolla, cilantro, jugo de limón, tomate, jalapeño y ajo.', hasImage: false},
            {text: 'Mezcla bien todos los ingredientes.', hasImage: false},
            {text: 'Sazona con sal al gusto.', hasImage: false},
            {text: 'Sirve inmediatamente con chips de tortilla o refrigera cubierto con film plástico (asegúrate de que el film toque la superficie del guacamole para evitar que se oxide).', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8'}
          ]
        },
        
        '10': {
          ingredients: [
            {name: 'plátano maduro', amount: '1', preparation: 'congelado en trozos'},
            {name: 'fresas', amount: '1 taza', preparation: 'frescas o congeladas'},
            {name: 'arándanos', amount: '1/2 taza', preparation: 'frescos o congelados'},
            {name: 'leche de almendras', amount: '1 taza', preparation: 'o cualquier leche de tu preferencia'},
            {name: 'yogur natural', amount: '1/4 taza', preparation: 'opcional'},
            {name: 'miel o sirope de agave', amount: '1 cucharada', preparation: 'opcional'},
            {name: 'semillas de chía', amount: '1 cucharadita', preparation: 'opcional'},
            {name: 'frutas frescas', amount: 'al gusto', preparation: 'para decorar'}
          ],
          instructions: [
            {text: 'Coloca todos los ingredientes en una licuadora de alta potencia.', hasImage: false},
            {text: 'Licúa hasta obtener una mezcla suave y cremosa.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4'},
            {text: 'Si está demasiado espeso, añade un poco más de leche.', hasImage: false},
            {text: 'Prueba y ajusta el dulzor si es necesario.', hasImage: false},
            {text: 'Sirve inmediatamente en un vaso alto.', hasImage: false},
            {text: 'Decora con frutas frescas y semillas de chía si lo deseas.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc'}
          ]
        }
      };
      
      // Combinar los datos específicos con la receta básica si existen
      if (specificRecipeData[recipeId]) {
        recipe = {
          ...recipe,
          ...specificRecipeData[recipeId]
        };
      }
      
      // Asegurarnos de que la receta tenga todos los campos necesarios
      const completeRecipe = {
        ...recipe,
        id: recipeId, // Asegurar que el ID esté correctamente establecido
        rating: recipe.rating || 4.5,
        reviews: recipe.reviews || Math.floor(Math.random() * 100) + 20,
        cookTime: recipe.cookTime || Math.floor(recipe.time * 0.7),
        prepTime: recipe.prepTime || Math.floor(recipe.time * 0.3),
        servings: recipe.servings || 2,
        calories: recipe.calories || Math.floor(Math.random() * 200) + 200,
        protein: recipe.protein || Math.floor(Math.random() * 20) + 10,
        carbs: recipe.carbs || Math.floor(Math.random() * 30) + 20,
        fat: recipe.fat || Math.floor(Math.random() * 15) + 5,
        // Garantizar que estos campos nunca estén vacíos (usar los datos específicos o valores predeterminados)
        ingredients: recipe.ingredients && recipe.ingredients.length > 0 
          ? recipe.ingredients 
          : [
              {name: 'Ingrediente principal', amount: '200 g', preparation: 'preparado'},
              {name: 'Ingrediente secundario', amount: '100 g', preparation: 'cortado finamente'},
              {name: 'Condimento', amount: '1 cucharada', preparation: 'al gusto'}
            ],
        instructions: recipe.instructions && recipe.instructions.length > 0
          ? recipe.instructions
          : [
              {text: `Paso 1: Preparar todos los ingredientes para ${recipe.title}.`, hasImage: false},
              {text: `Paso 2: Cocinar a temperatura media durante 15 minutos.`, hasImage: false},
              {text: `Paso 3: Servir y disfrutar.`, hasImage: false}
            ]
      };
      
      // Cache the result
      recipeCache[recipeId] = completeRecipe;
      
      // Retornar una copia profunda de la receta para evitar modificaciones accidentales
      return JSON.parse(JSON.stringify(completeRecipe));
      
    } catch (error) {
      // Usar el ID original que se pasó a la función en lugar de recipeId
      console.error(`Error fetching recipe with id ${id}:`, error);
      throw error;
    }
  },
  
  saveRecipe: async (recipeData) => {
    try {
      // For production:
      // const response = await api.post('/recipes', recipeData);
      // return response.data;
      return { ...recipeData, id: Date.now().toString() };
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  },
};

export const courseService = {
  getCourses: async () => {
    try {
      // Return mock data for now
      return mockCourses;
      // For production:
      // const response = await api.get('/courses');
      // return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },
};

// Mock data
const mockRecipes = [
  {
    id: '1',
    title: 'Tazón Mediterráneo',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    time: 25,
    rating: 4.8,
    reviews: 124,
    cookTime: 25,
    prepTime: 10,
    servings: 2,
    calories: 420,
    protein: 22,
    carbs: 48,
    fat: 18,
    author: {
      name: 'Chef María',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604',
    },
    tags: ['Saludable', 'Almuerzo', 'Vegetariano'],
    description: 'Este colorido cuenco mediterráneo está lleno de ingredientes nutritivos y sabores vibrantes. Perfecto para un almuerzo o cena saludable.',
    ingredients: [
      {name: 'quinoa cocida', amount: '1 taza'},
      {name: 'tomates cherry', amount: '1 taza', preparation: 'partidos por la mitad'},
      {name: 'pepino', amount: '1', preparation: 'cortado en cubos'},
      {name: 'aceitunas Kalamata', amount: '1/2 taza', preparation: 'sin hueso'},
      {name: 'queso feta', amount: '1/4 taza', preparation: 'desmenuzado'},
      {name: 'hummus', amount: '1/4 taza'},
      {name: 'aceite de oliva', amount: '2 cucharadas'},
      {name: 'jugo de limón', amount: '1 cucharada'},
      {name: 'orégano seco', amount: '1 cucharadita'},
      {name: 'sal y pimienta', amount: 'al gusto'},
      {name: 'perejil fresco', amount: '2 cucharadas', preparation: 'picado'},
    ],
    instructions: [
      {text: 'Cocina la quinoa según las instrucciones del paquete y déjala enfriar.', hasImage: false},
      {text: 'En un tazón grande, combina la quinoa enfriada, los tomates, el pepino y las aceitunas.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=1064&auto=format&fit=crop'},
      {text: 'En un tazón pequeño, mezcla el aceite de oliva, el jugo de limón, el orégano, la sal y la pimienta.', hasImage: false},
      {text: 'Vierte el aderezo sobre la ensalada y mezcla para combinar.', hasImage: false},
      {text: 'Divide la mezcla en tazones para servir.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1170&auto=format&fit=crop'},
      {text: 'Coloca una cucharada de hummus en cada tazón y espolvorea con queso feta.', hasImage: false},
      {text: 'Decora con perejil fresco antes de servir.', hasImage: false},
    ],
    comments: [
      {
        user: 'Carlos',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        text: 'Excelente receta, la preparé ayer y quedó deliciosa.',
        rating: 5,
        date: '2 días atrás'
      },
      {
        user: 'Laura',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        text: 'Muy rica pero le añadí un poco más de limón para darle más sabor.',
        rating: 4,
        date: '1 semana atrás'
      }
    ]
  },
  {
    id: '2',
    title: 'Tostada de Aguacate',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
    time: 10,
    rating: 4.5,
    reviews: 89,
    cookTime: 5,
    prepTime: 5,
    servings: 1,
    calories: 320,
    protein: 15,
    carbs: 30,
    fat: 16,
    author: {
      name: 'Carlos Gómez',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    },
    tags: ['Desayuno', 'Rápido', 'Vegetariano'],
    description: 'Una tostada de aguacate simple pero deliciosa, perfecta para comenzar el día con energía y nutrientes esenciales.',
    ingredients: [
      {name: 'pan integral', amount: '2 rebanadas'},
      {name: 'aguacate maduro', amount: '1'},
      {name: 'tomate', amount: '1', preparation: 'cortado en rodajas finas'},
      {name: 'huevo', amount: '1', preparation: 'frito o pochado'},
      {name: 'sal marina', amount: 'al gusto'},
      {name: 'pimienta recién molida', amount: 'al gusto'},
      {name: 'hojuelas de chile', amount: '1 pizca', preparation: 'opcional'},
      {name: 'cilantro fresco', amount: '1 cucharada', preparation: 'picado'},
      {name: 'jugo de limón', amount: '1 cucharadita'}
    ],
    instructions: [
      {text: 'Tuesta el pan integral hasta que esté crujiente.', hasImage: false},
      {text: 'Mientras tanto, corta el aguacate por la mitad, retira el hueso y saca la pulpa con una cuchara.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=1172&auto=format&fit=crop'},
      {text: 'En un tazón pequeño, machaca el aguacate con un tenedor, añade el jugo de limón, sal y pimienta al gusto.', hasImage: false},
      {text: 'Extiende la mezcla de aguacate sobre el pan tostado.', hasImage: false},
      {text: 'Coloca las rodajas de tomate encima del aguacate.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1603046891744-76e6300dd89f?q=80&w=987&auto=format&fit=crop'},
      {text: 'Fríe o pocha el huevo según tu preferencia y colócalo sobre la tostada.', hasImage: false},
      {text: 'Espolvorea con cilantro picado y hojuelas de chile si lo deseas.', hasImage: false}
    ],
    comments: [
      {
        user: 'Elena',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        text: 'Desayuno rápido y delicioso, me encanta con un poco de jugo de limón extra.',
        rating: 5,
        date: '3 días atrás'
      },
      {
        user: 'Miguel',
        avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
        text: 'La mejor combinación para empezar el día con energía.',
        rating: 4,
        date: '2 semanas atrás'
      }
    ]
  },
  {
    id: '3',
    title: 'Tazón de Batido de Bayas',
    imageUrl: 'https://images.unsplash.com/photo-1557837931-97fdbe7cb9a4',
    time: 15,
    rating: 4.7,
    reviews: 112,
    cookTime: 0,
    prepTime: 15,
    servings: 1,
    calories: 290,
    protein: 8,
    carbs: 45,
    fat: 9,
    author: {
      name: 'Ana Hernández',
      avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    },
    tags: ['Desayuno', 'Vegano', 'Sin Gluten'],
    description: 'Un refrescante tazón de batido lleno de antioxidantes y nutrientes esenciales. Perfecto para un desayuno refrescante o merienda saludable.',
    ingredients: [
      {name: 'bayas mixtas congeladas', amount: '1 taza', preparation: 'arándanos, fresas, frambuesas'},
      {name: 'plátano', amount: '1', preparation: 'maduro, congelado en trozos'},
      {name: 'leche de almendras', amount: '1/2 taza'},
      {name: 'yogur de coco', amount: '1/4 taza', preparation: 'opcional'},
      {name: 'semillas de chía', amount: '1 cucharada'},
      {name: 'miel o sirope de agave', amount: '1 cucharadita', preparation: 'opcional'},
      {name: 'Para decorar:', amount: ''},
      {name: 'granola sin gluten', amount: '1/4 taza'},
      {name: 'bayas frescas', amount: '1/4 taza'},
      {name: 'coco rallado', amount: '1 cucharada'},
      {name: 'mantequilla de almendras', amount: '1 cucharadita'}
    ],
    instructions: [
      {text: 'En una licuadora, combina las bayas congeladas, el plátano, la leche de almendras, el yogur de coco (si lo usas) y las semillas de chía.', hasImage: false},
      {text: 'Licúa hasta obtener una mezcla espesa y suave. Si está demasiado espeso, añade un poco más de leche de almendras.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7d3be1d?q=80&w=1036&auto=format&fit=crop'},
      {text: 'Prueba y añade el endulzante si lo deseas.', hasImage: false},
      {text: 'Vierte la mezcla en un tazón.', hasImage: false},
      {text: 'Decora con granola, bayas frescas, coco rallado y una cucharadita de mantequilla de almendras.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1586511934875-5c5411eebf79?q=80&w=1074&auto=format&fit=crop'},
      {text: 'Sirve inmediatamente y disfruta con cuchara.', hasImage: false}
    ],
    comments: [
      {
        user: 'Patricia',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        text: 'Delicioso y muy nutritivo, lo preparo casi todos los días.',
        rating: 5,
        date: '5 días atrás'
      },
      {
        user: 'Roberto',
        avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
        text: 'Me encanta la combinación con la mantequilla de almendras.',
        rating: 5,
        date: '2 semanas atrás'
      }
    ]
  },
  {
    id: '4',
    title: 'Salmón a la Parrilla con Hierbas',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    time: 30,
    rating: 4.9,
    reviews: 156,
    cookTime: 20,
    prepTime: 10,
    servings: 4,
    calories: 380,
    protein: 32,
    carbs: 5,
    fat: 24,
    author: {
      name: 'Chef Roberto',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    tags: ['Cena', 'Proteína', 'Pescado'],
    description: 'Delicioso salmón a la parrilla con un toque de hierbas frescas y limón. Una cena saludable y llena de sabor que se prepara en minutos.',
    ingredients: [
      {name: 'filetes de salmón', amount: '4', preparation: 'de aproximadamente 150g cada uno'},
      {name: 'aceite de oliva', amount: '2 cucharadas'},
      {name: 'limón', amount: '1', preparation: 'la mitad en jugo, la mitad en rodajas'},
      {name: 'diente de ajo', amount: '2', preparation: 'finamente picados'},
      {name: 'eneldo fresco', amount: '2 cucharadas', preparation: 'picado'},
      {name: 'tomillo fresco', amount: '1 cucharada', preparation: 'picado'},
      {name: 'perejil fresco', amount: '1 cucharada', preparation: 'picado'},
      {name: 'sal marina', amount: '1 cucharadita'},
      {name: 'pimienta negra', amount: '1/2 cucharadita', preparation: 'recién molida'},
      {name: 'mantequilla', amount: '2 cucharadas', preparation: 'opcional'}
    ],
    instructions: [
      {text: 'Precalienta la parrilla o sartén a fuego medio-alto.', hasImage: false},
      {text: 'En un tazón pequeño, mezcla el aceite de oliva, el jugo de limón, el ajo picado, el eneldo, el tomillo, el perejil, la sal y la pimienta.', hasImage: false},
      {text: 'Coloca los filetes de salmón en una bandeja, con la piel hacia abajo si la tienen.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=1170&auto=format&fit=crop'},
      {text: 'Unta la mezcla de hierbas sobre los filetes de salmón, cubriendo toda la superficie.', hasImage: false},
      {text: 'Deja marinar durante 5-10 minutos.', hasImage: false},
      {text: 'Coloca los filetes en la parrilla o sartén caliente, primero con la piel hacia abajo si tienen.', hasImage: false},
      {text: 'Cocina durante 4-5 minutos por cada lado, dependiendo del grosor del filete.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=1164&auto=format&fit=crop'},
      {text: 'Si lo deseas, añade un poco de mantequilla durante los últimos minutos de cocción.', hasImage: false},
      {text: 'Sirve inmediatamente con rodajas de limón.', hasImage: false}
    ],
    comments: [
      {
        user: 'Javier',
        avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
        text: 'Receta excelente, el salmón quedó jugoso y lleno de sabor.',
        rating: 5,
        date: '1 día atrás'
      },
      {
        user: 'Sofía',
        avatar: 'https://randomuser.me/api/portraits/women/19.jpg',
        text: 'Muy buena receta, aunque reduje un poco el ajo para mi gusto.',
        rating: 4,
        date: '1 semana atrás'
      },
      {
        user: 'Alejandro',
        avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
        text: 'La mejor receta de salmón que he probado, la hago regularmente.',
        rating: 5,
        date: '2 semanas atrás'
      }
    ]
  },
  {
    id: '5',
    title: 'Pimientos Rellenos de Quinua',
    imageUrl: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9',
    time: 45,
    rating: 4.6,
    reviews: 78,
    cookTime: 35,
    prepTime: 10,
    servings: 4,
    calories: 310,
    protein: 12,
    carbs: 42,
    fat: 10,
    author: {
      name: 'Laura Martínez',
      avatar: 'https://randomuser.me/api/portraits/women/37.jpg',
    },
    tags: ['Cena', 'Vegetariano', 'Sin Gluten'],
    description: 'Pimientos coloridos rellenos de una sabrosa mezcla de quinua, vegetales y queso. Un plato vegetariano completo, nutritivo y muy satisfactorio.',
    ingredients: [
      {name: 'pimientos grandes', amount: '4', preparation: 'variados colores'},
      {name: 'quinua', amount: '1 taza'},
      {name: 'caldo de verduras', amount: '2 tazas'},
      {name: 'cebolla', amount: '1', preparation: 'picada finamente'},
      {name: 'diente de ajo', amount: '2', preparation: 'picados'},
      {name: 'tomate', amount: '2', preparation: 'sin semillas, picados'},
      {name: 'calabacín', amount: '1', preparation: 'pequeño, cortado en cubos'},
      {name: 'maíz dulce', amount: '1/2 taza', preparation: 'fresco o congelado'},
      {name: 'queso mozzarella rallado', amount: '1/2 taza', preparation: 'o queso vegano'},
      {name: 'aceite de oliva', amount: '2 cucharadas'},
      {name: 'comino molido', amount: '1 cucharadita'},
      {name: 'pimentón ahumado', amount: '1/2 cucharadita'},
      {name: 'sal y pimienta', amount: 'al gusto'},
      {name: 'perejil fresco', amount: '2 cucharadas', preparation: 'picado, para decorar'}
    ],
    instructions: [
      {text: 'Precalienta el horno a 180°C (350°F).', hasImage: false},
      {text: 'Lava los pimientos, córtalos por la mitad longitudinalmente y retira las semillas y membranas blancas.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1590165882377-8f3dae2921e9?q=80&w=987&auto=format&fit=crop'},
      {text: 'Enjuaga la quinua y cocínala en el caldo de verduras según las instrucciones del paquete, generalmente 15-20 minutos hasta que esté tierna.', hasImage: false},
      {text: 'Mientras tanto, en una sartén grande, calienta el aceite de oliva a fuego medio y saltea la cebolla hasta que esté translúcida.', hasImage: false},
      {text: 'Añade el ajo y cocina por un minuto más.', hasImage: false},
      {text: 'Agrega el calabacín y cocina por 3-4 minutos hasta que empiece a ablandarse.', hasImage: false},
      {text: 'Incorpora el tomate, maíz, comino, pimentón, sal y pimienta, y cocina por 5 minutos más.', hasImage: false},
      {text: 'Mezcla la quinua cocida con los vegetales salteados y la mitad del queso.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?q=80&w=1064&auto=format&fit=crop'},
      {text: 'Rellena cada mitad de pimiento con la mezcla de quinua.', hasImage: false},
      {text: 'Coloca los pimientos en una bandeja para hornear y espolvorea el resto del queso por encima.', hasImage: false},
      {text: 'Hornea durante 20-25 minutos hasta que los pimientos estén tiernos y el queso esté dorado.', hasImage: false},
      {text: 'Sirve caliente, decorado con perejil fresco picado.', hasImage: false}
    ],
    comments: [
      {
        user: 'Isabel',
        avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
        text: 'Receta deliciosa e ideal para toda la familia, incluso a mis hijos les encantó.',
        rating: 5,
        date: '3 días atrás'
      },
      {
        user: 'Fernando',
        avatar: 'https://randomuser.me/api/portraits/men/17.jpg',
        text: 'Excelente opción vegetariana, muy sabrosa y nutritiva.',
        rating: 4,
        date: '2 semanas atrás'
      }
    ]
  },
  {
    id: '6',
    title: 'Ensalada de Verduras Frescas',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    time: 15,
    rating: 4.3,
    reviews: 65,
    cookTime: 0,
    prepTime: 15,
    servings: 2,
    calories: 220,
    protein: 5,
    carbs: 25,
    fat: 12,
    author: {
      name: 'Chef María',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604',
    },
    tags: ['Almuerzo', 'Vegano', 'Rápido'],
    description: 'Una colorida y refrescante ensalada llena de vegetales frescos y crujientes. Perfecta como guarnición o como comida ligera.',
    ingredients: [
      {name: 'lechuga mixta', amount: '4 tazas', preparation: 'lavada y secada'},
      {name: 'tomates cherry', amount: '1 taza', preparation: 'cortados por la mitad'},
      {name: 'pepino', amount: '1', preparation: 'en rodajas finas'},
      {name: 'zanahoria', amount: '1', preparation: 'grande, rallada'},
      {name: 'aguacate', amount: '1', preparation: 'en cubos'},
      {name: 'cebolla roja', amount: '1/4', preparation: 'en rodajas finas'},
      {name: 'pimiento rojo', amount: '1/2', preparation: 'en tiras finas'},
      {name: 'nueces', amount: '1/4 taza', preparation: 'opcional'},
      {name: 'Para la vinagreta:', amount: ''},
      {name: 'aceite de oliva', amount: '3 cucharadas', preparation: 'extra virgen'},
      {name: 'vinagre balsámico', amount: '1 cucharada'},
      {name: 'jugo de limón', amount: '1 cucharada'},
      {name: 'mostaza Dijon', amount: '1 cucharadita'},
      {name: 'miel o jarabe de arce', amount: '1 cucharadita', preparation: 'opcional'},
      {name: 'sal y pimienta', amount: 'al gusto'}
    ],
    instructions: [
      {text: 'En un tazón grande, coloca la lechuga como base.', hasImage: false},
      {text: 'Añade los tomates cherry, las rodajas de pepino, la zanahoria rallada, los cubos de aguacate, la cebolla roja y el pimiento rojo.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=984&auto=format&fit=crop'},
      {text: 'En un tazón pequeño, mezcla el aceite de oliva, el vinagre balsámico, el jugo de limón, la mostaza, la miel (si la usas), la sal y la pimienta para hacer la vinagreta.', hasImage: false},
      {text: 'Vierte la vinagreta sobre la ensalada justo antes de servir.', hasImage: false},
      {text: 'Mezcla suavemente para que todos los ingredientes queden cubiertos con la vinagreta.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=987&auto=format&fit=crop'},
      {text: 'Espolvorea las nueces por encima si las estás usando.', hasImage: false},
      {text: 'Sirve inmediatamente para disfrutar de la máxima frescura y crujiente.', hasImage: false}
    ],
    comments: [
      {
        user: 'Diana',
        avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
        text: 'Receta sencilla pero muy sabrosa, la vinagreta es perfecta.',
        rating: 4,
        date: '4 días atrás'
      },
      {
        user: 'Arturo',
        avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
        text: 'Me encantó, la hago frecuentemente para acompañar mis comidas.',
        rating: 5,
        date: '3 semanas atrás'
      }
    ]
  },
  {
    id: '8',
    title: 'Tiramisu Clásico',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    time: 240,
    rating: 4.8,
    reviews: 95,
    cookTime: 30,
    prepTime: 30,
    servings: 8,
    calories: 350,
    protein: 7,
    carbs: 25,
    fat: 24,
    author: {
      name: 'Chef Isabella',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    },
    tags: ['Postres', 'Italiano', 'Dulce'],
    description: 'El auténtico tiramisú italiano, una delicia cremosa con capas de bizcochos empapados en café y una suave crema de mascarpone.',
    ingredients: [
      {name: 'queso mascarpone', amount: '500g', preparation: 'a temperatura ambiente'},
      {name: 'huevos', amount: '6', preparation: 'separados en yemas y claras'},
      {name: 'azúcar', amount: '150g'},
      {name: 'café expreso', amount: '300ml', preparation: 'enfriado'},
      {name: 'bizcochos de soletilla', amount: '200g'},
      {name: 'cacao en polvo', amount: '50g', preparation: 'para espolvorear'},
      {name: 'licor de café (opcional)', amount: '2 cucharadas'}
    ],
    instructions: [
      {text: 'Batir las yemas con 100g de azúcar hasta blanquear.', hasImage: false},
      {text: 'Añadir el mascarpone y mezclar suavemente hasta obtener una crema homogénea.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9'},
      {text: 'Montar las claras a punto de nieve con el resto del azúcar.', hasImage: false},
      {text: 'Incorporar las claras a la mezcla de mascarpone con movimientos envolventes.', hasImage: false},
      {text: 'Mezclar el café con el licor si lo usas.', hasImage: false},
      {text: 'Mojar los bizcochos en el café y colocar una capa en el fondo de un recipiente.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1623421536546-42bd40f156cd'},
      {text: 'Cubrir con una capa de la crema de mascarpone.', hasImage: false},
      {text: 'Repetir el proceso terminando con una capa de crema.', hasImage: false},
      {text: 'Refrigerar durante al menos 4 horas, preferiblemente toda la noche.', hasImage: false},
      {text: 'Espolvorear con cacao en polvo antes de servir.', hasImage: false}
    ],
    comments: [
      {
        user: 'Carmen',
        avatar: 'https://randomuser.me/api/portraits/women/61.jpg',
        text: 'Un postre delicioso, ¡me quedó espectacular! Lo recomiendo totalmente.',
        rating: 5,
        date: '1 semana atrás'
      },
      {
        user: 'Raúl',
        avatar: 'https://randomuser.me/api/portraits/men/37.jpg',
        text: 'Muy buena receta, aunque es un poco laboriosa. Vale la pena el esfuerzo.',
        rating: 4,
        date: '3 semanas atrás'
      }
    ]
  },
  {
    id: '9',
    title: 'Guacamole Casero',
    imageUrl: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8',
    time: 15,
    rating: 4.7,
    reviews: 86,
    cookTime: 0,
    prepTime: 15,
    servings: 4,
    calories: 120,
    protein: 2,
    carbs: 10,
    fat: 9,
    author: {
      name: 'Chef Alejandro',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    },
    tags: ['Aperitivos', 'Mexicano', 'Rápido'],
    description: 'Un clásico mexicano perfecto para compartir. Este guacamole fresco y cremoso es ideal como aperitivo con totopos o como acompañamiento para tus platos favoritos.',
    ingredients: [
      {name: 'aguacates maduros', amount: '3', preparation: 'pelados y sin hueso'},
      {name: 'cebolla roja', amount: '1/2', preparation: 'finamente picada'},
      {name: 'cilantro fresco', amount: '2 cucharadas', preparation: 'picado'},
      {name: 'limón', amount: '1', preparation: 'el jugo'},
      {name: 'tomate', amount: '1', preparation: 'sin semillas, picado'},
      {name: 'chile jalapeño', amount: '1', preparation: 'sin semillas, finamente picado'},
      {name: 'ajo', amount: '1 diente', preparation: 'machacado'},
      {name: 'sal', amount: 'al gusto'},
      {name: 'chips de tortilla', amount: 'para servir'}
    ],
    instructions: [
      {text: 'En un recipiente, machaca los aguacates con un tenedor hasta obtener la textura deseada.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7'},
      {text: 'Añade la cebolla, cilantro, jugo de limón, tomate, jalapeño y ajo.', hasImage: false},
      {text: 'Mezcla bien todos los ingredientes.', hasImage: false},
      {text: 'Sazona con sal al gusto.', hasImage: false},
      {text: 'Sirve inmediatamente con chips de tortilla o refrigera cubierto con film plástico (asegúrate de que el film toque la superficie del guacamole para evitar que se oxide).', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8'}
    ],
    comments: [
      {
        user: 'Luisa',
        avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
        text: 'Delicioso y fácil de preparar, lo hago siempre que tengo invitados.',
        rating: 5,
        date: '2 días atrás'
      },
      {
        user: 'Manuel',
        avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
        text: 'Muy bueno, le añadí un poco más de chile para darle más picante.',
        rating: 4,
        date: '1 semana atrás'
      }
    ]
  },
  {
    id: '10',
    title: 'Smoothie de Frutas',
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4',
    time: 10,
    rating: 4.6,
    reviews: 73,
    cookTime: 0,
    prepTime: 10,
    servings: 2,
    calories: 180,
    protein: 4,
    carbs: 35,
    fat: 2,
    author: {
      name: 'Nutricionista Sara',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
    tags: ['Bebidas', 'Desayuno', 'Saludable'],
    description: 'Un smoothie refrescante y nutritivo, perfecto para comenzar el día con energía o como merienda saludable. Rico en vitaminas, minerales y antioxidantes.',
    ingredients: [
      {name: 'plátano maduro', amount: '1', preparation: 'congelado en trozos'},
      {name: 'fresas', amount: '1 taza', preparation: 'frescas o congeladas'},
      {name: 'arándanos', amount: '1/2 taza', preparation: 'frescos o congelados'},
      {name: 'leche de almendras', amount: '1 taza', preparation: 'o cualquier leche de tu preferencia'},
      {name: 'yogur natural', amount: '1/4 taza', preparation: 'opcional'},
      {name: 'miel o sirope de agave', amount: '1 cucharada', preparation: 'opcional'},
      {name: 'semillas de chía', amount: '1 cucharadita', preparation: 'opcional'},
      {name: 'frutas frescas', amount: 'al gusto', preparation: 'para decorar'}
    ],
    instructions: [
      {text: 'Coloca todos los ingredientes en una licuadora de alta potencia.', hasImage: false},
      {text: 'Licúa hasta obtener una mezcla suave y cremosa.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4'},
      {text: 'Si está demasiado espeso, añade un poco más de leche.', hasImage: false},
      {text: 'Prueba y ajusta el dulzor si es necesario.', hasImage: false},
      {text: 'Sirve inmediatamente en un vaso alto.', hasImage: false},
      {text: 'Decora con frutas frescas y semillas de chía si lo deseas.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc'}
    ],
    comments: [
      {
        user: 'Julia',
        avatar: 'https://randomuser.me/api/portraits/women/48.jpg',
        text: 'Delicioso y muy fácil de preparar. Lo hago todas las mañanas.',
        rating: 5,
        date: '3 días atrás'
      },
      {
        user: 'Daniel',
        avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
        text: 'Buena receta base, yo le añado espinacas para hacerlo más nutritivo.',
        rating: 4,
        date: '2 semanas atrás'
      }
    ]
  }
];

const mockCourses = [
  {
    id: '1',
    title: 'Italian Cuisine Basics',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
    level: 'Beginner',
    description: 'Learn the fundamentals of Italian cooking from authentic pasta to classic sauces.',
    instructor: {
      name: 'Chef Marco',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    },
    price: 49.99,
  },
  {
    id: '2',
    title: 'Plant-Based Cooking',
    imageUrl: 'https://images.unsplash.com/photo-1516685018646-549198525c1b',
    level: 'All Levels',
    description: 'Master the art of creating delicious and nutritious plant-based meals.',
    instructor: {
      name: 'Chef Sarah',
      avatar: 'https://images.unsplash.com/photo-1611432579699-484f7990b127',
    },
    price: 39.99,
  },
];

export default api;