import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RecipeCard from '../../components/recipe/RecipeCard';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { api } from '../../services/api';
import { mapBackendRecipe } from '../../services/dataService';
import { selectAllRecipes, selectFavorites } from '../../store/selectors/recipeSelectors';

// Categoría por defecto
const DEFAULT_CATEGORY = 'Todas Guardadas';

// Categorías de colecciones iniciales
const initialCollections = [
  DEFAULT_CATEGORY,
  'Favoritas',
  'Comidas Rápidas',
  'Desayuno',
  'Almuerzo',
  'Cena',
  'Postres',
];

const SavedScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(DEFAULT_CATEGORY);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState(initialCollections);
  const [recipeTypes, setRecipeTypes] = useState([]);

  // Get favorites from Redux store
  const allRecipes = useSelector(selectAllRecipes);
  const favoriteIds = useSelector(selectFavorites);
  
  // Get favorite recipes by filtering all recipes with favorite IDs
  const favoriteRecipes = savedRecipes.filter(recipe => favoriteIds.includes(recipe.id));

  useEffect(() => {
    loadSavedRecipes();
    loadRecipeTypes();
    handleCollectionPress(selectedCollection);
  }, [favoriteIds, selectedCollection]);

  // Efecto para recargar las recetas cuando la pantalla obtiene el foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('SavedScreen obtuvo el foco - recargando recetas guardadas');
      loadSavedRecipes();
    });

    return unsubscribe;
  }, [navigation]);

  const loadRecipeTypes = async () => {
    try {
      // Usar la API para obtener los tipos de recetas
      const response = await api.recipes.getTypes();
      if (response && response.data) {
        const types = response.data;
        console.log(`Tipos de recetas cargados: ${types.length}`);
        
        // Guardar los tipos de recetas
        setRecipeTypes(types);
        
        // Crear la lista de categorías con "Todas Guardadas" y "Favoritas" al inicio
        const categoryList = [DEFAULT_CATEGORY, 'Favoritas'];
        types.forEach(type => {
          if (type.descripcion) {
            categoryList.push(type.descripcion);
          }
        });
        
        // Agregar "Comidas Rápidas" si no está
        if (!categoryList.includes('Comidas Rápidas')) {
          categoryList.push('Comidas Rápidas');
        }
        
        setCollections(categoryList);
      } else {
        console.log('No se pudieron cargar los tipos de recetas');
        // Fallback a categorías predefinidas
        setCollections(initialCollections);
      }
    } catch (error) {
      console.error('Error al cargar tipos de receta:', error);
      // Fallback a categorías predefinidas
      setCollections(initialCollections);
    }
  };

  const loadSavedRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar recetas guardadas desde el API
      console.log('Intentando cargar recetas guardadas desde el API...');
      const response = await api.savedRecipes.get();
      console.log('Respuesta completa del API:', response);
      
      const { data } = response;
      console.log('Datos recibidos de recetas guardadas:', data);
      
      if (data && Array.isArray(data)) {
        console.log(`Se encontraron ${data.length} recetas guardadas`);
        // Mapear las recetas del backend al formato esperado por el frontend
        const mappedRecipes = data.map(receta => {
          const mapped = mapBackendRecipe(receta);
          console.log('Receta original:', receta);
          console.log('Receta mapeada:', mapped);
          return mapped;
        });
        console.log('Todas las recetas mapeadas:', mappedRecipes);
        setSavedRecipes(mappedRecipes);
        // También actualizar filteredRecipes si estamos en "Todas Guardadas"
        if (selectedCollection === DEFAULT_CATEGORY) {
          console.log('Actualizando filteredRecipes con recetas guardadas');
          setFilteredRecipes(mappedRecipes);
        }
      } else {
        console.log('No se recibieron datos de recetas guardadas o no es un array');
        setSavedRecipes([]);
        if (selectedCollection === DEFAULT_CATEGORY) {
          setFilteredRecipes([]);
        }
      }
    } catch (err) {
      console.error('Error al cargar recetas guardadas:', err);
      setError('No se pudieron cargar las recetas guardadas.');
      
      // Fallback a recetas guardadas localmente
      try {
        console.log('Intentando cargar recetas guardadas localmente...');
        const saved = await AsyncStorage.getItem('saved_recipes');
        if (saved) {
          const localRecipes = JSON.parse(saved);
          console.log(`Se encontraron ${localRecipes.length} recetas guardadas localmente`);
          setSavedRecipes(localRecipes);
          if (selectedCollection === DEFAULT_CATEGORY) {
            setFilteredRecipes(localRecipes);
          }
        } else {
          console.log('No hay recetas guardadas localmente');
          setSavedRecipes([]);
          if (selectedCollection === DEFAULT_CATEGORY) {
            setFilteredRecipes([]);
          }
        }
      } catch (localErr) {
        console.error('Error al cargar recetas guardadas localmente:', localErr);
        setSavedRecipes([]);
        if (selectedCollection === DEFAULT_CATEGORY) {
          setFilteredRecipes([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleSearch = (text) => {
    console.log(`Buscando: ${text}`);
    setSearchQuery(text);
    if (text.trim() === '') {
      handleCollectionPress(selectedCollection);
    } else {
      let recipesToFilter = savedRecipes;
      if (selectedCollection === 'Favoritas') {
        recipesToFilter = favoriteRecipes;
      }
      
      const filtered = recipesToFilter.filter((recipe) =>
        recipe.title.toLowerCase().includes(text.toLowerCase()) ||
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase())))
      );
      console.log(`Se encontraron ${filtered.length} recetas con el término "${text}"`);
      setFilteredRecipes(filtered);
    }
  };

  const handleCollectionPress = (collection) => {
    console.log(`Cambiando a colección: ${collection}`);
    setSelectedCollection(collection);
    setSearchQuery(''); // Clear search when changing collection
    
    if (collection === DEFAULT_CATEGORY) {
      console.log(`Mostrando todas las recetas guardadas (${savedRecipes.length})`);
      setFilteredRecipes(savedRecipes);
    } else if (collection === 'Favoritas') {
      console.log(`Mostrando recetas favoritas (${favoriteRecipes.length})`);
      setFilteredRecipes(favoriteRecipes);
    } else {
      console.log(`Filtrando recetas por colección: ${collection}`);
      const filtered = savedRecipes.filter((recipe) =>
        recipe.tags && recipe.tags.some(tag => tag === collection) ||
        (recipe.category === collection) ||
        (collection === 'Comidas Rápidas' && recipe.time <= 15)
      );
      console.log(`Se encontraron ${filtered.length} recetas en la colección ${collection}`);
      setFilteredRecipes(filtered);
    }
  };

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.collectionButton,
        selectedCollection === item && styles.selectedCollectionButton,
      ]}
      onPress={() => handleCollectionPress(item)}
    >
      <Text
        style={[
          styles.collectionButtonText,
          selectedCollection === item && styles.selectedCollectionText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bookmark" size={60} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>No se encontraron recetas guardadas</Text>
      <Text style={styles.emptyText}>
        Prueba con un término de búsqueda o colección diferente, o guarda algunas recetas para verlas aquí.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Recetas Guardadas</Text>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={Colors.textMedium} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recetas guardadas..."
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

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('SavedScaledRecipes')}
          >
            <Icon name="sliders" size={16} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Recetas Escaladas</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={collections}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionsContainer}
        />
      </LinearGradient>

      <FlatList
        data={filteredRecipes}
        renderItem={({ item }) => (
          <RecipeCard
            title={item.title}
            imageUrl={item.imageUrl}
    
            tags={item.tags}
            type="list"
            onPress={() => handleRecipePress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recipesContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
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
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Metrics.baseSpacing,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Metrics.roundedFull,
  },
  actionButtonText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  collectionsContainer: {
    paddingRight: Metrics.mediumSpacing,
  },
  collectionButton: {
    backgroundColor: Colors.card,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
    marginRight: Metrics.baseSpacing,
  },
  selectedCollectionButton: {
    backgroundColor: Colors.primary,
  },
  collectionButtonText: {
    color: Colors.textDark,
    fontSize: Metrics.baseFontSize,
  },
  selectedCollectionText: {
    color: Colors.card,
    fontWeight: '500',
  },
  recipesContainer: {
    padding: Metrics.mediumSpacing,
    paddingBottom: Metrics.xxLargeSpacing,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.xLargeSpacing,
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

export default SavedScreen;