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

const MyRecipesScreen = ({ navigation }) => {
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Mock user recipes data
  const mockMyRecipes = [
    {
      id: 'user_1',
      title: 'Mi Pasta Especial',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5',
      time: 30,
      tags: ['Pasta', 'Italiano', 'Cena'],
      category: 'Cena',
      status: 'published', // published, draft, private
      views: 245,
      likes: 18,
      createdDate: '2024-03-10',
      lastModified: '2024-03-12',
    },
    {
      id: 'user_2',
      title: 'Ensalada de Quinoa Casera',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      time: 20,
      tags: ['Saludable', 'Vegetariano', 'Almuerzo'],
      category: 'Almuerzo',
      status: 'published',
      views: 156,
      likes: 23,
      createdDate: '2024-03-08',
      lastModified: '2024-03-08',
    },
    {
      id: 'user_3',
      title: 'Brownies de Chocolate',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
      time: 45,
      tags: ['Postre', 'Chocolate', 'Dulce'],
      category: 'Postres',
      status: 'draft',
      views: 0,
      likes: 0,
      createdDate: '2024-03-15',
      lastModified: '2024-03-15',
    },
    {
      id: 'user_4',
      title: 'Smoothie Verde Energético',
      imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4',
      time: 10,
      tags: ['Bebida', 'Saludable', 'Desayuno'],
      category: 'Bebidas',
      status: 'private',
      views: 12,
      likes: 3,
      createdDate: '2024-03-05',
      lastModified: '2024-03-06',
    },
  ];

  const categories = ['Todas', 'Desayuno', 'Almuerzo', 'Cena', 'Postres', 'Bebidas', 'Aperitivos'];

  useEffect(() => {
    loadMyRecipes();
  }, []);

  const loadMyRecipes = async () => {
    setLoading(true);
    try {
      const savedRecipes = await AsyncStorage.getItem('myRecipes');
      if (savedRecipes) {
        setMyRecipes(JSON.parse(savedRecipes));
      } else {
        setMyRecipes(mockMyRecipes);
        await AsyncStorage.setItem('myRecipes', JSON.stringify(mockMyRecipes));
      }
    } catch (error) {
      console.log('Error loading my recipes:', error);
      setMyRecipes(mockMyRecipes);
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
        { text: 'Editar', onPress: () => navigation.navigate('AddTab') },
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
            const updatedRecipes = myRecipes.filter(recipe => recipe.id !== recipeId);
            setMyRecipes(updatedRecipes);
            await AsyncStorage.setItem('myRecipes', JSON.stringify(updatedRecipes));
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
      default: return Colors.textMedium;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Publicada';
      case 'draft': return 'Borrador';
      case 'private': return 'Privada';
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
          time={item.time}
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