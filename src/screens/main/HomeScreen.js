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
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RecipeCard from '../../components/recipe/RecipeCard';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { AuthContext } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import { api } from '../../services/api';

// Categoría por defecto
const DEFAULT_CATEGORY = 'Todas las Recetas';

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [latestRecipes, setLatestRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [filteredPopularRecipes, setFilteredPopularRecipes] = useState([]);
  const [filteredRecentRecipes, setFilteredRecentRecipes] = useState([]);
  const { isVisitor, exitVisitorMode, user: contextUser } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [recipeTypes, setRecipeTypes] = useState([]);
  const [categories, setCategories] = useState([DEFAULT_CATEGORY]);
  const [currentUser, setCurrentUser] = useState(null);

  // Inicializar servicio de datos y cargar recetas
  useEffect(() => {
    initializeData();
    setupNetworkListener();
    loadCurrentUser();
  }, [contextUser]);

  const loadCurrentUser = async () => {
    try {
      // First try to get user from context (active session)
      if (contextUser) {
        setCurrentUser(contextUser);
        return;
      }

      // Fallback to AsyncStorage
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      }
    } catch (error) {
      console.log('Error loading current user:', error);
    }
  };

  // Check if user can upgrade to student
  const canUpgradeToStudent = () => {
    return currentUser && currentUser.tipo === 'comun';
  };

  // Handle upgrade to student
  const handleUpgradeToStudent = () => {
    console.log('🔍 Debug - contextUser:', contextUser);
    console.log('🔍 Debug - currentUser:', currentUser);
    let userId = contextUser?.idUsuario || contextUser?.id || currentUser?.idUsuario || currentUser?.id;
    
    // Si no hay userId válido, usar el email del usuario como identificador temporal
    if (!userId || userId === 'undefined' || userId === null) {
      userId = contextUser?.mail || contextUser?.email || currentUser?.mail || currentUser?.email || 'temp_' + Date.now();
    }
    
    console.log('🔍 Debug - final userId to send:', userId);
    navigation.navigate('UpgradeToStudent', { 
      userId: userId,
      userEmail: contextUser?.mail || contextUser?.email || currentUser?.mail || currentUser?.email
    });
  };

  const initializeData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Inicializando conexión con backend...');
      
      // Inicializar servicio de datos
      await dataService.initialize();
      setBackendAvailable(dataService.useBackend);
      
      console.log(`Backend disponible: ${dataService.useBackend}`);

      // Cargar tipos de recetas
      console.log('Cargando tipos de recetas...');
      await loadRecipeTypes();

      // Cargar últimas recetas (3 más recientes)
      console.log('Cargando últimas recetas...');
      const latest = await dataService.getLatestRecipes();
      console.log(`Últimas recetas cargadas: ${latest?.length || 0}`);
      setLatestRecipes(latest || []);

      // Cargar todas las recetas para la sección popular
      console.log('Cargando todas las recetas...');
      const allRecipes = await dataService.getAllRecipes();
      console.log(`Todas las recetas cargadas: ${allRecipes?.length || 0}`);
      setPopularRecipes(allRecipes || []);

      // Aplicar filtro inicial
      filterRecipesByCategory(selectedCategory, latest || [], allRecipes || []);

    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
      
      // Mostrar mensaje de error amigable para el usuario
      Alert.alert(
        'Error de Conexión',
        'No se pudieron cargar las recetas desde el servidor. Usando datos locales.',
        [
          { 
            text: 'Reintentar', 
            onPress: () => initializeData() 
          },
          { 
            text: 'Continuar', 
            style: 'cancel' 
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecipeTypes = async () => {
    try {
      // Usar la API para obtener los tipos de recetas
      const response = await api.recipes.getTypes();
      if (response && response.data) {
        const types = response.data;
        console.log(`Tipos de recetas cargados: ${types.length}`);
        
        // Guardar los tipos de recetas
        setRecipeTypes(types);
        
        // Crear la lista de categorías con "Todas las Recetas" al inicio
        const categoryList = [DEFAULT_CATEGORY];
        types.forEach(type => {
          if (type.descripcion) {
            categoryList.push(type.descripcion);
          }
        });
        
        setCategories(categoryList);
      } else {
        console.log('No se pudieron cargar los tipos de recetas');
        // Fallback a categorías predefinidas
        setCategories([
          DEFAULT_CATEGORY,
          'Postres',
          'Ensaladas',
          'Sopas',
          'Cena',
          'Desayuno',
          'Almuerzo',
        ]);
      }
    } catch (error) {
      console.error('Error loading recipe types:', error);
      // Fallback a categorías predefinidas
      setCategories([
        DEFAULT_CATEGORY,
        'Postres',
        'Ensaladas',
        'Sopas',
        'Cena',
        'Desayuno',
        'Almuerzo',
      ]);
    }
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log(`Estado de conexión: ${state.isConnected}`);
      setIsConnected(state.isConnected);
      
      // Si la conexión se restaura, intentar sincronizar datos
      if (state.isConnected && !backendAvailable) {
        console.log('Conexión restaurada, verificando backend...');
        dataService.checkBackendAvailability().then(available => {
          if (available) {
            console.log('Backend disponible, sincronizando datos...');
            setBackendAvailable(true);
            dataService.syncPendingData();
            loadRecipes();
          }
        });
      }
    });

    return unsubscribe;
  };

  const loadRecipes = async () => {
    try {
      console.log('Recargando recetas...');
      
      // Recargar tipos de recetas
      await loadRecipeTypes();
      
      const latest = await dataService.getLatestRecipes();
      const allRecipes = await dataService.getAllRecipes();
      
      setLatestRecipes(latest || []);
      setPopularRecipes(allRecipes || []);
      
      // Aplicar filtros actuales
      filterRecipesByCategory(selectedCategory, latest || [], allRecipes || []);
      
      console.log('Recetas recargadas exitosamente');
    } catch (error) {
      console.error('Error reloading recipes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecipes();
    setRefreshing(false);
  };

  // Aplicar filtro cuando cambia la categoría seleccionada
  useEffect(() => {
    filterRecipesByCategory(selectedCategory, latestRecipes, popularRecipes);
  }, [selectedCategory, popularRecipes, latestRecipes]);

  // Filtrar recetas por categoría
  const filterRecipesByCategory = (category, latest = latestRecipes, popular = popularRecipes) => {
    console.log(`Filtrando por categoría: ${category}`);
    
    if (category === DEFAULT_CATEGORY) {
      setFilteredPopularRecipes(popular);
      setFilteredRecentRecipes(latest);
    } else {
      const categoryFilter = (recipe) => {
        // Manejar diferentes estructuras de datos del backend vs mock
        const recipeCategory = recipe.tipoReceta?.descripcion || 
                              recipe.idTipo?.descripcion || 
                              recipe.tipo?.descripcion || 
                              recipe.category;
        
        return recipeCategory === category;
      };
      
      const filteredPopular = popular.filter(categoryFilter);
      const filteredLatest = latest.filter(categoryFilter);
      
      console.log(`Recetas populares filtradas: ${filteredPopular.length}`);
      console.log(`Recetas recientes filtradas: ${filteredLatest.length}`);
      
      setFilteredPopularRecipes(filteredPopular);
      setFilteredRecentRecipes(filteredLatest);
    }
  };

  const handleRecipePress = (recipe) => {
    console.log('Navegando a receta:', recipe.nombreReceta || recipe.title);
    
    // Normalizar datos de receta para navegación
    const normalizedRecipe = {
      id: recipe.idReceta || recipe.id,
      title: recipe.nombreReceta || recipe.title,
      imageUrl: recipe.fotoPrincipal || recipe.imageUrl,
      description: recipe.descripcionReceta || recipe.description,
      servings: recipe.porciones || recipe.servings,

      ingredients: recipe.ingredientes || recipe.ingredients || [],
      instructions: recipe.pasos || recipe.instructions || [],
      author: recipe.usuario || recipe.author,
      category: recipe.tipoReceta?.descripcion || recipe.category,
      rating: recipe.calificacionPromedio || recipe.rating,
      reviews: recipe.calificaciones || recipe.reviews || [],
    };

    navigation.navigate('RecipeDetail', { recipe: normalizedRecipe });
  };

  const handleProfilePress = () => {
    if (isVisitor) {
      exitVisitorMode();
    } else {
      navigation.navigate('ProfileTab');
    }
  };

  const handleSearchPress = () => {
    navigation.navigate('RecipeSearch');
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategoryItem,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderPopularRecipe = ({ item }) => (
    <RecipeCard
      id={item.idReceta || item.id}
      title={item.nombreReceta || item.title}
      imageUrl={item.fotoPrincipal || item.imageUrl}
      category={item.tipoReceta?.descripcion || item.category}
      rating={item.calificacionPromedio || item.rating}
      type="grid"
      onPress={() => handleRecipePress(item)}
    />
  );

  const renderRecentRecipe = ({ item }) => (
    <RecipeCard
      id={item.idReceta || item.id}
      title={item.nombreReceta || item.title}
      imageUrl={item.fotoPrincipal || item.imageUrl}
      tags={item.tags || [item.tipoReceta?.descripcion || item.category]}
      rating={item.calificacionPromedio || item.rating}
      type="list"
      onPress={() => handleRecipePress(item)}
    />
  );

  const renderOfflineMessage = () => (
    <View style={styles.offlineContainer}>
      <Icon name="wifi-off" size={48} color={Colors.error} />
      <Text style={styles.offlineTitle}>Sin Conexión</Text>
      <Text style={styles.offlineText}>
        No se puede usar la aplicación sin conexión a internet.
        {'\n'}Verifica tu conexión e intenta nuevamente.
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={initializeData}
      >
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <View style={styles.connectionBanner}>
          <Icon name="wifi-off" size={16} color={Colors.error} />
          <Text style={styles.connectionText}>Sin conexión - Usando datos locales</Text>
        </View>
      );
    } else if (!backendAvailable) {
      return (
        <View style={[styles.connectionBanner, { backgroundColor: Colors.warning + '20' }]}>
          <Icon name="server" size={16} color={Colors.warning} />
          <Text style={[styles.connectionText, { color: Colors.warning }]}>
            Servidor no disponible - Usando datos locales
          </Text>
        </View>
      );
    } else if (backendAvailable) {
      return (
        <View style={[styles.connectionBanner, { backgroundColor: Colors.success + '20' }]}>
          <Icon name="check-circle" size={16} color={Colors.success} />
          <Text style={[styles.connectionText, { color: Colors.success }]}>
            Conectado al servidor
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderEmptyState = (message) => (
    <View style={styles.emptySection}>
      <Icon name="search" size={32} color={Colors.textMedium} />
      <Text style={styles.emptyText}>{message}</Text>
      {!backendAvailable && (
        <TouchableOpacity style={styles.retryButton} onPress={initializeData}>
          <Text style={styles.retryButtonText}>Reintentar conexión</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Mostrar mensaje sin conexión si no hay conexión y no hay datos en caché
  if (!isConnected && latestRecipes.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
        {renderOfflineMessage()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
      {/* {renderConnectionStatus()} */}

      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>¡Hola!</Text>
            <Text style={styles.welcomeSubtext}>
              {isVisitor ? 'Modo Visitante' : '¿Qué vamos a cocinar hoy?'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Icon
              name={isVisitor ? 'log-in' : 'user'}
              size={24}
              color={Colors.textDark}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress}>
          <Icon name="search" size={20} color={Colors.textMedium} />
          <Text style={styles.searchPlaceholder}>
            Buscar recetas, ingredientes...
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Upgrade to Student Section */}
      {canUpgradeToStudent() && (
        <View style={styles.upgradeSection}>
          <LinearGradient
            colors={[Colors.primary + '10', Colors.primary + '05']}
            style={styles.upgradeCard}
          >
            <View style={styles.upgradeContent}>
              <View style={styles.upgradeIconContainer}>
                <Icon name="graduation-cap" size={32} color={Colors.primary} />
              </View>
              <View style={styles.upgradeTextContainer}>
                <Text style={styles.upgradeTitle}>¡Conviértete en Alumno!</Text>
                <Text style={styles.upgradeDescription}>
                  Accede a cursos premium y contenido exclusivo. Solo se cobra cuando te inscribas a un curso.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgradeToStudent}
              >
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
                <Icon name="arrow-right" size={16} color={Colors.card} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Categorías */}
        <View style={styles.categoriesSection}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              {backendAvailable ? 'Cargando recetas del servidor...' : 'Cargando datos locales...'}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color={Colors.error} />
            <Text style={styles.errorTitle}>Error de Conexión</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={initializeData}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Últimas Recetas */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Últimas Recetas</Text>
                <Text style={styles.sectionSubtitle}>
                  {backendAvailable 
                    ? `${filteredRecentRecipes.length} recetas de la comunidad` 
                    : 'Datos locales'
                  }
                </Text>
              </View>
              
              {filteredRecentRecipes.length > 0 ? (
                <FlatList
                  data={filteredRecentRecipes}
                  renderItem={renderRecentRecipe}
                  keyExtractor={(item) => (item.idReceta || item.id).toString()}
                  scrollEnabled={false}
                />
              ) : (
                renderEmptyState('No hay recetas recientes para esta categoría')
              )}
            </View>

            {/* Recetas Populares */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recetas Populares</Text>
                <Text style={styles.sectionSubtitle}>
                  {backendAvailable 
                    ? `${filteredPopularRecipes.length} recetas disponibles` 
                    : 'Datos locales'
                  }
                </Text>
              </View>
              
              {filteredPopularRecipes.length > 0 ? (
                <FlatList
                  data={filteredPopularRecipes}
                  renderItem={renderPopularRecipe}
                  keyExtractor={(item) => (item.idReceta || item.id).toString()}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.recipeRow}
                />
              ) : (
                renderEmptyState('No hay recetas populares para esta categoría')
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  connectionBanner: {
    backgroundColor: Colors.error + '20',
    paddingVertical: Metrics.smallSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.error,
    marginLeft: Metrics.smallSpacing,
    fontWeight: '500',
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
    marginBottom: Metrics.mediumSpacing,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Metrics.roundedFull,
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.mediumSpacing,
  },
  searchPlaceholder: {
    marginLeft: Metrics.baseSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  categoriesSection: {
    paddingVertical: Metrics.mediumSpacing,
  },
  categoriesList: {
    paddingHorizontal: Metrics.mediumSpacing,
  },
  categoryItem: {
    backgroundColor: Colors.card,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
    marginRight: Metrics.baseSpacing,
  },
  selectedCategoryItem: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: Colors.card,
  },
  section: {
    marginBottom: Metrics.largeSpacing,
  },
  sectionHeader: {
    paddingHorizontal: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  sectionTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  recipeRow: {
    justifyContent: 'space-between',
    paddingHorizontal: Metrics.mediumSpacing,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Metrics.xLargeSpacing,
  },
  loadingText: {
    marginTop: Metrics.mediumSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Metrics.xLargeSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
  },
  errorTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  errorText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    marginBottom: Metrics.largeSpacing,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: Metrics.largeSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
  },
  emptyText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  offlineContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Metrics.largeSpacing,
  },
  offlineTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  offlineText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.largeSpacing,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Metrics.mediumSpacing,
    paddingHorizontal: Metrics.largeSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  retryButtonText: {
    color: Colors.card,
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
  },
  upgradeSection: {
    paddingVertical: Metrics.mediumSpacing,
  },
  upgradeCard: {
    padding: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeIconContainer: {
    backgroundColor: Colors.card,
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.roundedFull,
    marginRight: Metrics.mediumSpacing,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Metrics.mediumSpacing,
    paddingHorizontal: Metrics.largeSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  upgradeButtonText: {
    color: Colors.card,
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    marginRight: Metrics.baseSpacing,
  },
});

export default HomeScreen;