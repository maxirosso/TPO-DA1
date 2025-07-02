import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    RECIPES_LOADING,
    RECIPES_SUCCESS,
    RECIPES_ERROR,
    RECIPE_DETAIL_LOADING,
    RECIPE_DETAIL_SUCCESS,
    RECIPE_DETAIL_ERROR,
    SAVE_RECIPE_SUCCESS,
    TOGGLE_FAVORITE,
    LOAD_FAVORITES_SUCCESS
  } from '../actions/recipeActions';

  const FAVORITES_STORAGE_KEY = '@favorites';

  const saveFavoritesToStorage = async (favorites) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error al guardar los favoritos en el almacenamiento:', error);
    }
  };

  export const loadFavoritesFromStorage = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error al cargar los favoritos en el almacenamiento:', error);
      return [];
    }
  };
  
  const initialState = {
    recipes: [],
    currentRecipe: null,
    favorites: [],
    loading: false,
    error: null
  };
  
  export default function recipeReducer(state = initialState, action) {
    switch (action.type) {
      case RECIPES_LOADING:
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case RECIPES_SUCCESS:
        return {
          ...state,
          recipes: action.payload,
          loading: false,
          error: null
        };
        
      case RECIPES_ERROR:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
        
      case RECIPE_DETAIL_LOADING:
        return {
          ...state,
          loading: true,
          error: null
        };
        
      case RECIPE_DETAIL_SUCCESS:
        return {
          ...state,
          currentRecipe: action.payload,
          loading: false,
          error: null
        };
        
      case RECIPE_DETAIL_ERROR:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
        
      case SAVE_RECIPE_SUCCESS:
        return {
          ...state,
          recipes: [action.payload, ...state.recipes],
          currentRecipe: action.payload
        };
        
      case TOGGLE_FAVORITE: {
        const recipeId = action.payload;
        const isFavorite = state.favorites.includes(recipeId);
        
        const newFavorites = isFavorite 
          ? state.favorites.filter(id => id !== recipeId)
          : [...state.favorites, recipeId];

        saveFavoritesToStorage(newFavorites);
        
        return {
          ...state,
          favorites: newFavorites
        };
      }

      case LOAD_FAVORITES_SUCCESS:
        return {
          ...state,
          favorites: action.payload
        };
        
      default:
        return state;
    }
  }