import axios from 'axios';

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
      // For development, return mock data
      return mockRecipes.find(recipe => recipe.id === id);
      // For production:
      // const response = await api.get(`/recipes/${id}`);
      // return response.data;
    } catch (error) {
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
    title: 'Mediterranean Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    time: 25,
    tags: ['Healthy', 'Lunch'],
    description: 'A nutritious Mediterranean bowl with fresh ingredients.',
    ingredients: [
      '1 cup cooked quinoa',
      '1/2 cup cherry tomatoes, halved',
      '1/2 cucumber, diced',
      '1/4 cup Kalamata olives',
      '1/4 cup feta cheese',
      '2 tbsp olive oil',
      '1 tbsp lemon juice',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Prepare quinoa according to package instructions.',
      'Combine all ingredients in a bowl.',
      'Drizzle with olive oil and lemon juice.',
      'Season with salt and pepper to taste.',
    ],
  },
  {
    id: '2',
    title: 'Avocado Toast',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
    time: 10,
    tags: ['Breakfast', 'Quick'],
    description: 'Simple and delicious avocado toast with minimal ingredients.',
    ingredients: [
      '2 slices whole grain bread',
      '1 ripe avocado',
      'Salt and pepper to taste',
      'Red pepper flakes (optional)',
      'Lemon juice (optional)',
    ],
    instructions: [
      'Toast bread to desired crispness.',
      'Mash avocado in a bowl.',
      'Spread avocado on toast.',
      'Season with salt, pepper, and optional toppings.',
    ],
  },
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