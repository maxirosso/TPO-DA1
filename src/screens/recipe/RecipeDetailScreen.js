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
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { toggleFavorite } from '../../store/actions/recipeActions';
import { selectIsFavorite } from '../../store/selectors/recipeSelectors';
import { api } from '../../services/api';
import dataService, { mapBackendRecipe } from '../../services/dataService';

const { width } = Dimensions.get('window');

const RecipeDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { isVisitor, user } = useContext(AuthContext);
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
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addingToPendingList, setAddingToPendingList] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Obtener el ID o datos iniciales de la receta de los parámetros de navegación
  const recipeFromParams = route.params?.recipe || {};
  
  // Get favorite status from Redux store
  const isFavorite = useSelector(state => selectIsFavorite(state, recipeFromParams.id));
  
  // Estado para almacenar los datos completos de la receta
  const [recipe, setRecipe] = useState({
    id: recipeFromParams.id || '0',
    title: recipeFromParams.title || 'Receta sin título',
    imageUrl: recipeFromParams.imageUrl || null,
    rating: recipeFromParams.rating || 4.5,
    reviews: recipeFromParams.reviews || 0,

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
          ...fullRecipe,
          // Asegurar valores numéricos válidos

          servings: safeNumber(fullRecipe.servings || fullRecipe.porciones, 2),
          calories: safeNumber(fullRecipe.calories, 300),
          protein: safeNumber(fullRecipe.protein, 10),
          carbs: safeNumber(fullRecipe.carbs, 30),
          fat: safeNumber(fullRecipe.fat, 15),
          rating: safeNumber(fullRecipe.rating || fullRecipe.calificacionPromedio, 4.5),
          reviews: safeNumber(fullRecipe.reviews || fullRecipe.totalCalificaciones, 0),
          // Mapear correctamente ingredientes e instrucciones del backend
          ingredients: fullRecipe.ingredientes ? fullRecipe.ingredientes.map(ing => ({
            name: ing.nombre,
            amount: ing.cantidad ? `${ing.cantidad} ${ing.unidadMedida || ''}`.trim() : '',
            preparation: ''
          })) : (fullRecipe.ingredients || []),
          instructions: fullRecipe.instrucciones ? 
            fullRecipe.instrucciones.split('\n').filter(step => step.trim()).map((step, index) => ({
              step: index + 1,
              text: step.trim(),
              hasImage: false
            })) : (fullRecipe.instructions || [])
        }));

        // Cargar reseñas y comentarios después de cargar la receta
        await loadRecipeReviews();
      } catch (error) {
        console.error('Error al cargar los detalles de la receta:', error);
        setError(`No se pudo cargar la receta. ${error.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecipeDetails();
  }, [recipeFromParams.id]);
  
  // Cargar valoración del usuario cuando cambie la información del usuario o la receta
  useEffect(() => {
    if (!isVisitor && user && user.idUsuario && recipe.id) {
      loadRecipeReviews();
      checkIfSaved();
    }
  }, [user?.idUsuario, recipe.id]);
  
  const handleFavoriteToggle = async () => {
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para guardar recetas como favoritas.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await dispatch(toggleFavorite(recipe.id));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkIfSaved = async () => {
    if (isVisitor || !user || !recipe.id) {
      console.log('No se puede verificar si la receta está guardada: usuario invitado o sin ID de receta');
      return;
    }
    
    try {
      console.log(`Verificando si la receta ${recipe.id} está guardada para el usuario ${user.idUsuario}`);
      // Obtener recetas guardadas del usuario
      const response = await api.savedRecipes.get();
      console.log('Respuesta de recetas guardadas:', response);
      
      const { data } = response;
      
      // Verificar si la receta actual está en la lista de guardadas
      if (data && Array.isArray(data)) {
        console.log(`Receta actual ID: ${recipe.id}`);
        console.log('IDs de recetas guardadas:', data.map(r => r.idReceta));
        
        const found = data.some(savedRecipe => 
          savedRecipe.idReceta == recipe.id || savedRecipe.id == recipe.id
        );
        console.log(`¿Receta encontrada en guardadas?: ${found}`);
        setIsSaved(found);
      } else {
        console.log('No se recibieron datos de recetas guardadas o no es un array');
      }
    } catch (error) {
      console.error('Error checking if recipe is saved:', error);
    }
  };

  const saveRecipe = async () => {
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para guardar recetas.');
      return;
    }
    
    try {
      setSavingRecipe(true);
      
      if (isSaved) {
        // Si ya está guardada, eliminarla
        console.log(`Eliminando receta ${recipe.id} de guardadas`);
        const removeResponse = await api.savedRecipes.remove(recipe.id);
        console.log('Respuesta al eliminar receta:', removeResponse);
        
        setIsSaved(false);
        Alert.alert('Receta eliminada', 'La receta ha sido eliminada de tu colección');
      } else {
        // Si no está guardada, guardarla
        console.log(`Guardando receta ${recipe.id} para el usuario ${user?.idUsuario}`);
        const saveResponse = await api.savedRecipes.save(recipe.id);
        console.log('Respuesta al guardar receta:', saveResponse);
        
        setIsSaved(true);
        Alert.alert('Receta guardada', 'La receta ha sido guardada en tu colección');
        
        // Actualizar las recetas guardadas localmente (para fallback)
        try {
          console.log('Actualizando recetas guardadas localmente');
          const savedStr = await AsyncStorage.getItem('saved_recipes');
          const saved = savedStr ? JSON.parse(savedStr) : [];
          console.log('Recetas guardadas actuales:', saved);
          
          if (!saved.some(r => r.id === recipe.id)) {
            const recipeToSave = {
              id: recipe.id,
              title: recipe.title,
              imageUrl: recipe.imageUrl,
              tags: recipe.tags || []
            };
            console.log('Añadiendo receta a guardadas locales:', recipeToSave);
            
            saved.push(recipeToSave);
            await AsyncStorage.setItem('saved_recipes', JSON.stringify(saved));
            console.log('Recetas guardadas localmente actualizadas');
          } else {
            console.log('La receta ya está en el almacenamiento local');
          }
        } catch (storageError) {
          console.error('Error updating local saved recipes:', storageError);
        }
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'No se pudo guardar la receta. Intenta nuevamente.');
    } finally {
      setSavingRecipe(false);
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
    
    if (!user || !user.idUsuario) {
      Alert.alert('Error', 'No se pudo identificar el usuario. Inicia sesión nuevamente.');
      return;
    }
    
    if (!reviewText.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Crear objeto de calificación con información del usuario
      const calificacionData = {
        calificacion: reviewRating,
        comentarios: reviewText.trim(),
        idusuario: {
          idUsuario: user.idUsuario,
          nombre: user.nombre,
          mail: user.mail
        }
      };
      
      console.log('Sending review data:', calificacionData);
      
      // Enviar reseña completa (rating + comentario) al backend
      await api.reviews.create(recipe.id || recipe.idReceta, calificacionData, user.idUsuario);
      
      Alert.alert(
        "Reseña enviada", 
        "Tu reseña ha sido enviada y será revisada por nuestro equipo antes de publicarse."
      );
      
      setIsModalVisible(false);
      setReviewText('');
      setReviewRating(5);
      setUserRating(reviewRating); // Actualizar rating del usuario
      
      // Recargar reseñas para mostrar cambios
      await loadRecipeReviews();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      let errorMessage = 'No se pudo enviar la reseña. Intenta nuevamente.';
      
      if (error.message && error.message.includes('unauthorized')) {
        errorMessage = 'Debes iniciar sesión para valorar recetas.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToPendingList = async () => {
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para usar la lista de recetas pendientes.');
      return;
    }
    
    // Prevenir múltiples clics
    if (addingToPendingList) {
      return;
    }
    
    try {
      setAddingToPendingList(true);
      console.log('Frontend: Adding recipe to pending list:', recipe.id || recipe.idReceta);
      
      const result = await dataService.addRecipeToPendingList(recipe.id || recipe.idReceta);
      
      console.log('Frontend: Result from dataService:', result);
      
      if (result.success) {
        Alert.alert('Éxito', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Frontend: Error adding to pending list:', error);
      Alert.alert('Error', 'No se pudo agregar a la lista de pendientes. Intenta nuevamente.');
    } finally {
      setAddingToPendingList(false);
    }
  };

  const openScaleModal = () => {
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para usar la función de escalar recetas.');
      return;
    }
    setScaleModalVisible(true);
  };

  const applyScaling = async () => {
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para usar la función de escalar recetas.');
      return;
    }
    
    try {
      console.log('Applying local scaling with factor:', scaleFactor);
      
      // Escalado local sin llamar al backend
      setRecipe(prevRecipe => {
        const scaledRecipe = { ...prevRecipe };
        
        // Escalar porciones
        scaledRecipe.servings = Math.round((prevRecipe.servings || 2) * scaleFactor);
        
        return scaledRecipe;
      });
      
      setScaleModalVisible(false);
      Alert.alert('Éxito', `Receta escalada para ${Math.round((recipe.servings || 2) * scaleFactor)} porciones`);
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
      console.log('Scaling by ingredient locally');
      
      // Encontrar el factor de escalado basado en el ingrediente seleccionado
      const originalAmount = parseFloat(selectedIngredient.amount) || 1;
      const newAmount = parseFloat(customAmount);
      const localScaleFactor = newAmount / originalAmount;
      
      console.log('Local scale factor:', localScaleFactor);
      
      // Aplicar escalado local
      setRecipe(prevRecipe => {
        const scaledRecipe = { ...prevRecipe };
        
        // Escalar porciones
        scaledRecipe.servings = Math.round((prevRecipe.servings || 2) * localScaleFactor);
        
        // Escalar ingredientes
        if (scaledRecipe.ingredients) {
          scaledRecipe.ingredients = scaledRecipe.ingredients.map(ingredient => ({
            ...ingredient,
            amount: ingredient.amount ? scaleAmount(ingredient.amount, localScaleFactor) : ingredient.amount
          }));
        }
        
        return scaledRecipe;
      });
      
      setScaleModalVisible(false);
      setScaleByIngredient(false);
      setSelectedIngredient(null);
      setCustomAmount('');
      
      Alert.alert('Éxito', `Receta escalada basada en ${selectedIngredient.name}`);
    } catch (error) {
      console.error('Error scaling recipe by ingredient:', error);
      Alert.alert('Error', 'No se pudo escalar la receta por ingrediente. Intenta nuevamente.');
    }
  };

  const resetScaling = () => {
    setScaleFactor(1);
    Alert.alert('Éxito', 'Escalado restablecido a la receta original');
  };

  // Función para cargar reseñas y comentarios de la receta
  const loadRecipeReviews = async () => {
    try {
      const recipeId = recipe.id || recipe.idReceta;
      if (!recipeId) return;

      const response = await api.reviews.getByRecipe(recipeId);
      
      if (response.success && response.data) {
        const reviews = Array.isArray(response.data) ? response.data : [];
        console.log('All reviews loaded:', reviews.length);
        
        // Buscar la valoración del usuario actual
        if (!isVisitor && user && user.idUsuario) {
          console.log('Looking for rating for user ID:', user.idUsuario);
          const userReview = reviews.find(review => 
            review.idusuario && review.idusuario.idUsuario === user.idUsuario
          );
          
          if (userReview) {
            console.log('Found user rating:', userReview.calificacion, 'Review:', userReview);
            setUserRating(userReview.calificacion);
            setReviewRating(userReview.calificacion); // También para el modal
          } else {
            console.log('No rating found for current user. Reviews:', reviews.map(r => ({
              userId: r.idusuario?.idUsuario,
              rating: r.calificacion
            })));
            setUserRating(0);
            setReviewRating(5); // Valor por defecto para el modal
          }
        } else {
          console.log('User not available for rating lookup:', { isVisitor, user: user?.idUsuario });
        }
        
        // Calcular rating promedio usando TODAS las valoraciones
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + (review.calificacion || 0), 0);
          const averageRating = totalRating / reviews.length;
          
          // Para los comentarios públicos, solo mostrar los autorizados
          // Pero usar todas las valoraciones para el promedio
          const authorizedComments = reviews.filter(review => 
            review.autorizado === true && 
            review.comentarios && 
            review.comentarios.trim() !== ''
          );
          
          // Actualizar el estado de la receta con las reseñas
          setRecipe(prevRecipe => ({
            ...prevRecipe,
            rating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
            reviews: reviews.length,
            comments: authorizedComments.map(review => ({
              id: review.idCalificacion,
              text: review.comentarios,
              user: review.idusuario?.nombre || 'Usuario',
              avatar: review.idusuario?.avatar || 'https://randomuser.me/api/portraits/men/41.jpg',
              rating: review.calificacion,
              date: review.fecha || new Date().toLocaleDateString(),
              status: 'approved'
            }))
          }));
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  // Funciones auxiliares para cálculos seguros
  const safeNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  const getServings = () => {
    const servings = safeNumber(recipe.servings, 2);
    return Math.round(servings * scaleFactor);
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
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para valorar recetas.');
      return;
    }
    
    if (!user || !user.idUsuario) {
      Alert.alert('Error', 'No se pudo identificar el usuario. Inicia sesión nuevamente.');
      return;
    }
    
    try {
      setUserRating(rating);
      
      // Crear objeto de calificación con información del usuario
      const calificacionData = {
        calificacion: rating,
        comentarios: '',
        idusuario: {
          idUsuario: user.idUsuario,
          nombre: user.nombre,
          mail: user.mail
        }
      };
      
      console.log('Sending rating data:', calificacionData);
      
      // Enviar la valoración al backend con el ID del usuario como parámetro
      const response = await api.reviews.create(recipe.id || recipe.idReceta, calificacionData, user.idUsuario);
      
      Alert.alert('Éxito', 'Tu valoración ha sido registrada.');
      
      // Recargar las valoraciones para actualizar el promedio
      await loadRecipeReviews();
      
    } catch (error) {
      console.error('Rating error:', error);
      let errorMessage = 'No se pudo enviar la valoración. Por favor, intenta nuevamente.';
      
      if (error.message && error.message.includes('unauthorized')) {
        errorMessage = 'Debes iniciar sesión para valorar recetas.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };
  
  const handleAddComment = async () => {
    if (isVisitor) {
      Alert.alert('Funcionalidad Limitada', 'Debes registrarte para comentar recetas.');
      return;
    }
    
    if (!user || !user.idUsuario) {
      Alert.alert('Error', 'No se pudo identificar el usuario. Inicia sesión nuevamente.');
      return;
    }
    
    if (!comment.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Crear objeto de calificación con información del usuario
      const calificacionData = {
        calificacion: userRating || 5,
        comentarios: comment.trim(),
        idusuario: {
          idUsuario: user.idUsuario,
          nombre: user.nombre,
          mail: user.mail
        }
      };
      
      console.log('Sending comment data:', calificacionData);
      
      // Enviar comentario al backend
      const response = await api.reviews.create(recipe.id || recipe.idReceta, calificacionData, user.idUsuario);
      
      setComment('');
      Alert.alert(
        'Comentario Enviado', 
        'Tu comentario ha sido enviado y será revisado por nuestro equipo antes de publicarse.'
      );
      
      // Recargar reseñas para mostrar cambios (si están aprobados automáticamente)
      await loadRecipeReviews();
      
    } catch (error) {
      console.error('Comment error:', error);
      let errorMessage = 'No se pudo enviar el comentario. Por favor, intenta nuevamente.';
      
      if (error.message && error.message.includes('unauthorized')) {
        errorMessage = 'Debes iniciar sesión para comentar recetas.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
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
        
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.recipeImage, styles.noImageContainer]}>
            <Icon name="image" size={40} color={Colors.textLight} />
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}
        
        <View style={styles.content}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.title}>{recipe.title}</Text>
            
            <TouchableOpacity onPress={openReviewModal}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={Colors.warning} />
                <Text style={styles.ratingText}>
                  {recipe.rating} ({recipe.reviews})
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.authorRow}>
            <View style={styles.authorInfo}>
              <Image
                source={{ uri: recipe.author?.avatar }}
                style={styles.authorAvatar}
              />
              <Text style={styles.authorName}>{recipe.author?.name}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{recipe.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="users" size={20} color={Colors.primary} />
                  <Text style={styles.statValue}>
                    {getServings()}
                  </Text>
              <Text style={styles.statLabel}>Porciones</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={openScaleModal}>
              <Icon name="refresh-cw" size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Escalar</Text>
            </TouchableOpacity>
            
            {scaleFactor !== 1 && (
              <TouchableOpacity style={styles.actionButton} onPress={resetScaling}>
                <Icon name="rotate-ccw" size={20} color={Colors.secondary} />
                <Text style={[styles.actionButtonText, { color: Colors.secondary }]}>Reset</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, addingToPendingList && styles.disabledButton]} 
              onPress={addToPendingList}
              disabled={addingToPendingList}
            >
              <Icon 
                name={addingToPendingList ? "loader" : "clock"} 
                size={20} 
                color={addingToPendingList ? Colors.textLight : Colors.primary} 
              />
              <Text style={[styles.actionButtonText, addingToPendingList && styles.disabledText]}>
                {addingToPendingList ? 'Agregando...' : 'A Intentar'}
              </Text>
            </TouchableOpacity>

             <TouchableOpacity 
                style={[styles.actionButton, savingRecipe && styles.disabledButton]} 
                onPress={saveRecipe}
                disabled={savingRecipe}
              >
                <Icon 
                  name={savingRecipe ? "loader" : (isSaved ? "check" : "bookmark")} 
                  size={20} 
                  color={savingRecipe ? Colors.textLight : (isSaved ? Colors.success : Colors.primary)} 
                />
                <Text 
                  style={[
                    styles.actionButtonText, 
                    savingRecipe && styles.disabledText,
                    isSaved && { color: Colors.success }
                  ]}
                >
                  {savingRecipe ? 'Guardando...' : (isSaved ? 'Guardada' : 'Guardar')}
                </Text>
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
                  Para <Text style={styles.servingCount}>{getServings()}</Text> {getServings() === 1 ? 'persona' : 'personas'}
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
              
              <View style={styles.ratingSummary}>
                <View style={styles.ratingDisplay}>
                  <Text style={styles.averageRating}>{recipe.rating}</Text>
                  <View style={styles.starsDisplay}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Icon 
                        key={i}
                        name="star" 
                        size={16} 
                        color={i <= Math.round(recipe.rating) ? Colors.warning : Colors.textLight} 
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewCount}>({recipe.reviews} reseñas)</Text>
                </View>
              </View>
              
              {recipe.comments && recipe.comments.length > 0 ? (
                recipe.comments
                  .filter(comment => comment.status === 'approved') // Solo comentarios aprobados
                  .map((comment, index) => (
                    <View key={comment.id || index} style={styles.reviewItem}>
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
                <Text style={styles.emptyMessage}>
                  No hay reseñas disponibles para esta receta. ¡Sé el primero en comentar!
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Valorar Receta</Text>
            <Rating
              key={`rating-${userRating}`}
              showRating
              onFinishRating={handleRating}
              style={styles.rating}
              startingValue={userRating}
              readonly={isSubmitting || isVisitor}
            />
            {isVisitor && (
              <Text style={styles.visitorMessage}>
                Regístrate para valorar esta receta
              </Text>
            )}
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
                  Ajustar porciones: <Text style={styles.scaleValue}>{getServings()}</Text>
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
  noImageContainer: {
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textLight,
    marginTop: Metrics.smallSpacing,
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
    marginBottom: 0,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
    marginTop: Metrics.baseSpacing,
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
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: Metrics.largeSpacing,
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
  ratingSummary: {
    padding: Metrics.mediumSpacing,
    backgroundColor: Colors.background,
    borderRadius: Metrics.mediumBorderRadius,
    marginBottom: Metrics.mediumSpacing,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRating: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '700',
    color: Colors.textDark,
    marginRight: Metrics.baseSpacing,
  },
  starsDisplay: {
    flexDirection: 'row',
    marginRight: Metrics.baseSpacing,
  },
  reviewCount: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  visitorMessage: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    marginTop: Metrics.mediumSpacing,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: Colors.textLight,
  },
});

export default RecipeDetailScreen;