import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const AddRecipeScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [calories, setCalories] = useState('');
  const [difficulty, setDifficulty] = useState('Medio');
  const [recipeImage, setRecipeImage] = useState(null);
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const difficultyOptions = ['Fácil', 'Medio', 'Difícil'];
  const categoryOptions = [
    'Desayuno',
    'Almuerzo',
    'Cena',
    'Postre',
    'Aperitivo',
    'Sopa',
    'Ensalada',
    'Vegetariano',
    'Vegano',
    'Sin Gluten',
    'Keto',
    'Paleo',
  ];

  const handleSelectImage = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 600,
        maxWidth: 800,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.assets && response.assets.length > 0) {
          setRecipeImage(response.assets[0].uri);
        }
      },
    );
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleUpdateIngredient = (text, index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = text;
    setIngredients(updatedIngredients);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length > 1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients.splice(index, 1);
      setIngredients(updatedIngredients);
    }
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleUpdateInstruction = (text, index) => {
    const updatedInstructions = [...instructions];
    updatedInstructions[index] = text;
    setInstructions(updatedInstructions);
  };

  const handleRemoveInstruction = (index) => {
    if (instructions.length > 1) {
      const updatedInstructions = [...instructions];
      updatedInstructions.splice(index, 1);
      setInstructions(updatedInstructions);
    }
  };

  const handleToggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== category),
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const checkNetworkCost = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      
      // Check if connected
      if (!netInfo.isConnected) {
        Alert.alert(
          'Sin Conexión',
          'No hay conexión a internet. La receta se guardará localmente y se subirá cuando tengas conexión.',
          [{ text: 'Entendido' }]
        );
        return 'offline';
      }

      // Check connection type
      const connectionType = netInfo.type;
      const isWiFi = connectionType === 'wifi';
      
      if (!isWiFi) {
        return new Promise((resolve) => {
          Alert.alert(
            'Conexión de Datos Móviles',
            'Estás usando datos móviles que pueden tener costo. ¿Deseas continuar o esperar a tener WiFi gratuito?',
            [
              {
                text: 'Esperar WiFi',
                style: 'cancel',
                onPress: () => resolve('wait')
              },
              {
                text: 'Usar Datos',
                onPress: () => resolve('paid')
              }
            ]
          );
        });
      }

      return 'free';
    } catch (error) {
      console.log('Error checking network:', error);
      return 'unknown';
    }
  };

  const saveRecipeLocally = async (recipeData) => {
    try {
      const pendingRecipes = await AsyncStorage.getItem('pendingRecipes');
      const recipes = pendingRecipes ? JSON.parse(pendingRecipes) : [];
      
      const newRecipe = {
        ...recipeData,
        id: Date.now().toString(),
        status: 'pending_upload',
        createdAt: new Date().toISOString(),
      };
      
      recipes.push(newRecipe);
      await AsyncStorage.setItem('pendingRecipes', JSON.stringify(recipes));
      
      Alert.alert(
        'Receta Guardada',
        'Tu receta se ha guardado localmente y se subirá automáticamente cuando tengas conexión WiFi.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la receta localmente');
    }
  };

  const uploadRecipe = async (recipeData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save to local recipes with pending approval status
      const myRecipes = await AsyncStorage.getItem('myRecipes');
      const recipes = myRecipes ? JSON.parse(myRecipes) : [];
      
      const newRecipe = {
        ...recipeData,
        id: Date.now().toString(),
        status: 'pending_approval', // pending_approval, approved, rejected
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
      };
      
      recipes.push(newRecipe);
      await AsyncStorage.setItem('myRecipes', JSON.stringify(recipes));
      
      Alert.alert(
        'Receta Enviada',
        'Tu receta ha sido enviada y está pendiente de aprobación. Una vez aprobada por nuestro equipo, será visible para otros usuarios.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir la receta. Se guardará localmente.');
      await saveRecipeLocally(recipeData);
    }
  };

  const handleSaveRecipe = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'El título de la receta es obligatorio');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción de la receta es obligatoria');
      return;
    }

    if (ingredients.filter(ing => ing.trim()).length === 0) {
      Alert.alert('Error', 'Debes agregar al menos un ingrediente');
      return;
    }

    if (instructions.filter(inst => inst.trim()).length === 0) {
      Alert.alert('Error', 'Debes agregar al menos una instrucción');
      return;
    }

    setIsLoading(true);

    // Check for existing recipe with same name
    try {
      const myRecipes = await AsyncStorage.getItem('myRecipes');
      const recipes = myRecipes ? JSON.parse(myRecipes) : [];
      const existingRecipe = recipes.find(recipe => 
        recipe.title.toLowerCase() === title.toLowerCase()
      );

      if (existingRecipe) {
        Alert.alert(
          'Receta Existente',
          `Ya tienes una receta llamada "${title}". ¿Qué deseas hacer?`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => setIsLoading(false) },
            { 
              text: 'Reemplazar', 
              style: 'destructive',
              onPress: () => proceedWithSave(true, existingRecipe.id)
            },
            { 
              text: 'Editar Existente', 
              onPress: () => {
                setIsLoading(false);
                // Load existing recipe data for editing
                loadExistingRecipe(existingRecipe);
              }
            }
          ]
        );
        return;
      }

      await proceedWithSave(false);
    } catch (error) {
      console.log('Error checking existing recipes:', error);
      await proceedWithSave(false);
    }
  };

  const proceedWithSave = async (isReplacement = false, replaceId = null) => {
    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      servings: parseInt(servings) || 1,
      calories: parseInt(calories) || 0,
      difficulty,
      imageUrl: recipeImage || 'https://images.unsplash.com/photo-1546548970-71785318a17b',
      ingredients: ingredients.filter(ing => ing.trim()).map(ing => ({
        name: ing.trim(),
        amount: '1',
        preparation: ''
      })),
      instructions: instructions.filter(inst => inst.trim()).map((inst, index) => ({
        step: index + 1,
        text: inst.trim()
      })),
      tags: selectedCategories,
      category: selectedCategories[0] || 'Otros',
      isReplacement,
      replaceId,
    };

    const networkStatus = await checkNetworkCost();

    switch (networkStatus) {
      case 'offline':
        await saveRecipeLocally(recipeData);
        break;
      case 'wait':
        await saveRecipeLocally(recipeData);
        break;
      case 'free':
      case 'paid':
        await uploadRecipe(recipeData);
        break;
      default:
        await uploadRecipe(recipeData);
    }

    setIsLoading(false);
  };

  const loadExistingRecipe = (recipe) => {
    setTitle(recipe.title);
    setDescription(recipe.description);
    setPrepTime(recipe.prepTime?.toString() || '');
    setCookTime(recipe.cookTime?.toString() || '');
    setServings(recipe.servings?.toString() || '');
    setCalories(recipe.calories?.toString() || '');
    setDifficulty(recipe.difficulty || 'Medio');
    setRecipeImage(recipe.imageUrl);
    setIngredients(recipe.ingredients?.map(ing => ing.name) || ['']);
    setInstructions(recipe.instructions?.map(inst => inst.text) || ['']);
    setSelectedCategories(recipe.tags || []);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
            <Text style={styles.headerTitle}>Crear Receta</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRecipe}
            >
              <Icon name="check" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleSelectImage}
          >
            {recipeImage ? (
              <Image
                source={{ uri: recipeImage }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="camera" size={40} color={Colors.textMedium} />
                <Text style={styles.imagePlaceholderText}>Añadir Foto de Receta</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formSection}>
            <Input
              label="Título de la Receta"
              value={title}
              onChangeText={setTitle}
              placeholder="Ingresa el título de la receta"
            />

            <Input
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe brevemente tu receta"
              multiline
              numberOfLines={3}
            />

            <View style={styles.rowFields}>
              <Input
                label="Tiempo de Preparación (min)"
                value={prepTime}
                onChangeText={setPrepTime}
                placeholder="10"
                keyboardType="number-pad"
                style={styles.halfField}
              />

              <Input
                label="Tiempo de Cocción (min)"
                value={cookTime}
                onChangeText={setCookTime}
                placeholder="20"
                keyboardType="number-pad"
                style={styles.halfField}
              />
            </View>

            <View style={styles.rowFields}>
              <Input
                label="Porciones"
                value={servings}
                onChangeText={setServings}
                placeholder="4"
                keyboardType="number-pad"
                style={styles.halfField}
              />

              <Input
                label="Calorías"
                value={calories}
                onChangeText={setCalories}
                placeholder="400"
                keyboardType="number-pad"
                style={styles.halfField}
              />
            </View>

            <Text style={styles.labelText}>Dificultad</Text>
            <View style={styles.difficultyContainer}>
              {difficultyOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.difficultyOption,
                    difficulty === option && styles.selectedDifficulty,
                  ]}
                  onPress={() => setDifficulty(option)}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      difficulty === option && styles.selectedDifficultyText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.labelText}>Categorías</Text>
            <View style={styles.categoriesContainer}>
              {categoryOptions.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTag,
                    selectedCategories.includes(category) &&
                      styles.selectedCategory,
                  ]}
                  onPress={() => handleToggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategories.includes(category) &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredientes</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddIngredient}
              >
                <Icon name="plus" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {ingredients.map((ingredient, index) => (
              <View key={`ingredient-${index}`} style={styles.inputRow}>
                <TextInput
                  style={styles.ingredientInput}
                  value={ingredient}
                  onChangeText={(text) => handleUpdateIngredient(text, index)}
                  placeholder={`Ingrediente ${index + 1}`}
                  placeholderTextColor={Colors.textLight}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveIngredient(index)}
                  disabled={ingredients.length === 1}
                >
                  <Icon
                    name="x"
                    size={18}
                    color={
                      ingredients.length === 1
                        ? Colors.textLight
                        : Colors.textDark
                    }
                  />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Instrucciones</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddInstruction}
              >
                <Icon name="plus" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {instructions.map((instruction, index) => (
              <View key={`instruction-${index}`} style={styles.instructionRow}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={styles.instructionInput}
                  value={instruction}
                  onChangeText={(text) => handleUpdateInstruction(text, index)}
                  placeholder={`Paso ${index + 1}`}
                  placeholderTextColor={Colors.textLight}
                  multiline
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveInstruction(index)}
                  disabled={instructions.length === 1}
                >
                  <Icon
                    name="x"
                    size={18}
                    color={
                      instructions.length === 1
                        ? Colors.textLight
                        : Colors.textDark
                    }
                  />
                </TouchableOpacity>
              </View>
            ))}

            <Button
              title={isLoading ? "Guardando..." : "Guardar Receta"}
              onPress={handleSaveRecipe}
              style={styles.saveRecipeButton}
              disabled={isLoading}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.mediumSpacing,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  saveButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    overflow: 'hidden',
    marginBottom: Metrics.mediumSpacing,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  imagePlaceholderText: {
    marginTop: Metrics.baseSpacing,
    color: Colors.textMedium,
    fontSize: Metrics.baseFontSize,
  },
  formSection: {
    marginBottom: Metrics.largeSpacing,
  },
  rowFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '48%',
  },
  labelText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginBottom: Metrics.mediumSpacing,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: Metrics.baseSpacing,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    marginRight: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedDifficulty: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  difficultyText: {
    color: Colors.textDark,
    fontSize: Metrics.baseFontSize,
  },
  selectedDifficultyText: {
    color: Colors.card,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Metrics.mediumSpacing,
  },
  categoryTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: Metrics.roundedFull,
    marginRight: Metrics.baseSpacing,
    marginBottom: Metrics.baseSpacing,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCategory: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
  },
  selectedCategoryText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
    marginTop: Metrics.mediumSpacing,
  },
  sectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  ingredientInput: {
    flex: 1,
    height: Metrics.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    paddingHorizontal: Metrics.mediumSpacing,
    backgroundColor: Colors.card,
    color: Colors.textDark,
  },
  removeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 12,
  },
  instructionNumberText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '600',
    color: Colors.card,
  },
  instructionInput: {
    flex: 1,
    minHeight: Metrics.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
    backgroundColor: Colors.card,
    color: Colors.textDark,
    textAlignVertical: 'top',
  },
  saveRecipeButton: {
    marginTop: Metrics.largeSpacing,
    marginBottom: Metrics.xxLargeSpacing,
  },
});

export default AddRecipeScreen;