import {
    RECIPES_LOADING,
    RECIPES_SUCCESS,
    RECIPES_ERROR,
    RECIPE_DETAIL_LOADING,
    RECIPE_DETAIL_SUCCESS,
    RECIPE_DETAIL_ERROR,
    SAVE_RECIPE_SUCCESS,
    TOGGLE_FAVORITE
  } from '../actions/recipeActions';
  
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
        
        return {
          ...state,
          favorites: isFavorite 
            ? state.favorites.filter(id => id !== recipeId)
            : [...state.favorites, recipeId]
        };
      }
        
      default:
        return state;
    }
  }