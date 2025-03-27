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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';

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

  const handleSaveRecipe = () => {
    console.log({
      title,
      description,
      prepTime,
      cookTime,
      servings,
      calories,
      difficulty,
      recipeImage,
      ingredients: ingredients.filter(ingredient => ingredient.trim() !== ''),
      instructions: instructions.filter(instruction => instruction.trim() !== ''),
      categories: selectedCategories,
    });
    
    navigation.goBack();
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
              title="Guardar Receta"
              onPress={handleSaveRecipe}
              style={styles.saveRecipeButton}
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