import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

// Sample data for a cooking course
const courseData = {
  id: '1',
  title: 'Cocina Italiana Básica',
  imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
  level: 'Principiante',
  price: 49.99,
  duration: '4 semanas',
  schedule: 'Lunes y Miércoles, 18:00 - 20:00',
  modality: 'Presencial',
  description: 'Aprende los fundamentos de la cocina italiana, desde pastas auténticas hasta salsas clásicas. Este curso te llevará por un viaje culinario a través de Italia sin salir de tu ciudad.',
  topics: [
    'Introducción a la cocina italiana y sus regiones',
    'Técnicas de preparación de pastas frescas',
    'Salsas clásicas italianas',
    'Risottos perfectos',
    'Postres italianos tradicionales',
  ],
  requirements: [
    'No se requiere experiencia previa en cocina',
    'Delantal y utensilios básicos de cocina (opcional)',
    'Ingredientes para prácticas en casa (lista será proporcionada)',
  ],
  instructor: {
    name: 'Chef Marco Rossi',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    bio: 'Chef italiano con más de 15 años de experiencia en restaurantes de Italia y España. Especialista en cocina tradicional italiana.',
  },
  locations: [
    {
      id: 'loc1',
      name: 'Sede Central',
      address: 'Av. Principal 1234, Centro',
      availableSeats: 5,
      discount: 0,
    },
    {
      id: 'loc2',
      name: 'Sede Norte',
      address: 'Calle 45 #789, Zona Norte',
      availableSeats: 3,
      discount: 10,
    },
    {
      id: 'loc3',
      name: 'Sede Sur',
      address: 'Av. Sur 567, Zona Sur',
      availableSeats: 0,
      discount: 0,
    },
  ],
  startDate: '2023-11-15',
  endDate: '2023-12-13',
  rating: 4.8,
  reviewCount: 45,
};

const CourseDetailScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);

  // In a real app, you would get the course data from route.params or API
  const course = courseData;
  
  const handleEnroll = () => {
    if (!selectedLocation) {
      setIsLocationModalVisible(true);
      return;
    }
    
    // In a real app, this would navigate to a payment screen
    navigation.navigate('CourseEnrollment', { 
      course,
      location: selectedLocation
    });
  };
  
  const selectLocation = (location) => {
    if (location.availableSeats === 0) {
      Alert.alert(
        'Sin Cupos Disponibles',
        'Lo sentimos, esta sede no tiene cupos disponibles para este curso. Por favor selecciona otra sede.'
      );
      return;
    }
    
    setSelectedLocation(location);
    setIsLocationModalVisible(false);
  };
  
  const calculateFinalPrice = () => {
    if (!selectedLocation) return course.price;
    
    const discountAmount = (course.price * selectedLocation.discount) / 100;
    return (course.price - discountAmount).toFixed(2);
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        item.availableSeats === 0 && styles.disabledLocationItem,
        selectedLocation?.id === item.id && styles.selectedLocationItem,
      ]}
      onPress={() => selectLocation(item)}
      disabled={item.availableSeats === 0}
    >
      <View style={styles.locationContent}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationAddress}>{item.address}</Text>
        <View style={styles.locationDetails}>
          <View style={styles.seatContainer}>
            <Icon name="users" size={14} color={Colors.textMedium} />
            <Text style={styles.seatText}>
              {item.availableSeats > 0
                ? `${item.availableSeats} cupos disponibles`
                : 'Sin cupos disponibles'}
            </Text>
          </View>
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}% OFF</Text>
            </View>
          )}
        </View>
      </View>
      {selectedLocation?.id === item.id && (
        <View style={styles.checkmark}>
          <Icon name="check" size={18} color={Colors.card} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={Colors.card} />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: course.imageUrl }}
          style={styles.courseImage}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.courseHeader}>
            <View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{course.level}</Text>
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
            </View>
            <View style={styles.priceContainer}>
              {selectedLocation && selectedLocation.discount > 0 && (
                <Text style={styles.originalPrice}>${course.price}</Text>
              )}
              <Text style={styles.coursePrice}>${calculateFinalPrice()}</Text>
            </View>
          </View>

          <View style={styles.instructorContainer}>
            <Image
              source={{ uri: course.instructor.avatar }}
              style={styles.instructorAvatar}
            />
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>
                {course.instructor.name}
              </Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={Colors.warning} />
                <Text style={styles.ratingText}>
                  {course.rating} ({course.reviewCount} reseñas)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="calendar" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Duración</Text>
                <Text style={styles.infoValue}>{course.duration}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="clock" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Horario</Text>
                <Text style={styles.infoValue}>{course.schedule}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="map-pin" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Modalidad</Text>
                <Text style={styles.infoValue}>{course.modality}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="calendar" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Inicia</Text>
                <Text style={styles.infoValue}>{new Date(course.startDate).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>

          {selectedLocation && (
            <View style={styles.selectedLocationContainer}>
              <Text style={styles.selectedLocationLabel}>Sede seleccionada:</Text>
              <View style={styles.selectedLocationContent}>
                <View>
                  <Text style={styles.selectedLocationName}>{selectedLocation.name}</Text>
                  <Text style={styles.selectedLocationAddress}>{selectedLocation.address}</Text>
                </View>
                <TouchableOpacity
                  style={styles.changeLocationButton}
                  onPress={() => setIsLocationModalVisible(true)}
                >
                  <Text style={styles.changeLocationText}>Cambiar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'details' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('details')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'details' && styles.activeTabText,
                ]}
              >
                Detalles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'topics' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('topics')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'topics' && styles.activeTabText,
                ]}
              >
                Temario
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'instructor' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('instructor')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'instructor' && styles.activeTabText,
                ]}
              >
                Instructor
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'details' && (
            <View style={styles.tabContent}>
              <Text style={styles.descriptionTitle}>Descripción del Curso</Text>
              <Text style={styles.descriptionText}>{course.description}</Text>

              <Text style={styles.requirementsTitle}>Requisitos</Text>
              {course.requirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.requirementText}>{requirement}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'topics' && (
            <View style={styles.tabContent}>
              <Text style={styles.topicsTitle}>Contenido del Curso</Text>
              {course.topics.map((topic, index) => (
                <View key={index} style={styles.topicItem}>
                  <View style={styles.topicNumber}>
                    <Text style={styles.topicNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'instructor' && (
            <View style={styles.tabContent}>
              <View style={styles.instructorDetailContainer}>
                <Image
                  source={{ uri: course.instructor.avatar }}
                  style={styles.instructorDetailAvatar}
                />
                <Text style={styles.instructorDetailName}>
                  {course.instructor.name}
                </Text>
                <Text style={styles.instructorBio}>
                  {course.instructor.bio}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={selectedLocation ? "Inscribirse al Curso" : "Seleccionar Sede"}
          onPress={handleEnroll}
          fullWidth
        />
      </View>

      {isLocationModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Sede</Text>
              <TouchableOpacity onPress={() => setIsLocationModalVisible(false)}>
                <Icon name="x" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={course.locations}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.locationsList}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    top: Metrics.mediumSpacing,
    left: Metrics.mediumSpacing,
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
  courseImage: {
    width: '100%',
    height: 250,
  },
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
    paddingBottom: 100, // Extra padding for the footer
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Metrics.mediumSpacing,
  },
  levelBadge: {
    backgroundColor: Colors.info + '20', // 20% opacity
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Metrics.baseBorderRadius,
    alignSelf: 'flex-start',
    marginBottom: Metrics.smallSpacing,
  },
  levelText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.info,
    fontWeight: '500',
  },
  courseTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '700',
    color: Colors.textDark,
    width: '80%',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textDecorationLine: 'line-through',
  },
  coursePrice: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Metrics.baseSpacing,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  infoItem: {
    flexDirection: 'row',
    width: '50%',
    marginBottom: Metrics.baseSpacing,
  },
  infoContent: {
    marginLeft: Metrics.smallSpacing,
  },
  infoLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  infoValue: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  selectedLocationContainer: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  selectedLocationLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.smallSpacing,
  },
  selectedLocationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedLocationName: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  selectedLocationAddress: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  changeLocationButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary + '10', // 10% opacity
    borderRadius: Metrics.baseBorderRadius,
  },
  changeLocationText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
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
  tabContent: {
    marginBottom: Metrics.mediumSpacing,
  },
  descriptionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  descriptionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.mediumSpacing,
  },
  requirementsTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Metrics.smallSpacing,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: Metrics.baseSpacing,
  },
  requirementText: {
    flex: 1,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    lineHeight: Metrics.mediumLineHeight,
  },
  topicsTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  topicNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.baseSpacing,
  },
  topicNumberText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '600',
    color: Colors.card,
  },
  topicText: {
    flex: 1,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  instructorDetailContainer: {
    alignItems: 'center',
  },
  instructorDetailAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Metrics.baseSpacing,
  },
  instructorDetailName: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.smallSpacing,
  },
  instructorBio: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    lineHeight: Metrics.mediumLineHeight,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    paddingVertical: Metrics.mediumSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  modalTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  locationsList: {
    paddingBottom: Metrics.baseSpacing,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  disabledLocationItem: {
    opacity: 0.5,
  },
  selectedLocationItem: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.smallSpacing,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 4,
  },
  discountBadge: {
    backgroundColor: Colors.success + '20', // 20% opacity
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Metrics.baseBorderRadius,
  },
  discountText: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.success,
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CourseDetailScreen;