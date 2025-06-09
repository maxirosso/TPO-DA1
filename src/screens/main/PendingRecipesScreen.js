import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import RecipeCard from '../../components/recipe/RecipeCard';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import dataService from '../../services/dataService';

const PendingRecipesScreen = ({ navigation }) => {
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  const loadPendingRecipes = async () => {
    try {
      console.log('🔄 Loading pending recipes...');
      const recipes = await dataService.getPendingRecipesList();
      const recipeStats = await dataService.getPendingRecipesCount();
      
      setPendingRecipes(recipes);
      setStats(recipeStats);
      console.log('✅ Pending recipes loaded:', recipes.length);
    } catch (error) {
      console.error('❌ Error loading pending recipes:', error);
      Alert.alert('Error', 'No se pudieron cargar las recetas pendientes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPendingRecipes();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPendingRecipes();
    }, [])
  );

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { 
      recipe,
      fromPendingList: true 
    });
  };

  const handleMarkAsCompleted = async (recipe) => {
    const newCompletedState = !recipe.completed;
    const action = newCompletedState ? 'completada' : 'pendiente';
    
    Alert.alert(
      'Confirmar acción',
      `¿Marcar esta receta como ${action}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const recipeId = recipe.id || recipe.idReceta;
              console.log('🔄 Marking recipe as completed:', recipeId, newCompletedState);
              const result = await dataService.markRecipeAsCompleted(recipeId, newCompletedState);
              if (result && result.success) {
                Alert.alert('Éxito', result.message);
                // Force reload after successful operation
                setTimeout(() => {
                  console.log('🔄 Reloading pending recipes after mark completion');
                  loadPendingRecipes();
                }, 300);
              } else {
                Alert.alert('Error', result?.message || 'No se pudo marcar la receta');
                console.error('❌ Error result:', result);
              }
            } catch (error) {
              console.error('❌ Error marking recipe as completed:', error);
              Alert.alert('Error', 'Error al marcar receta como completada');
            }
          }
        }
      ]
    );
  };

  const handleRemoveFromList = async (recipe) => {
    Alert.alert(
      'Eliminar receta',
      '¿Estás seguro que quieres eliminar esta receta de tu lista de pendientes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const recipeId = recipe.id || recipe.idReceta;
              console.log('🔄 Removing recipe from pending list:', recipeId);
              console.log('🚀 Frontend: Starting removal of recipe:', recipeId);
              console.log('🚀 Recipe details:', { id: recipe.id, idReceta: recipe.idReceta, name: recipe.title || recipe.nombreReceta, completed: recipe.completed });
              
              const result = await dataService.removeRecipeFromPendingList(recipeId);
              console.log('🚀 Frontend: Removal result:', result);
              
              if (result && result.success) {
                Alert.alert('Éxito', result.message);
                // Force reload after successful operation
                setTimeout(() => {
                  console.log('🔄 Frontend: Reloading pending recipes after removal');
                  loadPendingRecipes();
                }, 300);
              } else {
                Alert.alert('Error', result?.message || 'No se pudo eliminar la receta');
                console.error('❌ Frontend: Error result:', result);
              }
            } catch (error) {
              console.error('❌ Error removing recipe from pending list:', error);
              Alert.alert('Error', 'Error al eliminar receta de la lista');
            }
          }
        }
      ]
    );
  };

  const getFilteredRecipes = () => {
    switch (filter) {
      case 'pending':
        return pendingRecipes.filter(recipe => !recipe.completed);
      case 'completed':
        return pendingRecipes.filter(recipe => recipe.completed);
      default:
        return pendingRecipes;
    }
  };

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeContainer}>
      <RecipeCard
        title={item.title || item.nombreReceta}
        imageUrl={item.imageUrl || item.fotoPrincipal}

        servings={item.servings || item.porciones}
        author={item.author}
        tags={item.tags || []}
        type="list"
        onPress={() => handleRecipePress(item)}
        style={[
          styles.recipeCard,
          item.completed && styles.completedRecipeCard
        ]}
      />
      
      <View style={styles.recipeActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.completed ? styles.completedButton : styles.pendingButton
          ]}
          onPress={() => handleMarkAsCompleted(item)}
        >
          <Icon 
            name={item.completed ? 'check-circle' : 'circle'} 
            size={16} 
            color={item.completed ? Colors.success : Colors.textMedium} 
          />
          <Text style={[
            styles.actionButtonText,
            item.completed ? styles.completedButtonText : styles.pendingButtonText
          ]}>
            {item.completed ? 'Completada' : 'Marcar como hecha'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleRemoveFromList(item)}
        >
          <Icon name="x" size={16} color={Colors.error} />
          <Text style={[styles.actionButtonText, styles.removeButtonText]}>
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>
      
      {item.completed && item.completedDate && (
        <View style={styles.completedInfo}>
          <Icon name="check" size={12} color={Colors.success} />
          <Text style={styles.completedText}>
            Completada el {new Date(item.completedDate).toLocaleDateString()}
          </Text>
        </View>
      )}
      
      {item.addedDate && (
        <View style={styles.addedInfo}>
          <Icon name="calendar" size={12} color={Colors.textLight} />
          <Text style={styles.addedText}>
            Agregada el {new Date(item.addedDate).toLocaleDateString()}
          </Text>
        </View>
      )}
    </View>
  );

  const renderFilterButton = (filterKey, label, count) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterKey && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterKey)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterKey && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.filterCount,
        filter === filterKey && styles.activeFilterCount
      ]}>
        {count}
      </Text>
    </TouchableOpacity>
  );



  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bookmark" size={60} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>
        {filter === 'pending' ? 'No hay recetas pendientes' :
         filter === 'completed' ? 'No hay recetas completadas' :
         'No hay recetas en tu lista'}
      </Text>
      <Text style={styles.emptyText}>
        {filter === 'all' ? 
          'Descubre recetas increíbles y agrégalas a tu lista para intentar más tarde' :
          filter === 'pending' ?
          '¡Excelente! Has completado todas las recetas de tu lista' :
          'Comienza a cocinar y marca las recetas que hayas preparado'
        }
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Icon name="home" size={16} color={Colors.primary} />
        <Text style={styles.browseButtonText}>Volver al Inicio</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando lista de recetas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredRecipes = getFilteredRecipes();

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
            <Icon name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lista de Recetas</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </View>

        <View style={styles.filtersContainer}>
          {renderFilterButton('all', 'Todas', stats.total)}
          {renderFilterButton('pending', 'Pendientes', stats.pending)}
          {renderFilterButton('completed', 'Completadas', stats.completed)}
        </View>
      </LinearGradient>

      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item, index) => `pending_recipe_${item.id || item.idReceta}_${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Metrics.mediumSpacing,
    fontSize: 16,
    color: Colors.textMedium,
  },
  headerContainer: {
    paddingBottom: Metrics.largeSpacing,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Metrics.largeSpacing,
    paddingTop: Metrics.mediumSpacing,
    marginBottom: Metrics.largeSpacing,
  },
  backButton: {
    marginRight: Metrics.mediumSpacing,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Metrics.largeSpacing,
    marginBottom: Metrics.largeSpacing,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Metrics.largeSpacing,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Metrics.smallSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    marginHorizontal: Metrics.smallSpacing,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilterButton: {
    backgroundColor: Colors.white,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
    marginRight: Metrics.smallSpacing,
  },
  activeFilterButtonText: {
    color: Colors.primary,
  },
  filterCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
    opacity: 0.8,
  },
  activeFilterCount: {
    color: Colors.primary,
  },
  listContainer: {
    padding: Metrics.largeSpacing,
  },
  recipeContainer: {
    marginBottom: Metrics.largeSpacing,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Metrics.mediumSpacing,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeCard: {
    marginBottom: Metrics.mediumSpacing,
  },
  completedRecipeCard: {
    opacity: 0.7,
  },
  recipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Metrics.smallSpacing,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Metrics.smallSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    marginHorizontal: Metrics.smallSpacing,
    borderRadius: 8,
    borderWidth: 1,
  },
  pendingButton: {
    borderColor: Colors.textMedium,
    backgroundColor: Colors.background,
  },
  completedButton: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '20',
  },
  removeButton: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '20',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: Metrics.smallSpacing,
  },
  pendingButtonText: {
    color: Colors.textMedium,
  },
  completedButtonText: {
    color: Colors.success,
  },
  removeButtonText: {
    color: Colors.error,
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.smallSpacing,
  },
  completedText: {
    fontSize: 12,
    color: Colors.success,
    marginLeft: Metrics.smallSpacing,
  },
  addedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addedText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: Metrics.smallSpacing,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Metrics.xxLargeSpacing,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginTop: Metrics.largeSpacing,
    marginBottom: Metrics.smallSpacing,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Metrics.largeSpacing,
    marginBottom: Metrics.largeSpacing,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Metrics.largeSpacing,
    paddingHorizontal: Metrics.xLargeSpacing,
    borderRadius: Metrics.mediumBorderRadius,
    marginTop: Metrics.largeSpacing,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.card,
    marginLeft: Metrics.smallSpacing,
  },
});

export default PendingRecipesScreen;
