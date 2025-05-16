import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';

import RecipeCard from '../../components/recipe/RecipeCard';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { AuthContext } from '../../context/AuthContext';

// Datos ficticios para recetas
const popularRecipes = [
  {
    id: '1',
    title: 'Tazón Mediterráneo',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    time: 25,
    category: 'Almuerzo',
  },
  {
    id: '2',
    title: 'Tostada de Aguacate',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
    time: 10,
    category: 'Desayuno',
  },
  {
    id: '3',
    title: 'Tazón de Batido de Bayas',
    imageUrl: 'https://images.unsplash.com/photo-1557837931-97fdbe7cb9a4',
    time: 15,
    category: 'Desayuno',
  },
  {
    id: '4',
    title: 'Salmón a la Parrilla',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    time: 30,
    category: 'Cena',
  },
  {
    id: '5',
    title: 'Pimientos Rellenos de Quinua',
    imageUrl: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9',
    time: 45,
    category: 'Cena',
  },
  {
    id: '6',
    title: 'Ensalada de Verduras Frescas',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    time: 15,
    category: 'Almuerzo',
  },
  {
    id: '8',
    title: 'Tiramisu Clásico',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    time: 240,
    category: 'Postres',
  },
  {
    id: '9',
    title: 'Guacamole Casero',
    imageUrl: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8',
    time: 15,
    category: 'Aperitivos',
  },
  {
    id: '10',
    title: 'Smoothie de Frutas',
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4',
    time: 10,
    category: 'Bebidas',
  },
];

const recentlyAddedRecipes = [
  {
    id: '6',
    title: 'Ensalada de Verduras Frescas',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    time: 15,
    tags: ['Saludable', 'Vegano'],
    category: 'Almuerzo',
  },
  {
    id: '4',
    title: 'Salmón a la Parrilla',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    time: 30,
    tags: ['Proteína', 'Cena'],
    category: 'Cena',
  },
  {
    id: '5',
    title: 'Pimientos Rellenos de Quinua',
    imageUrl: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9',
    time: 45,
    tags: ['Vegetariano', 'Cena'],
    category: 'Cena',
  },
  {
    id: '8',
    title: 'Tiramisu Clásico',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    time: 240,
    tags: ['Dulce', 'Italiano'],
    category: 'Postres',
  },
  {
    id: '9',
    title: 'Guacamole Casero',
    imageUrl: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8',
    time: 15,
    tags: ['Rápido', 'Mexicano'],
    category: 'Aperitivos',
  },
  {
    id: '10',
    title: 'Smoothie de Frutas',
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4',
    time: 10,
    tags: ['Refrescante', 'Saludable'],
    category: 'Bebidas',
  },
];

// Filtros de categorías
const categories = [
  'Todas las Recetas',
  'Desayuno',
  'Almuerzo',
  'Cena',
  'Postres',
  'Aperitivos',
  'Bebidas',
];

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todas las Recetas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPopularRecipes, setFilteredPopularRecipes] = useState(popularRecipes);
  const [filteredRecentRecipes, setFilteredRecentRecipes] = useState(recentlyAddedRecipes);
  const { isVisitor, exitVisitorMode } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Mostrar solo las 3 recetas más recientes
  const getLatestThreeRecipes = () => {
    // Ordenar por id descendente (simulando fecha de creación más reciente)
    const sorted = [...recentlyAddedRecipes].sort((a, b) => Number(b.id) - Number(a.id));
    return sorted.slice(0, 3);
  };

  // Aplicar filtro cuando cambia la categoría seleccionada
  React.useEffect(() => {
    filterRecipesByCategory(selectedCategory);
  }, [selectedCategory]);

  // Chequeo de conexión al iniciar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    checkConnection();
    return () => unsubscribe();
  }, []);

  // Filtrar recetas por categoría
  const filterRecipesByCategory = (category) => {
    if (category === 'Todas las Recetas') {
      setFilteredPopularRecipes(popularRecipes);
      setFilteredRecentRecipes(getLatestThreeRecipes());
    } else {
      setFilteredPopularRecipes(
        popularRecipes.filter(recipe => recipe.category === category)
      );
      setFilteredRecentRecipes(
        getLatestThreeRecipes().filter(recipe => recipe.category === category)
      );
    }
  };

  const handleRecipePress = (recipe) => {
    console.log('Navegando a receta desde HomeScreen:', JSON.stringify(recipe));
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleProfilePress = () => {
    if (isVisitor) {
      navigation.navigate('Login');
    } else {
      navigation.navigate('ProfileTab');
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.selectedCategoryButton,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderPopularRecipe = ({ item }) => (
    <RecipeCard
      id={item.id}
      title={item.title}
      imageUrl={item.imageUrl}
      time={item.time}
      type="grid"
      onPress={handleRecipePress}
      style={styles.popularRecipeCard}
    />
  );

  const renderOfflineMessage = () => (
    <View style={styles.offlineContainer}>
      <Icon name="wifi-off" size={24} color={Colors.error} />
      <Text style={styles.offlineText}>
        No hay conexión a internet. La aplicación no puede ser utilizada sin conexión.
      </Text>
    </View>
  );

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Icon name="wifi-off" size={48} color={Colors.error} />
          <Text style={styles.offlineText}>
            No hay conexión a internet. No se puede usar la aplicación.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
      {!isConnected && renderOfflineMessage()}
      
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>ChefNet</Text>
          <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={{ 
                uri: isVisitor 
                  ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
                  : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3'
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => navigation.navigate('RecipeSearch')}
          activeOpacity={0.8}
        >
          <Icon name="search" size={20} color={Colors.textMedium} style={styles.searchIcon} />
          <Text 
            style={[styles.searchInput, { color: Colors.textMedium }]}
            numberOfLines={1}
          >
            Buscar recetas, ingredientes...
          </Text>
        </TouchableOpacity>
        
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
      </LinearGradient>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isVisitor && (
          <View style={styles.visitorBanner}>
            <Text style={styles.visitorBannerText}>
              Estás navegando como visitante. Inicia sesión para acceder a todas las funciones.
            </Text>
            <TouchableOpacity
              style={styles.visitorBannerButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.visitorBannerButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recetas Populares</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecipeSearch')}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        
        {filteredPopularRecipes.length > 0 ? (
        <FlatList
            data={filteredPopularRecipes}
          renderItem={renderPopularRecipe}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularRecipesContainer}
        />
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No hay recetas en esta categoría</Text>
          </View>
        )}
        
        <Text style={[styles.sectionTitle, styles.recentTitle]}>
          Agregadas Recientemente
        </Text>
        
        {filteredRecentRecipes.length > 0 ? (
          filteredRecentRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
              id={recipe.id}
            title={recipe.title}
            imageUrl={recipe.imageUrl}
            time={recipe.time}
            tags={recipe.tags}
            type="list"
              onPress={handleRecipePress}
          />
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No hay recetas recientes en esta categoría</Text>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.largeSpacing,
  },
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Metrics.roundedFull,
    paddingHorizontal: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
    paddingVertical: Metrics.mediumSpacing,
  },
  searchIcon: {
    marginRight: Metrics.baseSpacing,
  },
  searchInput: {
    flex: 1,
    fontSize: Metrics.baseFontSize,
  },
  categoriesContainer: {
    paddingRight: Metrics.mediumSpacing,
  },
  categoryButton: {
    backgroundColor: Colors.card,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
    marginRight: Metrics.mediumSpacing,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    color: Colors.textDark,
    fontSize: Metrics.baseFontSize,
  },
  selectedCategoryText: {
    color: Colors.card,
  },
  content: {
    flex: 1,
    paddingHorizontal: Metrics.mediumSpacing,
    paddingTop: Metrics.mediumSpacing,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  sectionTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  seeAllText: {
    color: Colors.textDark,
    fontSize: Metrics.baseFontSize,
  },
  popularRecipesContainer: {
    paddingRight: Metrics.mediumSpacing,
  },
  popularRecipeCard: {
    width: 160,
    marginRight: Metrics.mediumSpacing,
  },
  recentTitle: {
    marginTop: Metrics.largeSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  bottomPadding: {
    height: Metrics.xxLargeSpacing,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.largeSpacing,
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    marginBottom: Metrics.mediumSpacing,
  },
  emptyStateText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  visitorBanner: {
    backgroundColor: Colors.primary + '10',
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visitorBannerText: {
    flex: 1,
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
    marginRight: Metrics.baseSpacing,
  },
  visitorBannerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Metrics.smallSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
  },
  visitorBannerButtonText: {
    color: Colors.card,
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineContainer: {
    backgroundColor: Colors.error + '10',
    padding: Metrics.mediumSpacing,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: Colors.error,
    marginLeft: Metrics.smallSpacing,
    textAlign: 'center',
  },
});

export default HomeScreen;