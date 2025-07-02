import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const RecipeCard = ({
  id,
  title,
  imageUrl,
  category,
  rating,
  author,
  tags = [],
  ingredients = [],
  onPress,
  type = 'grid', 
  style,
}) => {

  const getIngredientsCount = () => {
    if (!ingredients) return 0;
    
    if (Array.isArray(ingredients)) {
      return ingredients.length;
    }
    
    if (typeof ingredients === 'object') {
      return Object.keys(ingredients).length;
    }
    
    return 0;
  };

  const ingredientsCount = getIngredientsCount();
  
  const handlePress = () => {
    if (onPress) {
      onPress({
        id: id, 
        title,
        imageUrl,
        category,
        rating
      });
    }
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={12} color={Colors.warning} style={styles.starIcon} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star" size={12} color={Colors.textLight} style={styles.starIcon} />
      );
    }
    
    return stars;
  };

  if (type === 'grid') {
    return (
      <TouchableOpacity
        style={[styles.gridContainer, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.gridImage, styles.noImageContainer]}>
            <Icon name="image" size={30} color={Colors.textLight} />
          </View>
        )}
        <View style={styles.gridContent}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          
          {author && (
            <Text style={styles.authorText} numberOfLines={1}>
              Por: {author}
            </Text>
          )}
          
          {category && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {category}
            </Text>
          )}
          
          <View style={styles.metaContainer}>
            {rating && rating > 0 && (
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(rating)}
                </View>
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.listContainer, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.listImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.listImage, styles.noImageContainer]}>
          <Icon name="image" size={24} color={Colors.textLight} />
        </View>
      )}
      <View style={styles.listContent}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        {author && (
          <Text style={styles.authorText} numberOfLines={1}>
            Por: {author}
          </Text>
        )}
        
        {category && (
          <Text style={styles.categoryText} numberOfLines={1}>
            {category}
          </Text>
        )}
        
        <View style={styles.metaContainer}>
          {rating && rating > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(rating)}
              </View>
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Icon name="more-vertical" size={18} color={Colors.textDark} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    width: Metrics.cardWidth,
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Metrics.mediumSpacing,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridContent: {
    padding: Metrics.baseSpacing,
  },
  listContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: Metrics.baseBorderRadius,
  },
  listContent: {
    flex: 1,
    marginLeft: Metrics.mediumSpacing,
  },
  title: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.smallSpacing,
  },
  authorText: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textMedium,
    fontStyle: 'italic',
    marginBottom: Metrics.smallSpacing,
  },
  categoryText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: Metrics.smallSpacing,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  starIcon: {
    marginRight: 1,
  },
  ratingText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
    fontWeight: '500',
  },
  metaText: {
    fontSize: Metrics.smallFontSize,
  },
  noImageContainer: {
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    color: Colors.textDark,
    marginLeft: Metrics.smallSpacing,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.tag,
    borderRadius: Metrics.roundedFull,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: Metrics.baseSpacing,
    marginBottom: Metrics.smallSpacing,
  },
  tagText: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textDark,
  },
  moreButton: {
    padding: Metrics.smallSpacing,
  },
});

export default RecipeCard;