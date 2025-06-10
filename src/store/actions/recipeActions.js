import { recipeService } from '../../services/api';
import { loadFavoritesFromStorage } from '../reducers/recipeReducer';
import { Alert } from 'react-native';

// Action Types
export const RECIPES_LOADING = 'RECIPES_LOADING';
export const RECIPES_SUCCESS = 'RECIPES_SUCCESS';
export const RECIPES_ERROR = 'RECIPES_ERROR';
export const RECIPE_DETAIL_LOADING = 'RECIPE_DETAIL_LOADING';
export const RECIPE_DETAIL_SUCCESS = 'RECIPE_DETAIL_SUCCESS';
export const RECIPE_DETAIL_ERROR = 'RECIPE_DETAIL_ERROR';
export const SAVE_RECIPE_SUCCESS = 'SAVE_RECIPE_SUCCESS';
export const TOGGLE_FAVORITE = 'TOGGLE_FAVORITE';
export const LOAD_FAVORITES_SUCCESS = 'LOAD_FAVORITES_SUCCESS';

// Action Creators
export const fetchRecipes = () => async (dispatch) => {
  dispatch({ type: RECIPES_LOADING });
  
  try {
    const recipes = await recipeService.getRecipes();
    dispatch({
      type: RECIPES_SUCCESS,
      payload: recipes
    });
    return recipes;
  } catch (error) {
    dispatch({
      type: RECIPES_ERROR,
      payload: error.message || 'Failed to fetch recipes'
    });
    throw error;
  }
};

export const fetchRecipeById = (recipeId) => async (dispatch) => {
  dispatch({ type: RECIPE_DETAIL_LOADING });
  
  try {
    const recipe = await recipeService.getRecipeById(recipeId);
    dispatch({
      type: RECIPE_DETAIL_SUCCESS,
      payload: recipe
    });
    return recipe;
  } catch (error) {
    dispatch({
      type: RECIPE_DETAIL_ERROR,
      payload: error.message || 'Failed to fetch recipe details'
    });
    throw error;
  }
};

export const saveRecipe = (recipeData) => async (dispatch) => {
  try {
    const savedRecipe = await recipeService.saveRecipe(recipeData);
    dispatch({
      type: SAVE_RECIPE_SUCCESS,
      payload: savedRecipe
    });
    return savedRecipe;
  } catch (error) {
    console.error('Save recipe error:', error);
    throw error;
  }
};

export const toggleFavorite = (recipeId) => async (dispatch, getState) => {
  try {
    const { api } = await import('../../services/api');
    const isFavorite = getState().recipes.favorites.includes(recipeId);
    
    if (isFavorite) {
      await api.recipeList.remove(recipeId);
    } else {
      await api.recipeList.addById(recipeId);
    }
    
    dispatch({
      type: TOGGLE_FAVORITE,
      payload: recipeId
    });

    Alert.alert(
      'Éxito',
      isFavorite ? 'Receta removida de favoritos' : 'Receta agregada a favoritos'
    );
  } catch (error) {
    console.error('Error al cambiar favorito:', error);
    Alert.alert(
      'Error',
      'No se pudo actualizar la lista de favoritos. Por favor, intenta nuevamente.'
    );
    throw error;
  }
};

export const loadFavorites = () => async (dispatch) => {
  try {
    const favorites = await loadFavoritesFromStorage();
    dispatch({
      type: LOAD_FAVORITES_SUCCESS,
      payload: favorites
    });
    return favorites;
  } catch (error) {
    console.error('Load favorites error:', error);
    return [];
  }
};