import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RecipeCard from '../../components/recipe/RecipeCard';
import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import dataService from '../../services/dataService';
import api from '../../services/api';

const MyRecipesScreen = ({ navigation }) => {
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const categories = ['Todas', 'Desayuno', 'Almuerzo', 'Cena', 'Postres', 'Bebidas', 'Aperitivos'];

  useEffect(() => {
    loadMyRecipes();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading current user:', error);
    }
  };

  // Check if current user can approve recipes (empresa/admin)
  const canApproveRecipes = () => {
    if (!currentUser) return false;
    // Allow admin access for empresa representatives 
    return currentUser.tipo === 'empresa';
  };

  const loadMyRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user data
      let currentUser = null;
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        currentUser = JSON.parse(userData);
      }

      if (!currentUser) {
        setError('Usuario no autenticado');
        setMyRecipes([]);
        return;
      }

      // Use the specific endpoint to get user's own recipes (including pending ones)
      const userId = currentUser.idUsuario || currentUser.id;
      let userRecipes = [];
      
      try {
        // Try the dedicated user recipes endpoint first
        const userRecipesResponse = await dataService.getUserRecipes ? 
          await dataService.getUserRecipes(userId) : 
          await api.recipes.getByUser(userId);
        userRecipes = userRecipesResponse || [];
      } catch (error) {
        console.log('Failed to get user recipes by ID, trying by name search:', error);
        // Fallback to name search
        userRecipes = await dataService.searchRecipesByUser(currentUser.nombre || currentUser.name || '');
      }
      
      // Map recipes with proper status based on backend authorization
      const mappedRecipes = userRecipes.map(recipe => ({
        ...recipe,
        status: recipe.autorizada === true ? 'published' : 'pending_approval',
        views: Math.floor(Math.random() * 100), // Mock data since not in backend
        likes: Math.floor(Math.random() * 50), // Mock data since not in backend
      }));

      setMyRecipes(mappedRecipes);
      console.log(`Loaded ${mappedRecipes.length} user recipes, including pending ones`);
    } catch (err) {
      console.log('Error loading user recipes:', err);
      setError('No se pudieron cargar tus recetas. Intenta nuevamente.');
      setMyRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleEditRecipe = (recipe) => {
    Alert.alert(
      'Editar Receta',
      `¿Qué quieres hacer con "${recipe.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Editar', 
          onPress: () => navigation.navigate('AddTab', { 
            editingRecipe: recipe,
            isEditing: true 
          })
        },
        { text: 'Ver Detalles', onPress: () => handleRecipePress(recipe) },
      ]
    );
  };

  const handleDeleteRecipe = (recipeId) => {
    Alert.alert(
      'Eliminar Receta',
      '¿Estás seguro que quieres eliminar esta receta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get user ID for backend deletion
              const userId = currentUser?.idUsuario || currentUser?.id;
              
              if (userId) {
                // Try to delete from backend first
                const result = await dataService.deleteUserRecipe(recipeId, userId);
                
                if (result.success) {
                  Alert.alert('Éxito', 'Receta eliminada correctamente');
                } else {
                  Alert.alert('Error', result.message || 'No se pudo eliminar la receta del servidor');
                }
              }
              
              // Update local state regardless of backend success (for offline capabilities)
              const updatedRecipes = myRecipes.filter(recipe => recipe.id !== recipeId);
              setMyRecipes(updatedRecipes);
              await AsyncStorage.setItem('myRecipes', JSON.stringify(updatedRecipes));
              
              // Reload recipes from backend to ensure sync
              setTimeout(() => {
                loadMyRecipes();
              }, 1000);
              
            } catch (error) {
              console.error('Error deleting recipe:', error);
              Alert.alert('Error', 'No se pudo eliminar la receta. Intenta nuevamente.');
            }
          }
        }
      ]
    );
  };

  const handleChangeStatus = (recipeId, newStatus) => {
    const updatedRecipes = myRecipes.map(recipe =>
      recipe.id === recipeId ? { ...recipe, status: newStatus } : recipe
    );
    setMyRecipes(updatedRecipes);
    AsyncStorage.setItem('myRecipes', JSON.stringify(updatedRecipes));
  };

  const handleApproveRecipe = async (recipeId, approve = true) => {
    try {
      await dataService.approveRecipe(recipeId, approve);
      
      // Update local state
      const updatedRecipes = myRecipes.map(recipe =>
        recipe.id === recipeId ? { 
          ...recipe, 
          status: approve ? 'published' : 'rejected',
          autorizada: approve 
        } : recipe
      );
      setMyRecipes(updatedRecipes);
      
      const action = approve ? 'aprobada' : 'rechazada';
      Alert.alert('Éxito', `Receta ${action} correctamente`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la aprobación de la receta');
    }
  };

  const showAdminActions = (recipe) => {
    Alert.alert(
      'Acciones de Administrador',
      `Receta: "${recipe.title}"`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aprobar', 
          onPress: () => handleApproveRecipe(recipe.id, true),
          style: 'default'
        },
        { 
          text: 'Rechazar', 
          onPress: () => handleApproveRecipe(recipe.id, false),
          style: 'destructive'
        }
      ]
    );
  };

  const getFilteredRecipes = () => {
    if (selectedCategory === 'Todas') {
      return myRecipes;
    }
    return myRecipes.filter(recipe => recipe.category === selectedCategory);
  };

  const getRecipesByStatus = () => {
    const filtered = getFilteredRecipes();
    return {
      published: filtered.filter(r => r.status === 'published'),
      draft: filtered.filter(r => r.status === 'draft'),
      private: filtered.filter(r => r.status === 'private'),
    };
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'published': return Colors.success;
      case 'draft': return Colors.warning;
      case 'private': return Colors.primary;
      case 'pending_approval': return Colors.warning;
      case 'rejected': return Colors.error;
      default: return Colors.textMedium;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Publicada';
      case 'draft': return 'Borrador';
      case 'private': return 'Privada';
      case 'pending_approval': return 'Pendiente';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const renderCategoryTab = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === category && styles.selectedCategoryText,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeItemContainer}>
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => handleRecipePress(item)}
        activeOpacity={0.8}
      >
        <RecipeCard
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrl}
  
          tags={item.tags}
          type="list"
          onPress={() => handleRecipePress(item)}
        />
      </TouchableOpacity>
      
      <View style={styles.recipeActions}>
        <View style={styles.recipeStats}>
          <View style={styles.statItem}>
            <Icon name="eye" size={14} color={Colors.textMedium} />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="heart" size={14} color={Colors.textMedium} />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusBadgeColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditRecipe(item)}
          >
            <Icon name="edit-2" size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteRecipe(item.id)}
          >
            <Icon name="trash-2" size={16} color={Colors.error} />
          </TouchableOpacity>
          {/* Admin approval button - only for authorized users */}
          {canApproveRecipes() && item.status === 'pending_approval' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.adminButton]}
              onPress={() => showAdminActions(item)}
            >
              <Icon name="check-circle" size={16} color={Colors.success} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const filteredRecipes = getFilteredRecipes();
  const recipesByStatus = getRecipesByStatus();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
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
          <Text style={styles.headerTitle}>Mis Recetas</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTab')}
          >
            <Icon name="plus" size={20} color={Colors.textDark} />
          </TouchableOpacity>
          {canApproveRecipes() && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => navigation.navigate('AdminPanel')}
            >
              <Icon name="shield" size={20} color={Colors.textDark} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recipesByStatus.published.length}</Text>
            <Text style={styles.statLabel}>Publicadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recipesByStatus.draft.length}</Text>
            <Text style={styles.statLabel}>Borradores</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recipesByStatus.private.length}</Text>
            <Text style={styles.statLabel}>Privadas</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => renderCategoryTab(category))}
        </ScrollView>
      </View>

      {/* Recipes List */}
      <View style={styles.content}>
        {filteredRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="book-open" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No tienes recetas aún</Text>
            <Text style={styles.emptyText}>
              Crea tu primera receta y compártela con la comunidad
            </Text>
            <Button
              title="Crear Primera Receta"
              onPress={() => navigation.navigate('AddTab')}
              style={styles.emptyButton}
              iconName="plus"
            />
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recipesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  backButton: {
    marginRight: Metrics.baseSpacing,
  },
  headerTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.card + '20',
  },
  adminButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.card + '20',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  categoriesContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Metrics.baseSpacing,
  },
  categoryTab: {
    backgroundColor: Colors.background,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
    marginHorizontal: Metrics.smallSpacing,
  },
  selectedCategoryTab: {
    backgroundColor: Colors.primary,
  },
  categoryTabText: {
    color: Colors.textDark,
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: Colors.card,
  },
  content: {
    flex: 1,
  },
  recipesList: {
    padding: Metrics.mediumSpacing,
    paddingBottom: Metrics.xxLargeSpacing,
  },
  recipeItemContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  recipeCard: {
    marginBottom: Metrics.baseSpacing,
  },
  recipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recipeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Metrics.mediumSpacing,
  },
  statText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 4,
    borderRadius: Metrics.baseBorderRadius,
  },
  statusText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: Metrics.baseSpacing,
    marginLeft: Metrics.baseSpacing,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.xLargeSpacing,
    marginTop: Metrics.xLargeSpacing,
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
    marginBottom: Metrics.mediumSpacing,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default MyRecipesScreen; 