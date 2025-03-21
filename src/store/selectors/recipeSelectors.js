export const selectAllRecipes = state => state.recipes.recipes;
export const selectCurrentRecipe = state => state.recipes.currentRecipe;
export const selectFavorites = state => state.recipes.favorites;
export const selectRecipeLoading = state => state.recipes.loading;
export const selectRecipeError = state => state.recipes.error;

export const selectFavoriteRecipes = state => {
  const { recipes, favorites } = state.recipes;
  return recipes.filter(recipe => favorites.includes(recipe.id));
};

export const selectRecipeById = (state, recipeId) => {
  return state.recipes.recipes.find(recipe => recipe.id === recipeId);
};

export const selectIsFavorite = (state, recipeId) => {
  return state.recipes.favorites.includes(recipeId);
};