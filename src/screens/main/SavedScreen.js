import React, { useState } from 'react';
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

import RecipeCard from '../../components/recipe/RecipeCard';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

// Datos ficticios para recetas guardadas
const savedRecipes = [
  {
    id: '1',
    title: 'Tazón Mediterráneo',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    time: 25,
    tags: ['Saludable', 'Almuerzo'],
  },
  {
    id: '2',
    title: 'Tostada de Aguacate',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
    time: 10,
    tags: ['Desayuno', 'Rápido'],
  },
  {
    id: '3',
    title: 'Tazón de Batido de Bayas',
    imageUrl: 'https://images.unsplash.com/photo-1557837931-97fdbe7cb9a4',
    time: 15,
    tags: ['Desayuno', 'Vegano'],
  },
  {
    id: '4',
    title: 'Salmón a la Parrilla',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    time: 30,
    tags: ['Cena', 'Proteína'],
  },
  {
    id: '5',
    title: 'Pimientos Rellenos de Quinua',
    imageUrl: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9',
    time: 45,
    tags: ['Cena', 'Vegetariano'],
  },
  {
    id: '6',
    title: 'Ensalada de Verduras Frescas',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    time: 15,
    tags: ['Almuerzo', 'Vegano'],
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

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredRecipes(savedRecipes);
    } else {
      const filtered = savedRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(text.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredRecipes(filtered);
    }
  };

  const handleCollectionPress = (collection) => {
    setSelectedCollection(collection);
    if (collection === 'Todas Guardadas') {
      setFilteredRecipes(savedRecipes);
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