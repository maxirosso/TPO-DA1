import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';
import { Rating } from 'react-native-ratings';
import { useSelector, useDispatch } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { toggleFavorite } from '../../store/actions/recipeActions';
import { selectIsFavorite } from '../../store/selectors/recipeSelectors';
import { api } from '../../services/api';
import { mapBackendRecipe } from '../../services/dataService';

const { width } = Dimensions.get('window');

const RecipeDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { isVisitor } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [scaleModalVisible, setScaleModalVisible] = useState(false);
  const [scaleByIngredient, setScaleByIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Obtener el ID o datos iniciales de la receta de los parámetros de navegación
  const recipeFromParams = route.params?.recipe || {};
  
  // Get favorite status from Redux store
  const isFavorite = useSelector(state => selectIsFavorite(state, recipeFromParams.id));
  
  // Estado para almacenar los datos completos de la receta
  const [recipe, setRecipe] = useState({
    id: recipeFromParams.id || '0',
    title: recipeFromParams.title || 'Receta sin título',
    imageUrl: recipeFromParams.imageUrl || 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    rating: recipeFromParams.rating || 4.5,
    reviews: recipeFromParams.reviews || 0,
    cookTime: recipeFromParams.cookTime || 15,
    prepTime: recipeFromParams.prepTime || 10,
    servings: recipeFromParams.servings || 2,
    calories: recipeFromParams.calories || 300,
    protein: recipeFromParams.protein || 10,
    carbs: recipeFromParams.carbs || 30,
    fat: recipeFromParams.fat || 15,
    author: recipeFromParams.author || {
      name: 'Chef Anónimo',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    },
    description: recipeFromParams.description || 'Una deliciosa receta casera.',
    ingredients: recipeFromParams.ingredients || [],
    instructions: recipeFromParams.instructions || [],
    comments: recipeFromParams.comments || [],
    tags: recipeFromParams.tags || []
  });
  
  // Cargar los datos completos de la receta al montar el componente
  useEffect(() => {
    const loadRecipeDetails = async () => {
      try {
        setLoading(true);
        setError(''); // Reset error state
        
        // Verificar el ID recibido y normalizarlo si es necesario
        const recipeId = recipeFromParams.id ? String(recipeFromParams.id) : '';
        console.log('Loading recipe with ID:', recipeId, 'Full params:', JSON.stringify(recipeFromParams));
        
        // Si no hay ID, usar los datos que ya tenemos
        if (!recipeId) {
          console.log('No recipe ID provided, using default data');
          setLoading(false);
          return;
        }
        
        // Importar el objeto api correctamente
        const { api } = await import('../../services/api');
        // Obtener la receta completa usando el método correcto
        const response = await api.recipes.getById(recipeId);
        const fullRecipe = response?.data || response;
        
        // Verificar que la receta tiene todos los campos necesarios
        if (!fullRecipe || typeof fullRecipe !== 'object') {
          throw new Error('La receta cargada tiene un formato inválido');
        }
        
        console.log('Loaded full recipe:', fullRecipe.title, 'ID:', fullRecipe.id);
  
        // Actualizar el estado con los datos completos
        setRecipe(prevRecipe => ({
          ...prevRecipe,
          ...fullRecipe
        }));
      } catch (error) {
        console.error('Error al cargar los detalles de la receta:', error);
        setError(`No se pudo cargar la receta. ${error.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecipeDetails();
  }, [recipeFromParams.id]);
  
  const handleFavoriteToggle = async () => {
    try {
      setIsSubmitting(true);
      await dispatch(toggleFavorite(recipe.id));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = () => {
    setIsModalVisible(true);
  };

  const submitReview = async () => {
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para valorar recetas.');
      return;
    }
    
    if (!reviewText.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.ratings.add(recipe.id || recipe.idReceta, {
        calificacion: reviewRating,
        comentarios: reviewText
      });
      
      Alert.alert("Reseña enviada", "Tu reseña ha sido enviada y será revisada por nuestro equipo.");
      setIsModalVisible(false);
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'No se pudo enviar la reseña. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToShoppingList = async () => {
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para usar la lista de recetas.');
      return;
    }
    
    try {
      await api.recipeList.addById(recipe.id || recipe.idReceta);
      Alert.alert("Lista de compras", "Los ingredientes han sido agregados a tu lista de compras.");
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      Alert.alert('Error', 'No se pudo agregar a la lista. Intenta nuevamente.');
    }
  };

  const openScaleModal = () => {
    setScaleModalVisible(true);
  };

  const applyScaling = async () => {
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para usar la función de escalar recetas.');
      return;
    }
    
    try {
      let tipo;
      if (scaleFactor === 0.5) tipo = 'mitad';
      else if (scaleFactor === 2) tipo = 'doble';
      else tipo = 'porciones';
      
      const porciones = tipo === 'porciones' ? Math.round(recipe.servings * scaleFactor) : null;
      
      const response = await api.recipes.scale(
        recipe.id || recipe.idReceta, 
        tipo, 
        porciones
      );
      
      const scaledRecipe = mapBackendRecipe(response.data);
      setRecipe(scaledRecipe);
      setScaleModalVisible(false);
      setScaleFactor(1);
    } catch (error) {
      console.error('Error scaling recipe:', error);
      Alert.alert('Error', 'No se pudo escalar la receta. Intenta nuevamente.');
    }
  };

  const toggleScaleMethod = () => {
    setScaleByIngredient(!scaleByIngredient);
    setSelectedIngredient(null);
    setCustomAmount('');
  };

  const selectIngredient = (ingredient, index) => {
    setSelectedIngredient({...ingredient, index});
  };

  const scaleRecipeByIngredient = async () => {
    if (!selectedIngredient || !customAmount) return;
    
    try {
      const response = await api.recipes.scaleByIngredient(
        recipe.id || recipe.idReceta, 
        selectedIngredient.name, 
        parseFloat(customAmount)
      );
      
      const scaledRecipe = mapBackendRecipe(response.data);
      setRecipe(scaledRecipe);
      setScaleModalVisible(false);
      setScaleByIngredient(false);
      setSelectedIngredient(null);
      setCustomAmount('');
    } catch (error) {
      console.error('Error scaling recipe by ingredient:', error);
      Alert.alert('Error', 'No se pudo escalar la receta por ingrediente. Intenta nuevamente.');
    }
  };

  // Función auxiliar mejorada para escalar cantidades por persona
  const scaleAmount = (amount, factor) => {
    if (typeof amount !== 'string') return amount;
    
    // Si el campo amount está vacío (como para secciones de título), retornarlo tal cual
    if (amount === '' || !amount.trim()) return amount;
    
    // Detectar números en el string
    const match = amount.match(/^(\d+\/\d+|\d+\.\d+|\d+)(\s+)(.*)$/);
    if (!match) return amount;
    
    let num = match[1];
    const separator = match[2]; // Espacio entre número y unidad
    const rest = match[3];      // Unidad y resto del texto
    
    // Manejar fracciones
    if (num.includes('/')) {
      const [numerator, denominator] = num.split('/');
      num = parseInt(numerator) / parseInt(denominator);
    } else {
      num = parseFloat(num);
    }
    
    // Validar que num sea un número válido
    if (isNaN(num)) return amount;
    
    // Escalar el número
    let scaledNum = (num * factor).toFixed(2);
    
    // Eliminar ceros decimales innecesarios
    scaledNum = parseFloat(scaledNum);
    
    // Si es una fracción simple, intentamos representarla como fracción
    if (Math.abs(scaledNum - 0.5) < 0.01) return `1/2${separator}${rest}`;
    if (Math.abs(scaledNum - 0.25) < 0.01) return `1/4${separator}${rest}`;
    if (Math.abs(scaledNum - 0.75) < 0.01) return `3/4${separator}${rest}`;
    if (Math.abs(scaledNum - 0.33) < 0.01) return `1/3${separator}${rest}`;
    if (Math.abs(scaledNum - 0.67) < 0.01) return `2/3${separator}${rest}`;
    
    // Si es un número entero, eliminar el decimal
    if (Math.round(scaledNum) === scaledNum) {
      scaledNum = Math.round(scaledNum);
    }
    
    return `${scaledNum}${separator}${rest}`;
  };

  // Función mejorada para renderizar cada ingrediente con su cantidad escalada
  const renderIngredient = (item, index) => {
    // Validar que el ingrediente sea un objeto válido
    if (typeof item !== 'object' || item === null) {
      item = { name: String(item), amount: '', preparation: '' };
    }
    
    // Escalar la cantidad según el factor
    const scaledAmount = scaleByIngredient 
      ? item.amount 
      : scaleAmount(item.amount, scaleFactor);
    
    return (
      <View key={index} style={styles.ingredientItem}>
        <View style={styles.bulletPoint} />
        <View style={styles.ingredientTextContainer}>
          {scaledAmount && scaledAmount.trim() !== '' && (
          <Text style={styles.ingredientAmount}>{scaledAmount} </Text>
          )}
          <Text style={styles.ingredientName}>{item.name}</Text>
          {item.preparation && item.preparation.trim() !== '' && (
            <Text style={styles.ingredientPrep}>, {item.preparation}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderStepWithImage = (instruction, index) => (
    <View key={index} style={styles.instructionItem}>
      <View style={styles.instructionNumber}>
        <Text style={styles.instructionNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.instructionContent}>
        <Text style={styles.instructionText}>{instruction.text}</Text>
        {instruction.hasImage && (
          <Image 
            source={{uri: instruction.imageUrl}} 
            style={styles.stepImage}
            resizeMode="cover"
          />
        )}
      </View>
    </View>
  );
  
  const handleRating = async (rating) => {
    try {
      setUserRating(rating);
      // Here you would typically send the rating to your backend
      // await api.post(`/recipes/${recipe.id}/ratings`, { rating });
    } catch (error) {
      console.error('Rating error:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar la valoración. Por favor, intenta nuevamente.'
      );
    }
  };
  
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newComment = {
        id: Date.now(),
        text: comment,
        user: 'Current User', // Replace with actual user
        status: 'pending',
        date: new Date().toISOString(),
      };
      
      setComments(prevComments => [...prevComments, newComment]);
      setComment('');
      // Here you would typically send the comment to your backend
      // await api.post(`/recipes/${recipe.id}/comments`, { text: comment });
    } catch (error) {
      console.error('Comment error:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar el comentario. Por favor, intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando receta...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color={Colors.error} />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Volver atrás</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={Colors.card} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, isFavorite && styles.activeIconButton]}
              onPress={handleFavoriteToggle}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={Colors.card} />
              ) : (
                <Icon
                  name="heart"
                  size={20}
                  color={isFavorite ? Colors.error : Colors.card}
                  style={isFavorite ? { textShadowColor: Colors.error, textShadowRadius: 1 } : {}}
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => {
                Alert.alert('Compartir', 'Compartir esta receta por WhatsApp, Instagram, etc.');
              }}
            >
              <Icon name="share-2" size={20} color={Colors.card} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Image
          source={{ uri: recipe.imageUrl }}
          style={styles.recipeImage}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          <View style={styles.authorRow}>
            <View style={styles.authorInfo}>
              <Image
                source={{ uri: recipe.author?.avatar }}
                style={styles.authorAvatar}
              />
              <Text style={styles.authorName}>por {recipe.author?.name}</Text>
            </View>
            
            <TouchableOpacity onPress={openReviewModal}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={Colors.warning} />
                <Text style={styles.ratingText}>
                  {recipe.rating} ({recipe.reviews})
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.description}>{recipe.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="clock" size={20} color={Colors.primary} />
                  <Text style={styles.statValue}>
                    {Math.round((recipe.prepTime + recipe.cookTime) * scaleFactor)} min
                  </Text>
              <Text style={styles.statLabel}>Tiempo Total</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="users" size={20} color={Colors.primary} />
                  <Text style={styles.statValue}>
                    {Math.round(recipe.servings * scaleFactor)}
                  </Text>
              <Text style={styles.statLabel}>Porciones</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="activity" size={20} color={Colors.primary} />
                  <Text style={styles.statValue}>
                    {Math.round(recipe.calories * scaleFactor / recipe.servings)}
                  </Text>
                  <Text style={styles.statLabel}>Calorías/porción</Text>
            </View>
          </View>
          
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {Math.round(recipe.protein * scaleFactor / recipe.servings)}g
                  </Text>
              <Text style={styles.nutritionLabel}>Proteína</Text>
            </View>
            
            <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {Math.round(recipe.carbs * scaleFactor / recipe.servings)}g
                  </Text>
              <Text style={styles.nutritionLabel}>Carbohidratos</Text>
            </View>
            
            <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {Math.round(recipe.fat * scaleFactor / recipe.servings)}g
                  </Text>
              <Text style={styles.nutritionLabel}>Grasa</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={openScaleModal}>
              <Icon name="refresh-cw" size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Escalar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={addToShoppingList}>
              <Icon name="shopping-cart" size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Compras</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                Alert.alert('Guardar', 'Guardar esta receta a tu colección');
              }}
            >
              <Icon name="bookmark" size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'ingredients' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('ingredients')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'ingredients' && styles.activeTabText,
                ]}
              >
                Ingredientes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'instructions' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('instructions')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'instructions' && styles.activeTabText,
                ]}
              >
                Instrucciones
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'reviews' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'reviews' && styles.activeTabText,
                ]}
              >
                Reseñas
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'ingredients' && (
            <View style={styles.ingredientsContainer}>
              <View style={styles.servingInfo}>
                <Text style={styles.servingText}>
                  Para <Text style={styles.servingCount}>{Math.round(recipe.servings * scaleFactor)}</Text> {Math.round(recipe.servings * scaleFactor) === 1 ? 'persona' : 'personas'}
                </Text>
                {!scaleByIngredient && (
                  <TouchableOpacity onPress={openScaleModal}>
                    <Text style={styles.servingModifier}>Modificar</Text>
                  </TouchableOpacity>
                )}
              </View>
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ingredient, index) => renderIngredient(ingredient, index))
                  ) : (
                    <Text style={styles.emptyMessage}>No hay ingredientes disponibles para esta receta.</Text>
                  )}
            </View>
          )}
          
          {activeTab === 'instructions' && (
            <View style={styles.instructionsContainer}>
                  {recipe.instructions && recipe.instructions.length > 0 ? (
                    recipe.instructions.map((instruction, index) => renderStepWithImage(instruction, index))
                  ) : (
                    <Text style={styles.emptyMessage}>No hay instrucciones disponibles para esta receta.</Text>
                  )}
            </View>
          )}
          
          {activeTab === 'reviews' && (
            <View style={styles.reviewsContainer}>
              <TouchableOpacity 
                style={styles.addReviewButton}
                onPress={openReviewModal}
              >
                <Icon name="edit-2" size={16} color={Colors.primary} />
                <Text style={styles.addReviewText}>Añadir reseña</Text>
              </TouchableOpacity>
              
                  {recipe.comments && recipe.comments.length > 0 ? (
                    recipe.comments.map((comment, index) => (
                <View key={index} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUser}>
                      <Image source={{uri: comment.avatar}} style={styles.reviewAvatar} />
                      <View>
                        <Text style={styles.reviewUserName}>{comment.user}</Text>
                        <Text style={styles.reviewDate}>{comment.date}</Text>
                      </View>
                    </View>
                    <View style={styles.reviewRating}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <Icon 
                          key={i}
                          name="star" 
                          size={14} 
                          color={i <= comment.rating ? Colors.warning : Colors.textLight} 
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{comment.text}</Text>
                </View>
                    ))
                  ) : (
                    <Text style={styles.emptyMessage}>No hay reseñas disponibles para esta receta. ¡Sé el primero en comentar!</Text>
                  )}
            </View>
          )}
          
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Valorar Receta</Text>
            <Rating
              showRating
              onFinishRating={handleRating}
              style={styles.rating}
              startingValue={userRating}
              readonly={isSubmitting}
            />
          </View>
          
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comentarios</Text>
            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentTextInput}
                placeholder="Escribe tu comentario..."
                value={comment}
                onChangeText={setComment}
                multiline
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={[
                  styles.commentButton,
                  isSubmitting && styles.commentButtonDisabled
                ]}
                onPress={handleAddComment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.card} />
                ) : (
                  <Text style={styles.commentButtonText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={comments}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentUser}>{item.user}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                  {item.status === 'pending' && (
                    <Text style={styles.commentStatus}>Pendiente de aprobación</Text>
                  )}
                </View>
              )}
              keyExtractor={item => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.emptyCommentsText}>
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </Text>
              }
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Comenzar a Cocinar"
          iconName="play-circle"
          onPress={() => {
            Alert.alert("Comenzar", "¡Buena suerte con tu preparación!");
          }}
          style={styles.startButton}
          fullWidth
        />
      </View>
      
      {/* Modal para añadir reseña */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Calificar Receta</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Icon name="x" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.ratingLabel}>Tu calificación:</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity 
                  key={i}
                  onPress={() => setReviewRating(i)}
                >
                  <Icon 
                    name="star" 
                    size={28} 
                    color={i <= reviewRating ? Colors.warning : Colors.textLight} 
                    style={{marginHorizontal: 5}}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.reviewLabel}>Tu comentario:</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Escribe tu comentario sobre esta receta..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={4}
            />
            
            <Button
              title="Enviar Reseña"
              onPress={submitReview}
              style={styles.submitReviewButton}
              fullWidth
            />
          </View>
        </View>
      </Modal>
      
      {/* Modal para escalar receta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={scaleModalVisible}
        onRequestClose={() => setScaleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escalar Receta</Text>
              <TouchableOpacity onPress={() => setScaleModalVisible(false)}>
                <Icon name="x" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scaleTypeToggle}>
              <TouchableOpacity 
                style={[
                  styles.scaleTypeButton, 
                  !scaleByIngredient && styles.activeScaleTypeButton
                ]}
                onPress={() => toggleScaleMethod()}
              >
                <Text style={!scaleByIngredient ? styles.activeScaleTypeText : styles.scaleTypeText}>
                  Por porciones
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.scaleTypeButton, 
                  scaleByIngredient && styles.activeScaleTypeButton
                ]}
                onPress={() => toggleScaleMethod()}
              >
                <Text style={scaleByIngredient ? styles.activeScaleTypeText : styles.scaleTypeText}>
                  Por ingrediente
                </Text>
              </TouchableOpacity>
            </View>
            
            {!scaleByIngredient ? (
              <View style={styles.scaleByPortionContainer}>
                <Text style={styles.scaleLabel}>
                  Ajustar porciones: <Text style={styles.scaleValue}>{Math.round(recipe.servings * scaleFactor)}</Text>
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.5}
                  maximumValue={10}
                  step={0.5}
                  value={scaleFactor}
                  onValueChange={setScaleFactor}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.textLight}
                  thumbTintColor={Colors.primary}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderMinLabel}>½×</Text>
                  <Text style={styles.sliderMaxLabel}>10×</Text>
                </View>
                
                <Button
                  title="Aplicar"
                  onPress={applyScaling}
                  style={styles.applyScaleButton}
                  fullWidth
                />
              </View>
            ) : (
              <View style={styles.scaleByIngredientContainer}>
                <Text style={styles.scaleLabel}>Selecciona un ingrediente:</Text>
                <ScrollView style={styles.ingredientSelector}>
                  {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={[
                        styles.selectableIngredient,
                        selectedIngredient?.index === index && styles.selectedIngredient
                      ]}
                      onPress={() => selectIngredient(ingredient, index)}
                    >
                      <Text style={styles.selectableIngredientText}>
                        <Text style={styles.ingredientAmount}>{ingredient.amount} </Text>
                        {ingredient.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {selectedIngredient && (
                  <View style={styles.customAmountContainer}>
                    <Text style={styles.customAmountLabel}>Nueva cantidad:</Text>
                    <TextInput
                      style={styles.customAmountInput}
                      value={customAmount}
                      onChangeText={setCustomAmount}
                      placeholder={`Ej: 2 tazas de ${selectedIngredient.name}`}
                    />
                  </View>
                )}
                
                <Button
                  title="Aplicar"
                  onPress={scaleRecipeByIngredient}
                  style={styles.applyScaleButton}
                  disabled={!selectedIngredient || !customAmount}
                  fullWidth
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    position: 'absolute',
    top: Metrics.mediumSpacing,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Metrics.mediumSpacing,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Metrics.baseSpacing,
  },
  activeIconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  recipeImage: {
    width,
    height: 300,
  },
  content: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: Metrics.mediumSpacing,
    paddingTop: Metrics.mediumSpacing,
    paddingBottom: 80,
  },
  title: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: Metrics.baseSpacing,
  },
  authorName: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
    marginLeft: 4,
  },
  description: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.mediumSpacing,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textMedium,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    height: '80%',
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Metrics.mediumSpacing,
  },
  nutritionItem: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    flex: 1,
    marginHorizontal: 4,
  },
  nutritionValue: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  nutritionLabel: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textMedium,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Metrics.mediumSpacing,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    paddingVertical: Metrics.baseSpacing,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Metrics.mediumSpacing,
  },
  tab: {
    paddingVertical: Metrics.baseSpacing,
    marginRight: Metrics.xLargeSpacing,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textMedium,
  },
  activeTabText: {
    color: Colors.primary,
  },
  ingredientsContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  servingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  servingText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  servingHighlight: {
    fontWeight: '600',
    color: Colors.primary,
  },
  servingModifier: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Metrics.baseSpacing,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Metrics.baseSpacing,
    marginTop: 8,
  },
  ingredientTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  ingredientAmount: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  ingredientPrep: {
    fontSize: Metrics.baseFontSize,
    fontStyle: 'italic',
    color: Colors.textMedium,
  },
  instructionsContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: Metrics.mediumSpacing,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.baseSpacing,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '600',
    color: Colors.card,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: 8,
  },
  stepImage: {
    width: '100%',
    height: 180,
    borderRadius: Metrics.baseBorderRadius,
    marginTop: 8,
  },
  reviewsContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: Metrics.mediumSpacing,
  },
  addReviewText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  reviewItem: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: Metrics.baseSpacing,
  },
  reviewUserName: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  reviewDate: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textMedium,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    lineHeight: Metrics.mediumLineHeight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    padding: Metrics.mediumSpacing,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: {
    height: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: Metrics.mediumSpacing,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  modalTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  ratingLabel: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  reviewLabel: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  reviewInput: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    textAlignVertical: 'top',
    height: 120,
    marginBottom: Metrics.mediumSpacing,
    color: Colors.textDark,
  },
  submitReviewButton: {
    height: 50,
  },
  scaleTypeToggle: {
    flexDirection: 'row',
    marginBottom: Metrics.mediumSpacing,
  },
  scaleTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Metrics.baseSpacing,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  activeScaleTypeButton: {
    borderBottomColor: Colors.primary,
  },
  scaleTypeText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  activeScaleTypeText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.primary,
  },
  scaleByPortionContainer: {
    paddingVertical: Metrics.mediumSpacing,
  },
  scaleLabel: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
  },
  scaleValue: {
    fontWeight: '600',
    color: Colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Metrics.largeSpacing,
  },
  sliderMinLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  sliderMaxLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  scaleByIngredientContainer: {
    paddingVertical: Metrics.mediumSpacing,
  },
  ingredientSelector: {
    maxHeight: 200,
    marginBottom: Metrics.mediumSpacing,
  },
  selectableIngredient: {
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: 4,
  },
  selectedIngredient: {
    backgroundColor: Colors.primary + '20',
  },
  selectableIngredientText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  customAmountContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  customAmountLabel: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  customAmountInput: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.baseSpacing,
    color: Colors.textDark,
  },
  applyScaleButton: {
    height: 50,
  },
  emptyMessage: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    marginTop: Metrics.mediumSpacing,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    marginTop: Metrics.mediumSpacing,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Metrics.mediumSpacing,
  },
  errorTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.error,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  errorText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginTop: Metrics.mediumSpacing,
  },
  errorButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.card,
    fontWeight: '500',
  },
  ratingSection: {
    padding: Metrics.mediumSpacing,
    backgroundColor: Colors.card,
    marginBottom: Metrics.mediumSpacing,
    borderRadius: Metrics.mediumBorderRadius,
  },
  rating: {
    paddingVertical: Metrics.smallSpacing,
  },
  commentsSection: {
    padding: Metrics.mediumSpacing,
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
  },
  commentInput: {
    flexDirection: 'row',
    marginBottom: Metrics.mediumSpacing,
  },
  commentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.smallSpacing,
    marginRight: Metrics.smallSpacing,
    minHeight: 40,
  },
  commentButton: {
    backgroundColor: Colors.primary,
    padding: Metrics.smallSpacing,
    borderRadius: Metrics.mediumBorderRadius,
    justifyContent: 'center',
    minWidth: 80,
  },
  commentButtonDisabled: {
    opacity: 0.7,
  },
  commentButtonText: {
    color: Colors.card,
    fontWeight: '500',
    textAlign: 'center',
  },
  commentItem: {
    padding: Metrics.smallSpacing,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  commentUser: {
    fontWeight: '500',
    marginBottom: Metrics.smallSpacing,
  },
  commentText: {
    marginBottom: Metrics.smallSpacing,
  },
  commentDate: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textLight,
  },
  commentStatus: {
    fontSize: Metrics.smallFontSize,
    color: Colors.warning,
    marginTop: Metrics.smallSpacing,
  },
  emptyCommentsText: {
    textAlign: 'center',
    color: Colors.textLight,
    padding: Metrics.mediumSpacing,
  },
});

export default RecipeDetailScreen;