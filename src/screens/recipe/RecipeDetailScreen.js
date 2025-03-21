import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const { width } = Dimensions.get('window');

// Sample recipe data
const recipeData = {
  id: '1',
  title: 'Mediterranean Bowl',
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
    name: 'Chef Maria',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604',
  },
  description:
    'This colorful Mediterranean bowl is packed with nutritious ingredients and vibrant flavors. Perfect for a healthy lunch or dinner.',
  ingredients: [
    '1 cup cooked quinoa',
    '1 cup cherry tomatoes, halved',
    '1 cucumber, diced',
    '1/2 cup Kalamata olives, pitted',
    '1/4 cup feta cheese, crumbled',
    '1/4 cup hummus',
    '2 tablespoons olive oil',
    '1 tablespoon lemon juice',
    '1 teaspoon dried oregano',
    'Salt and pepper to taste',
    '2 tablespoons fresh parsley, chopped',
  ],
  instructions: [
    'Cook quinoa according to package instructions and let it cool.',
    'In a large bowl, combine cooled quinoa, tomatoes, cucumber, and olives.',
    'In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.',
    'Pour the dressing over the salad and toss to combine.',
    'Divide the mixture into serving bowls.',
    'Top each bowl with a dollop of hummus and sprinkle with feta cheese.',
    'Garnish with fresh parsley before serving.',
  ],
};

const RecipeDetailScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [isFavorite, setIsFavorite] = useState(false);
  const recipe = route.params?.recipe || recipeData;
  
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
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
              style={[styles.iconButton, styles.favoriteButton]}
              onPress={handleFavoriteToggle}
            >
              <Icon
                name={isFavorite ? 'heart' : 'heart'}
                size={20}
                color={isFavorite ? Colors.error : Colors.card}
                solid={isFavorite}
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton}>
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
              <Text style={styles.authorName}>by {recipe.author?.name}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={Colors.warning} />
              <Text style={styles.ratingText}>
                {recipe.rating} ({recipe.reviews})
              </Text>
            </View>
          </View>
          
          <Text style={styles.description}>{recipe.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="clock" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{recipe.prepTime + recipe.cookTime} min</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="users" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{recipe.servings}</Text>
              <Text style={styles.statLabel}>Servings</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="activity" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{recipe.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
          
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
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
                Ingredients
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
                Instructions
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'ingredients' ? (
            <View style={styles.ingredientsContainer}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.instructionsContainer}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Start Cooking"
          iconName="play-circle"
          onPress={() => {}}
          style={styles.startButton}
          fullWidth
        />
      </View>
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
  favoriteButton: {
    backgroundColor: isFavorite => isFavorite ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.3)',
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
    paddingBottom: 80, // Add space for footer
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
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Metrics.baseSpacing,
  },
  ingredientText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    flex: 1,
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
  instructionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    flex: 1,
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
});

export default RecipeDetailScreen;