import React, { useState, useEffect } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const SavedScaledRecipesScreen = ({ navigation }) => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedRecipes();
    }, [])
  );

  const loadSavedRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Si tienes endpoint real, úsalo aquí
      const saved = await AsyncStorage.getItem('saved_scaled_recipes');
      if (saved) {
        setSavedRecipes(JSON.parse(saved));
      } else {
        setSavedRecipes([]);
      }
    } catch (err) {
      setError('No se pudieron cargar las recetas escaladas.');
      setSavedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { 
      recipe: {
        id: recipe.originalId,
        title: recipe.title.split(' (')[0], // Remove scaling info from title
        imageUrl: recipe.imageUrl,
        servings: recipe.servings,
        ingredients: recipe.ingredients.map(ing => ({
          name: ing.name,
          amount: ing.scaledAmount,
          preparation: ''
        }))
      },
      fromScaledRecipes: true,
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
          onPress: async () => {
            try {
              // Actualizar estado local
              const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
              setSavedRecipes(updatedRecipes);
              
              // Actualizar AsyncStorage
              await AsyncStorage.setItem('saved_scaled_recipes', JSON.stringify(updatedRecipes));
              
              Alert.alert('Éxito', 'Receta escalada eliminada');
            } catch (error) {
              console.error('Error deleting scaled recipe:', error);
              Alert.alert('Error', 'No se pudo eliminar la receta escalada');
              // Recargar las recetas en caso de error
              loadSavedRecipes();
            }
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
            <Text style={styles.countText}>{savedRecipes.length}/10</Text>
          </View>
        </View>
      </LinearGradient>
      
      <FlatList
        data={savedRecipes}
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