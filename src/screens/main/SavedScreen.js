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

import RecipeCard from '../../components/recipe/RecipeCard';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { selectAllRecipes, selectFavorites } from '../../store/selectors/recipeSelectors';

// Datos ficticios para recetas guardadas
const savedRecipes = [
  {
    id: '1',
    title: 'Tazón Mediterráneo',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    time: 25,
    tags: ['Saludable', 'Almuerzo'],
    rating: 4.5,
    reviews: 12,
    cookTime: 15,
    prepTime: 10,
    servings: 2,
    calories: 350,
    protein: 15,
    carbs: 45,
    fat: 12,
    author: {
      name: 'Chef María',
      avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
    },
    description: 'Un delicioso tazón mediterráneo lleno de sabores frescos y nutritivos.',
    ingredients: [
      { name: 'quinoa', amount: '1 taza', preparation: 'cocida' },
      { name: 'tomate', amount: '1 taza', preparation: 'partido en cubos' },
      { name: 'pepino', amount: '1', preparation: 'cortado en cubos' },
      { name: 'aceitunas', amount: '1/2 taza', preparation: 'sin hueso' },
      { name: 'queso feta', amount: '1/4 taza', preparation: 'desmenuzado' },
      { name: 'aceite de oliva', amount: '2 cucharadas', preparation: '' },
      { name: 'limón', amount: '1', preparation: 'exprimido' }
    ],
    instructions: [
      { text: 'Cocina la quinoa según las instrucciones del paquete y deja enfriar.' },
      { text: 'Corta los tomates y pepinos en cubos pequeños.' },
      { text: 'En un tazón grande, mezcla la quinoa, tomates, pepinos y aceitunas.' },
      { text: 'Agrega el queso feta desmenuzado por encima.' },
      { text: 'Aliña con aceite de oliva y jugo de limón. Mezcla suavemente y sirve.' }
    ],
    comments: []
  },
  {
    id: '2',
    title: 'Tostada de Aguacate',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
    time: 10,
    tags: ['Desayuno', 'Rápido'],
    rating: 4.8,
    reviews: 25,
    cookTime: 5,
    prepTime: 5,
    servings: 1,
    calories: 280,
    protein: 12,
    carbs: 25,
    fat: 18,
    author: {
      name: 'Carlos Gómez',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    description: 'Un desayuno rápido y nutritivo perfecto para comenzar el día.',
    ingredients: [
      { name: 'pan integral', amount: '2 rebanadas', preparation: '' },
      { name: 'aguacate', amount: '1', preparation: 'maduro' },
      { name: 'tomate', amount: '1', preparation: 'en rodajas' },
      { name: 'huevo', amount: '1', preparation: 'frito o pochado' },
      { name: 'sal', amount: 'al gusto', preparation: '' },
      { name: 'pimienta', amount: 'al gusto', preparation: '' }
    ],
    instructions: [
      { text: 'Tuesta las rebanadas de pan hasta que estén doradas.' },
      { text: 'Mientras tanto, machaca el aguacate con un tenedor y sazona con sal y pimienta.' },
      { text: 'Fríe o pocha el huevo según tu preferencia.' },
      { text: 'Unta el aguacate sobre las tostadas.' },
      { text: 'Coloca las rodajas de tomate y el huevo encima. Sirve inmediatamente.' }
    ],
    comments: []
  },
  {
    id: '3',
    title: 'Tazón de Batido de Bayas',
    imageUrl: 'https://images.unsplash.com/photo-1557837931-97fdbe7cb9a4',
    time: 15,
    tags: ['Desayuno', 'Vegano'],
    rating: 4.3,
    reviews: 8,
    cookTime: 0,
    prepTime: 15,
    servings: 1,
    calories: 220,
    protein: 8,
    carbs: 35,
    fat: 6,
    author: {
      name: 'Ana Hernández',
      avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
    },
    description: 'Un tazón de batido refrescante y lleno de antioxidantes.',
    ingredients: [
      { name: 'bayas mixtas', amount: '1 taza', preparation: 'congeladas' },
      { name: 'plátano', amount: '1', preparation: 'congelado en trozos' },
      { name: 'leche de almendras', amount: '1/2 taza', preparation: '' },
      { name: 'granola', amount: '1/4 taza', preparation: 'sin gluten' },
      { name: 'miel', amount: '1 cucharada', preparation: 'opcional' }
    ],
    instructions: [
      { text: 'En una licuadora, combina las bayas, plátano y leche de almendras.' },
      { text: 'Licúa hasta obtener una consistencia cremosa y espesa.' },
      { text: 'Vierte el batido en un tazón.' },
      { text: 'Decora con granola y un chorrito de miel si lo deseas.' },
      { text: 'Sirve inmediatamente mientras esté frío.' }
    ],
    comments: []
  },
  {
    id: '4',
    title: 'Salmón a la Parrilla',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    time: 30,
    tags: ['Cena', 'Proteína'],
    rating: 4.7,
    reviews: 18,
    cookTime: 20,
    prepTime: 10,
    servings: 4,
    calories: 320,
    protein: 28,
    carbs: 2,
    fat: 22,
    author: {
      name: 'Chef Roberto',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    },
    description: 'Salmón perfectamente sazonado y grillado a la perfección.',
    ingredients: [
      { name: 'salmón', amount: '4 filetes', preparation: '150g cada uno' },
      { name: 'limón', amount: '1', preparation: 'en rodajas' },
      { name: 'eneldo', amount: '2 cucharadas', preparation: 'fresco, picado' },
      { name: 'ajo', amount: '2 dientes', preparation: 'picados' },
      { name: 'aceite de oliva', amount: '2 cucharadas', preparation: '' },
      { name: 'sal', amount: 'al gusto', preparation: '' },
      { name: 'pimienta', amount: 'al gusto', preparation: '' }
    ],
    instructions: [
      { text: 'Precalienta la parrilla a fuego medio-alto.' },
      { text: 'En un tazón, mezcla aceite de oliva, ajo picado, eneldo, sal y pimienta.' },
      { text: 'Marina los filetes de salmón con esta mezcla durante 10 minutos.' },
      { text: 'Grilla el salmón 4-5 minutos por cada lado.' },
      { text: 'Sirve con rodajas de limón y eneldo fresco adicional.' }
    ],
    comments: []
  },
  {
    id: '5',
    title: 'Pimientos Rellenos de Quinua',
    imageUrl: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9',
    time: 45,
    tags: ['Cena', 'Vegetariano'],
    rating: 4.4,
    reviews: 15,
    cookTime: 35,
    prepTime: 10,
    servings: 4,
    calories: 280,
    protein: 12,
    carbs: 38,
    fat: 10,
    author: {
      name: 'Laura Martínez',
      avatar: 'https://randomuser.me/api/portraits/women/38.jpg',
    },
    description: 'Pimientos coloridos rellenos de una mezcla nutritiva de quinua y vegetales.',
    ingredients: [
      { name: 'pimientos', amount: '4', preparation: 'grandes, variados colores' },
      { name: 'quinua', amount: '1 taza', preparation: 'cocida' },
      { name: 'cebolla', amount: '1', preparation: 'picada finamente' },
      { name: 'tomate', amount: '2', preparation: 'picados' },
      { name: 'queso', amount: '1/2 taza', preparation: 'rallado' },
      { name: 'aceite de oliva', amount: '2 cucharadas', preparation: '' }
    ],
    instructions: [
      { text: 'Precalienta el horno a 180°C.' },
      { text: 'Corta la parte superior de los pimientos y retira las semillas.' },
      { text: 'Saltea la cebolla en aceite de oliva hasta que esté transparente.' },
      { text: 'Mezcla la quinua cocida, cebolla salteada, tomates y la mitad del queso.' },
      { text: 'Rellena los pimientos con la mezcla y cubre con el queso restante.' },
      { text: 'Hornea por 25-30 minutos hasta que los pimientos estén tiernos.' }
    ],
    comments: []
  },
  {
    id: '6',
    title: 'Ensalada de Verduras Frescas',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    time: 15,
    tags: ['Almuerzo', 'Vegano'],
    rating: 4.2,
    reviews: 22,
    cookTime: 0,
    prepTime: 15,
    servings: 2,
    calories: 180,
    protein: 6,
    carbs: 20,
    fat: 10,
    author: {
      name: 'Chef María',
      avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
    },
    description: 'Una ensalada fresca y colorida perfecta para cualquier momento del día.',
    ingredients: [
      { name: 'lechuga', amount: '4 tazas', preparation: 'mixta' },
      { name: 'tomate', amount: '2', preparation: 'cortados en cubos' },
      { name: 'pepino', amount: '1', preparation: 'en rodajas finas' },
      { name: 'zanahoria', amount: '1', preparation: 'rallada' },
      { name: 'aguacate', amount: '1', preparation: 'en cubos' },
      { name: 'vinagreta', amount: '3 cucharadas', preparation: 'de tu preferencia' }
    ],
    instructions: [
      { text: 'Lava y seca todas las verduras de hoja.' },
      { text: 'Corta los tomates en cubos y el pepino en rodajas finas.' },
      { text: 'Ralla la zanahoria y corta el aguacate en cubos.' },
      { text: 'En un tazón grande, combina todos los ingredientes.' },
      { text: 'Aliña con la vinagreta justo antes de servir.' }
    ],
    comments: []
  },
];

// Categorías de colecciones
const collections = [
  'Todas Guardadas',
  'Favoritas',
  'Comidas Rápidas',
  'Desayuno',
  'Almuerzo',
  'Cena',
  'Postres',
];

const SavedScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('Todas Guardadas');
  const [filteredRecipes, setFilteredRecipes] = useState(savedRecipes);

  // Get favorites from Redux store
  const allRecipes = useSelector(selectAllRecipes);
  const favoriteIds = useSelector(selectFavorites);
  
  // Get favorite recipes by filtering all recipes with favorite IDs
  const favoriteRecipes = savedRecipes.filter(recipe => favoriteIds.includes(recipe.id));

  useEffect(() => {
    handleCollectionPress(selectedCollection);
  }, [favoriteIds, selectedCollection]);

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleSearch = (text) => {
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
        recipe.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredRecipes(filtered);
    }
  };

  const handleCollectionPress = (collection) => {
    setSelectedCollection(collection);
    setSearchQuery(''); // Clear search when changing collection
    
    if (collection === 'Todas Guardadas') {
      setFilteredRecipes(savedRecipes);
    } else if (collection === 'Favoritas') {
      setFilteredRecipes(favoriteRecipes);
    } else {
      const filtered = savedRecipes.filter((recipe) =>
        recipe.tags.some(tag => tag === collection) ||
        (collection === 'Comidas Rápidas' && recipe.time <= 15)
      );
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
            time={item.time}
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