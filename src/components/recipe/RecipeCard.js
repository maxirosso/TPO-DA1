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
  tags = [],
  ingredients = [],
  onPress,
  type = 'grid', // 'grid' or 'list'
  style,
}) => {
  // Obtener el recuento de ingredientes, manejando ambos formatos (array de strings u objetos)
  const getIngredientsCount = () => {
    if (!ingredients) return 0;
    
    // Si es un array, contar directamente
    if (Array.isArray(ingredients)) {
      return ingredients.length;
    }
    
    // Si es un objeto, contar sus propiedades
    if (typeof ingredients === 'object') {
      return Object.keys(ingredients).length;
    }
    
    return 0;
  };

  const ingredientsCount = getIngredientsCount();
  
  // Función para manejar el clic en la receta
  const handlePress = () => {
    if (onPress) {
      // Asegurarse de que los datos básicos siempre estén presentes
      onPress({
        id: id, // Asegurarse de pasar el ID correctamente
        title,
        imageUrl,
        category,
        rating
      });
    }
  };

  // Función para renderizar las estrellas de rating
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
        <Image
          source={{ uri: imageUrl }}
          style={styles.gridImage}
          resizeMode="cover"
        />
        <View style={styles.gridContent}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          
          {/* Mostrar categoría si está disponible */}
          {category && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {category}
            </Text>
          )}
          
          <View style={styles.metaContainer}>
            {/* Mostrar rating si está disponible */}
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
      <Image
        source={{ uri: imageUrl }}
        style={styles.listImage}
        resizeMode="cover"
      />
      <View style={styles.listContent}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        {/* Mostrar categoría si está disponible */}
        {category && (
          <Text style={styles.categoryText} numberOfLines={1}>
            {category}
          </Text>
        )}
        
        <View style={styles.metaContainer}>
          {/* Mostrar rating si está disponible */}
          {rating && rating > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(rating)}
              </View>
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        </View>
        
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
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