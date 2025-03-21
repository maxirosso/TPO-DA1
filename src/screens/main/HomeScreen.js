import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import RecipeCard from '../../components/recipe/RecipeCard';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

// Dummy data for recipes
const popularRecipes = [
  {
    id: '1',
    title: 'Mediterranean Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
    time: 25,
  },
  {
    id: '2',
    title: 'Avocado Toast',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
    time: 10,
  },
  {
    id: '3',
    title: 'Berry Smoothie Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1557837931-97fdbe7cb9a4',
    time: 15,
  },
  {
    id: '4',
    title: 'Vegan Pancakes',
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93',
    time: 20,
  },
];

const recentlyAddedRecipes = [
  {
    id: '5',
    title: 'Fresh Vegetable Salad',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    time: 15,
    tags: ['Healthy', 'Vegan'],
  },
  {
    id: '6',
    title: 'Grilled Salmon',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    time: 30,
    tags: ['Protein', 'Dinner'],
  },
  {
    id: '7',
    title: 'Quinoa Stuffed Peppers',
    imageUrl: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9',
    time: 45,
    tags: ['Vegetarian', 'Dinner'],
  },
];

// Category filters
const categories = [
  'All Recipes',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Desserts',
  'Snacks',
  'Drinks',
];

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Recipes');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
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
      title={item.title}
      imageUrl={item.imageUrl}
      time={item.time}
      type="grid"
      onPress={() => handleRecipePress(item)}
      style={styles.popularRecipeCard}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>CulinaryDelight</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
            <Image
              source={{ 
                uri: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3'
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={Colors.textMedium} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes, ingredients..."
            placeholderTextColor={Colors.textMedium}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Recipes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={popularRecipes}
          renderItem={renderPopularRecipe}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularRecipesContainer}
        />
        
        <Text style={[styles.sectionTitle, styles.recentTitle]}>
          Recently Added
        </Text>
        
        {recentlyAddedRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            title={recipe.title}
            imageUrl={recipe.imageUrl}
            time={recipe.time}
            tags={recipe.tags}
            type="list"
            onPress={() => handleRecipePress(recipe)}
          />
        ))}
        
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
});

export default HomeScreen;