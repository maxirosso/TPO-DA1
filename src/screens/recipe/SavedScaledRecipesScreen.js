import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

// Mock data for saved scaled recipes
const mockSavedRecipes = [
  {
    id: '1',
    originalId: '101',
    title: 'Tazón Mediterráneo (x3)',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    scaleFactor: 3,
    servings: 6,
    savedDate: '2023-11-10T15:30:00',
    ingredients: [
      { name: 'quinoa cocida', originalAmount: '1 taza', scaledAmount: '3 tazas' },
      { name: 'tomates cherry', originalAmount: '1 taza', scaledAmount: '3 tazas' },
      { name: 'pepino', originalAmount: '1', scaledAmount: '3' },
      { name: 'aceitunas Kalamata', originalAmount: '1/2 taza', scaledAmount: '1 1/2 tazas' },
      { name: 'queso feta', originalAmount: '1/4 taza', scaledAmount: '3/4 taza' },
    ],
    scalingType: 'portion', // 'portion' or 'ingredient'
  },
  {
    id: '2',
    originalId: '102',
    title: 'Galletas de Chocolate (1/2)',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6598fdd9d6ec',
    scaleFactor: 0.5,
    servings: 12,
    savedDate: '2023-11-08T10:15:00',
    ingredients: [
      { name: 'harina', originalAmount: '2 tazas', scaledAmount: '1 taza' },
      { name: 'azúcar', originalAmount: '1 taza', scaledAmount: '1/2 taza' },
      { name: 'mantequilla', originalAmount: '200g', scaledAmount: '100g' },
      { name: 'huevos', originalAmount: '2', scaledAmount: '1' },
      { name: 'chips de chocolate', originalAmount: '1 taza', scaledAmount: '1/2 taza' },
    ],
    scalingType: 'portion',
  },
  {
    id: '3',
    originalId: '103',
    title: 'Sopa de Tomate (x4)',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554',
    scaleFactor: 4,
    servings: 8,
    savedDate: '2023-11-05T18:45:00',
    ingredients: [
      { name: 'tomates', originalAmount: '500g', scaledAmount: '2kg' },
      { name: 'cebolla', originalAmount: '1', scaledAmount: '4' },
      { name: 'ajo', originalAmount: '2 dientes', scaledAmount: '8 dientes' },
      { name: 'caldo de verduras', originalAmount: '2 tazas', scaledAmount: '8 tazas' },
      { name: 'aceite de oliva', originalAmount: '2 cucharadas', scaledAmount: '8 cucharadas' },
    ],
    scalingType: 'portion',
  },
  {
    id: '4',
    originalId: '104',
    title: 'Ensalada de Pollo (basada en 500g de pollo)',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    scaleFactor: 1.25,
    servings: 5,
    savedDate: '2023-11-01T12:30:00',
    ingredients: [
      { name: 'pollo a la parrilla', originalAmount: '400g', scaledAmount: '500g' },
      { name: 'lechuga', originalAmount: '1 cabeza', scaledAmount: '1 1/4 cabeza' },
      { name: 'tomates', originalAmount: '2', scaledAmount: '2.5' },
      { name: 'pepinos', originalAmount: '1', scaledAmount: '1.25' },
      { name: 'aderezo', originalAmount: '1/4 taza', scaledAmount: '0.3 taza' },
    ],
    scalingType: 'ingredient',
    baseIngredient: 'pollo a la parrilla',
    baseIngredientAmount: '500g',
  },
];

const SavedScaledRecipesScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState(mockSavedRecipes);

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { 
      recipe: {
        id: recipe.originalId,
        title: recipe.title.split(' (')[0], // Remove scaling info from title
        imageUrl: recipe.imageUrl,
        // Other properties would be here in a real app
      },
      scaledRecipe: recipe,
    });
  };

  const handleDeleteRecipe = (recipeId) => {
    Alert.alert(
      'Eliminar Receta',
      '¿Estás seguro de que deseas eliminar esta receta escalada?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // Remove the recipe from state
            setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.recipeImage}
        resizeMode="cover"
      />
      
      <View style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteRecipe(item.id)}
          >
            <Icon name="trash-2" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.recipeInfo}>
          <View style={styles.infoItem}>
            <Icon name="users" size={14} color={Colors.textMedium} />
            <Text style={styles.infoText}>{item.servings} porciones</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Icon name="calendar" size={14} color={Colors.textMedium} />
            <Text style={styles.infoText}>Guardada el {formatDate(item.savedDate)}</Text>
          </View>
        </View>
        
        <View style={styles.scalingInfoContainer}>
          <View style={styles.scalingBadge}>
            <Text style={styles.scalingBadgeText}>
              {item.scalingType === 'portion'
                ? `Escalado ${item.scaleFactor}x`
                : `Basado en ${item.baseIngredientAmount} de ${item.baseIngredient}`}
            </Text>
          </View>
        </View>
        
        <Text style={styles.ingredientsLabel}>Ingredientes Escalados:</Text>
        
        {item.ingredients.slice(0, 3).map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{ingredient.name}:</Text>
            <Text style={styles.ingredientAmount}>{ingredient.scaledAmount}</Text>
          </View>
        ))}
        
        {item.ingredients.length > 3 && (
          <Text style={styles.moreIngredientsText}>
            +{item.ingredients.length - 3} más...
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recetas Escaladas</Text>
        </View>
        
        <View style={styles.headerDescription}>
          <Text style={styles.descriptionText}>
            Tus recetas personalizadas con cantidades ajustadas (máximo 10)
          </Text>
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{recipes.length}/10</Text>
          </View>
        </View>
      </LinearGradient>
      
      <FlatList
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recipesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="file" size={60} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>
              No tienes recetas escaladas guardadas
            </Text>
            <Text style={styles.emptyText}>
              Al escalar una receta, usa la opción "Guardar" para almacenarla aquí.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingBottom: Metrics.mediumSpacing,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Metrics.mediumSpacing,
  },
  backButton: {
    marginRight: Metrics.baseSpacing,
  },
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  headerDescription: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    flex: 1,
  },
  countContainer: {
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Metrics.roundedFull,
  },
  countText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.card,
  },
  recipesList: {
    padding: Metrics.mediumSpacing,
    paddingBottom: Metrics.xxLargeSpacing,
  },
  recipeCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    overflow: 'hidden',
    marginBottom: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeImage: {
    width: '100%',
    height: 140,
  },
  recipeContent: {
    padding: Metrics.mediumSpacing,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Metrics.baseSpacing,
  },
  recipeTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  deleteButton: {
    padding: 4,
  },
  recipeInfo: {
    marginBottom: Metrics.baseSpacing,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 8,
  },
  scalingInfoContainer: {
    marginBottom: Metrics.baseSpacing,
  },
  scalingBadge: {
    backgroundColor: Colors.primary + '20', // 20% opacity
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Metrics.roundedFull,
  },
  scalingBadgeText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  ingredientsLabel: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.smallSpacing,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
  },
  ingredientAmount: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  moreIngredientsText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Metrics.xLargeSpacing,
  },
  emptyTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  emptyText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.mediumLineHeight,
  },
});

export default SavedScaledRecipesScreen;