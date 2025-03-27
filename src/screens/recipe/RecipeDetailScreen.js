import React, { useState, useRef } from 'react';
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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const { width } = Dimensions.get('window');

const RecipeDetailScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [scaleModalVisible, setScaleModalVisible] = useState(false);
  const [scaleByIngredient, setScaleByIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  
  // La receta puede venir de la navegación o usamos datos demo
  const recipeData = {
    id: '1',
    title: 'Cuenco Mediterráneo',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    rating: 4.8,
    reviews: 124,
    cookTime: 25,
    prepTime: 10,
    servings: 2,
    calories: 420,
    protein: 22,
    carbs: 48,
    fat: 18,
    author: {
      name: 'Chef María',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604',
    },
    description:
      'Este colorido cuenco mediterráneo está lleno de ingredientes nutritivos y sabores vibrantes. Perfecto para un almuerzo o cena saludable.',
    ingredients: [
      {name: 'quinoa cocida', amount: '1 taza'},
      {name: 'tomates cherry', amount: '1 taza', preparation: 'partidos por la mitad'},
      {name: 'pepino', amount: '1', preparation: 'cortado en cubos'},
      {name: 'aceitunas Kalamata', amount: '1/2 taza', preparation: 'sin hueso'},
      {name: 'queso feta', amount: '1/4 taza', preparation: 'desmenuzado'},
      {name: 'hummus', amount: '1/4 taza'},
      {name: 'aceite de oliva', amount: '2 cucharadas'},
      {name: 'jugo de limón', amount: '1 cucharada'},
      {name: 'orégano seco', amount: '1 cucharadita'},
      {name: 'sal y pimienta', amount: 'al gusto'},
      {name: 'perejil fresco', amount: '2 cucharadas', preparation: 'picado'},
    ],
    instructions: [
      {text: 'Cocina la quinoa según las instrucciones del paquete y déjala enfriar.', hasImage: false},
      {text: 'En un tazón grande, combina la quinoa enfriada, los tomates, el pepino y las aceitunas.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=1064&auto=format&fit=crop'},
      {text: 'En un tazón pequeño, mezcla el aceite de oliva, el jugo de limón, el orégano, la sal y la pimienta.', hasImage: false},
      {text: 'Vierte el aderezo sobre la ensalada y mezcla para combinar.', hasImage: false},
      {text: 'Divide la mezcla en tazones para servir.', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1170&auto=format&fit=crop'},
      {text: 'Coloca una cucharada de hummus en cada tazón y espolvorea con queso feta.', hasImage: false},
      {text: 'Decora con perejil fresco antes de servir.', hasImage: false},
    ],
    comments: [
      {
        user: 'Carlos',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        text: 'Excelente receta, la preparé ayer y quedó deliciosa.',
        rating: 5,
        date: '2 días atrás'
      },
      {
        user: 'Laura',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        text: 'Muy rica pero le añadí un poco más de limón para darle más sabor.',
        rating: 4,
        date: '1 semana atrás'
      }
    ]
  };
  
  const recipe = route.params?.recipe || recipeData;
  
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // Aquí iría la lógica para guardar en favoritos
  };

  const openReviewModal = () => {
    setIsModalVisible(true);
  };

  const submitReview = () => {
    // Aquí iría la lógica para enviar la reseña al backend
    Alert.alert("Reseña enviada", "Tu reseña ha sido enviada y será revisada por nuestro equipo.");
    setIsModalVisible(false);
    setReviewText('');
    setReviewRating(5);
  };

  const addToShoppingList = () => {
    // Aquí iría la lógica para agregar a la lista de compras
    Alert.alert("Lista de compras", "Los ingredientes han sido agregados a tu lista de compras.");
  };

  const openScaleModal = () => {
    setScaleModalVisible(true);
  };

  const applyScaling = () => {
    // Aquí iría la lógica para aplicar el escaldo
    setScaleModalVisible(false);
  };

  const toggleScaleMethod = () => {
    setScaleByIngredient(!scaleByIngredient);
    setSelectedIngredient(null);
    setCustomAmount('');
  };

  const selectIngredient = (ingredient, index) => {
    setSelectedIngredient({...ingredient, index});
  };

  const scaleRecipeByIngredient = () => {
    if (!selectedIngredient || !customAmount) return;
    
    // Lógica para escalar por ingrediente
    Alert.alert("Receta escalada", `La receta ha sido ajustada para usar ${customAmount} de ${selectedIngredient.name}.`);
    setScaleModalVisible(false);
  };

  const renderIngredient = (item, index) => {
    // Escalar la cantidad según el factor
    const scaledAmount = scaleByIngredient ? item.amount : scaleAmount(item.amount, scaleFactor);
    
    return (
      <View key={index} style={styles.ingredientItem}>
        <View style={styles.bulletPoint} />
        <Text style={styles.ingredientText}>
          <Text style={styles.ingredientAmount}>{scaledAmount} </Text>
          <Text>{item.name}</Text>
          {item.preparation ? <Text style={styles.ingredientPrep}>, {item.preparation}</Text> : null}
        </Text>
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

  // Función auxiliar para escalar cantidades
  const scaleAmount = (amount, factor) => {
    if (typeof amount !== 'string') return amount;
    
    // Detectar números en el string
    const match = amount.match(/^(\d+\/\d+|\d+\.\d+|\d+)(\s+)(.*)$/);
    if (!match) return amount;
    
    let num = match[1];
    const rest = match[3];
    
    // Manejar fracciones
    if (num.includes('/')) {
      const [numerator, denominator] = num.split('/');
      num = parseInt(numerator) / parseInt(denominator);
    } else {
      num = parseFloat(num);
    }
    
    // Escalar el número
    const scaledNum = (num * factor).toFixed(1).replace(/\.0$/, '');
    
    // Si es una fracción simple, intentamos mantener la fracción
    if (scaledNum === '0.5') return `1/2 ${rest}`;
    if (scaledNum === '0.25') return `1/4 ${rest}`;
    if (scaledNum === '0.75') return `3/4 ${rest}`;
    
    return `${scaledNum} ${rest}`;
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
            >
              <Icon
                name={isFavorite ? 'heart' : 'heart'}
                size={20}
                color={isFavorite ? Colors.error : Colors.card}
              />
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
              <Text style={styles.statValue}>{recipe.prepTime + recipe.cookTime} min</Text>
              <Text style={styles.statLabel}>Tiempo Total</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="users" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{recipe.servings}</Text>
              <Text style={styles.statLabel}>Porciones</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="activity" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{recipe.calories}</Text>
              <Text style={styles.statLabel}>Calorías</Text>
            </View>
          </View>
          
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.protein}g</Text>
              <Text style={styles.nutritionLabel}>Proteína</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbohidratos</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.fat}g</Text>
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
                  Ingredientes para <Text style={styles.servingHighlight}>{Math.round(recipe.servings * scaleFactor)}</Text> porciones
                </Text>
                {!scaleByIngredient && (
                  <TouchableOpacity onPress={openScaleModal}>
                    <Text style={styles.servingModifier}>Modificar</Text>
                  </TouchableOpacity>
                )}
              </View>
              {recipe.ingredients.map((ingredient, index) => renderIngredient(ingredient, index))}
            </View>
          )}
          
          {activeTab === 'instructions' && (
            <View style={styles.instructionsContainer}>
              {recipe.instructions.map((instruction, index) => renderStepWithImage(instruction, index))}
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
              
              {recipe.comments.map((comment, index) => (
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
              ))}
            </View>
          )}
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
                  {recipe.ingredients.map((ingredient, index) => (
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
  ingredientText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    flex: 1,
    lineHeight: Metrics.mediumLineHeight,
  },
  ingredientAmount: {
    fontWeight: '600',
  },
  ingredientPrep: {
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
});

export default RecipeDetailScreen;