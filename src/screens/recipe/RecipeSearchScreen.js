import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import RecipeCard from '../../components/recipe/RecipeCard';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

// Dummy data for recipe search
const allRecipes = [
  {
    id: '1',
    title: 'Tazón Mediterráneo',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    time: 25,
    tags: ['Saludable', 'Almuerzo', 'Vegetariano'],
    user: 'Chef María',
    ingredients: [
      {name: 'quinoa', amount: '1 taza'},
      {name: 'tomate', amount: '1 taza', preparation: 'partido en cubos'},
      {name: 'pepino', amount: '1', preparation: 'cortado en cubos'},
      {name: 'aceitunas', amount: '1/2 taza'},
      {name: 'queso feta', amount: '1/4 taza', preparation: 'desmenuzado'}
    ],
    dateAdded: '2023-05-15',
  },
  {
    id: '2',
    title: 'Tostada de Aguacate',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
    time: 10,
    tags: ['Desayuno', 'Rápido', 'Vegetariano'],
    user: 'Carlos Gómez',
    ingredients: [
      {name: 'pan integral', amount: '2 rebanadas'},
      {name: 'aguacate', amount: '1', preparation: 'maduro'},
      {name: 'tomate', amount: '1', preparation: 'en rodajas'},
      {name: 'huevo', amount: '1', preparation: 'frito o pochado'}
    ],
    dateAdded: '2023-06-22',
  },
  {
    id: '3',
    title: 'Tazón de Batido de Bayas',
    imageUrl: 'https://images.unsplash.com/photo-1557837931-97fdbe7cb9a4',
    time: 15,
    tags: ['Desayuno', 'Vegano', 'Sin Gluten'],
    user: 'Ana Hernández',
    ingredients: [
      {name: 'bayas mixtas', amount: '1 taza', preparation: 'congeladas'},
      {name: 'plátano', amount: '1', preparation: 'congelado en trozos'},
      {name: 'leche de almendras', amount: '1/2 taza'},
      {name: 'granola', amount: '1/4 taza', preparation: 'sin gluten'}
    ],
    dateAdded: '2023-07-10',
  },
  {
    id: '4',
    title: 'Salmón a la Parrilla',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    time: 30,
    tags: ['Cena', 'Proteína', 'Pescado'],
    user: 'Chef Roberto',
    ingredients: [
      {name: 'salmón', amount: '4 filetes', preparation: '150g cada uno'},
      {name: 'limón', amount: '1'},
      {name: 'eneldo', amount: '2 cucharadas', preparation: 'fresco, picado'},
      {name: 'ajo', amount: '2 dientes', preparation: 'picados'},
      {name: 'aceite de oliva', amount: '2 cucharadas'}
    ],
    dateAdded: '2023-08-05',
  },
  {
    id: '5',
    title: 'Pimientos Rellenos de Quinua',
    imageUrl: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9',
    time: 45,
    tags: ['Cena', 'Vegetariano', 'Sin Gluten'],
    user: 'Laura Martínez',
    ingredients: [
      {name: 'pimientos', amount: '4', preparation: 'grandes, variados colores'},
      {name: 'quinua', amount: '1 taza'},
      {name: 'cebolla', amount: '1', preparation: 'picada finamente'},
      {name: 'tomate', amount: '2', preparation: 'picados'},
      {name: 'queso', amount: '1/2 taza', preparation: 'rallado'}
    ],
    dateAdded: '2023-09-12',
  },
  {
    id: '6',
    title: 'Ensalada de Verduras Frescas',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    time: 15,
    tags: ['Almuerzo', 'Vegano', 'Rápido'],
    user: 'Chef María',
    ingredients: [
      {name: 'lechuga', amount: '4 tazas', preparation: 'mixta'},
      {name: 'tomate', amount: '2', preparation: 'cortados en cubos'},
      {name: 'pepino', amount: '1', preparation: 'en rodajas finas'},
      {name: 'zanahoria', amount: '1', preparation: 'rallada'},
      {name: 'aguacate', amount: '1', preparation: 'en cubos'}
    ],
    dateAdded: '2023-10-18',
  },
];

const RecipeSearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name', 'ingredient', 'tag', 'user'
  const [sortType, setSortType] = useState('alphabetical'); // 'alphabetical', 'newest', 'user'
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [excludeIngredient, setExcludeIngredient] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState(allRecipes);

  // Filter recipes based on search criteria
  const filterRecipes = () => {
    let results = [...allRecipes];

    if (searchQuery.trim() !== '') {
      switch (searchType) {
        case 'name':
          results = results.filter(recipe =>
            recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          break;
        case 'ingredient':
          results = results.filter(recipe =>
            recipe.ingredients.some(ingredient =>
              ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
          break;
        case 'tag':
          results = results.filter(recipe =>
            recipe.tags.some(tag =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
          break;
        case 'user':
          results = results.filter(recipe =>
            recipe.user.toLowerCase().includes(searchQuery.toLowerCase())
          );
          break;
      }
    }

    // Additional filter for excluding ingredients
    if (excludeIngredient.trim() !== '') {
      results = results.filter(recipe =>
        !recipe.ingredients.some(ingredient =>
          ingredient.name.toLowerCase().includes(excludeIngredient.toLowerCase())
        )
      );
    }

    // Apply sorting
    switch (sortType) {
      case 'alphabetical':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
      case 'user':
        results.sort((a, b) => a.user.localeCompare(b.user));
        break;
    }

    setFilteredRecipes(results);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredRecipes(allRecipes);
    } else {
      filterRecipes();
    }
  };

  const handleRecipePress = (recipe) => {
    // Asegurarse de que el ID se pasa correctamente
    console.log('Navigating to recipe detail with data:', JSON.stringify(recipe));
    
    if (!recipe || !recipe.id) {
      console.error('Invalid recipe data:', recipe);
      return;
    }
    
    navigation.navigate('RecipeDetail', { 
      recipe: {
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl
      }
    });
  };

  const handleFilterChange = (type) => {
    setSearchType(type);
    filterRecipes();
  };

  const handleSortChange = (type) => {
    setSortType(type);
    filterRecipes();
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  const applyFilters = () => {
    filterRecipes();
    setFilterModalVisible(false);
  };

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
          <Text style={styles.headerTitle}>Buscar Recetas</Text>
          <TouchableOpacity onPress={toggleFilterModal}>
            <Icon name="filter" size={24} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color={Colors.textMedium}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={
              searchType === 'name'
                ? "Buscar por nombre de receta..."
                : searchType === 'ingredient'
                ? "Buscar por ingrediente..."
                : searchType === 'tag'
                ? "Buscar por etiqueta..."
                : "Buscar por usuario..."
            }
            placeholderTextColor={Colors.textMedium}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="x" size={20} color={Colors.textMedium} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterOptionsContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterOption,
              searchType === 'name' && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterChange('name')}
          >
            <Text
              style={[
                styles.filterOptionText,
                searchType === 'name' && styles.activeFilterOptionText,
              ]}
            >
              Nombre
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              searchType === 'ingredient' && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterChange('ingredient')}
          >
            <Text
              style={[
                styles.filterOptionText,
                searchType === 'ingredient' && styles.activeFilterOptionText,
              ]}
            >
              Ingrediente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              searchType === 'tag' && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterChange('tag')}
          >
            <Text
              style={[
                styles.filterOptionText,
                searchType === 'tag' && styles.activeFilterOptionText,
              ]}
            >
              Categoría
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              searchType === 'user' && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterChange('user')}
          >
            <Text
              style={[
                styles.filterOptionText,
                searchType === 'user' && styles.activeFilterOptionText,
              ]}
            >
              Usuario
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortType === 'alphabetical' && styles.activeSortOption,
          ]}
          onPress={() => handleSortChange('alphabetical')}
        >
          <Text
            style={[
              styles.sortOptionText,
              sortType === 'alphabetical' && styles.activeSortOptionText,
            ]}
          >
            Alfabético
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortOption,
            sortType === 'newest' && styles.activeSortOption,
          ]}
          onPress={() => handleSortChange('newest')}
        >
          <Text
            style={[
              styles.sortOptionText,
              sortType === 'newest' && styles.activeSortOptionText,
            ]}
          >
            Más Reciente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortOption,
            sortType === 'user' && styles.activeSortOption,
          ]}
          onPress={() => handleSortChange('user')}
        >
          <Text
            style={[
              styles.sortOptionText,
              sortType === 'user' && styles.activeSortOptionText,
            ]}
          >
            Usuario
          </Text>
        </TouchableOpacity>
      </View>

      {excludeIngredient ? (
        <View style={styles.exclusionContainer}>
          <Text style={styles.exclusionText}>
            Excluyendo: {excludeIngredient}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setExcludeIngredient('');
              filterRecipes();
            }}
          >
            <Icon name="x" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredRecipes}
        renderItem={({ item }) => (
          <RecipeCard
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            time={item.time}
            tags={item.tags}
            ingredients={item.ingredients}
            type="list"
            onPress={handleRecipePress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recipeList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search" size={60} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>
              No se encontraron recetas
            </Text>
            <Text style={styles.emptyText}>
              Intenta con otros términos de búsqueda o filtros
            </Text>
          </View>
        }
      />

      {filterModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros Avanzados</Text>
              <TouchableOpacity onPress={toggleFilterModal}>
                <Icon name="x" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionTitle}>
              Excluir Ingrediente
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: nueces, lácteos, etc."
                value={excludeIngredient}
                onChangeText={setExcludeIngredient}
                placeholderTextColor={Colors.textMedium}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={toggleFilterModal}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={applyFilters}
              >
                <Text style={styles.modalApplyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Metrics.mediumSpacing,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Metrics.roundedFull,
    paddingHorizontal: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  searchIcon: {
    marginRight: Metrics.baseSpacing,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Metrics.mediumSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    paddingBottom: Metrics.baseSpacing,
  },
  filterOption: {
    backgroundColor: Colors.card,
    paddingVertical: Metrics.smallSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
    marginRight: Metrics.baseSpacing,
  },
  activeFilterOption: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  activeFilterOptionText: {
    color: Colors.card,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginRight: Metrics.baseSpacing,
  },
  sortOption: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  activeSortOption: {
    backgroundColor: Colors.primary + '20', // 20% opacity
  },
  sortOptionText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  activeSortOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  exclusionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.error + '10', // 10% opacity
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.smallSpacing,
    margin: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  exclusionText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.error,
  },
  recipeList: {
    padding: Metrics.mediumSpacing,
    paddingBottom: Metrics.xxLargeSpacing,
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
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  modalTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  modalSectionTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  inputContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Metrics.mediumSpacing,
  },
  modalCancelButton: {
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    marginRight: Metrics.baseSpacing,
  },
  modalCancelButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  modalApplyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  modalApplyButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.card,
    fontWeight: '500',
  },
});

export default RecipeSearchScreen;