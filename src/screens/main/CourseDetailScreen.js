import React, { useState, useEffect } from 'react';
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
import dataService from '../../services/dataService';

const CourseDetailScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get data from route params
  const { 
    course: courseProp, 
    enrollment, 
    isEnrolled, 
    userType, 
    onEnroll 
  } = route.params || {};

  useEffect(() => {
    if (courseProp) {
      setCourse(courseProp);
      setLoading(false);
    } else {
      loadCourse();
    }
  }, [courseProp]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const courseId = route.params?.courseId;
      if (courseId) {
        const courseData = await dataService.getCourseById(courseId);
        if (courseData) {
          setCourse({
            id: courseData.idCurso,
            idCurso: courseData.idCurso,
            title: courseData.descripcion,
            descripcion: courseData.descripcion,
            contenidos: courseData.contenidos ? courseData.contenidos.split(',') : [],
            requerimientos: courseData.requerimientos ? courseData.requerimientos.split(',') : [],
            duracion: courseData.duracion,
            duration: courseData.duracion,
            precio: courseData.precio,
            price: courseData.precio,
            modalidad: courseData.modalidad,
            category: courseData.modalidad,
            imageUrl: 'https://via.placeholder.com/300x200?text=Curso+Culinario',
            startDate: courseData.fechaInicio,
            endDate: courseData.fechaFin,
            location: courseData.sede ? courseData.sede.nombreSede : 'Sede por confirmar',
            instructor: 'Chef Profesional',
            status: 'active',
            nextSession: courseData.fechaInicio,
            totalHours: courseData.duracion,
            topics: courseData.contenidos ? courseData.contenidos.split(',') : []
          });
        } else {
          setError('No se encontró información del curso.');
        }
      } else if (route.params?.course) {
        setCourse(route.params.course);
      } else {
        setError('No se encontró información del curso.');
      }
    } catch (err) {
      console.error('Error loading course:', err);
      setError('No se pudo cargar el curso.');
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnroll = () => {
    // Check user type first
    if (userType !== 'student') {
      Alert.alert(
        'Acceso Restringido',
        userType === 'visitor' 
          ? 'Regístrate como estudiante para inscribirte a cursos.'
          : 'Actualiza tu perfil a estudiante para acceder a todas las funcionalidades.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: userType === 'visitor' ? 'Registrarse' : 'Actualizar Perfil', 
            onPress: () => navigation.navigate('Profile')
          }
        ]
      );
      return;
    }

    // If already enrolled, show message
    if (isEnrolled) {
      Alert.alert(
        'Ya Inscrito',
        'Ya estás inscrito en este curso. Puedes ver los detalles en "Mis Cursos".',
        [
          { text: 'OK' },
          { 
            text: 'Ver Mis Cursos', 
            onPress: () => navigation.navigate('MyCourses')
          }
        ]
      );
      return;
    }

    // Use the enrollment function passed from CourseScreen
    if (onEnroll && course) {
      onEnroll(course, course.sede);
    } else {
      // Fallback to navigation if onEnroll is not available
      navigation.navigate('CourseEnrollment', { 
        course,
        location: course.sede
      });
    }
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
    if (!selectedLocation) return course.precio;
    
    const discountAmount = (course.precio * selectedLocation.discount) / 100;
    return (course.precio - discountAmount).toFixed(2);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text>Cargando curso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'No se encontró el curso'}</Text>
          <Button 
            title="Volver" 
            onPress={() => navigation.goBack()} 
          />
        </View>
      </SafeAreaView>
    );
  }

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
          source={{ uri: course?.imageUrl }}
          style={styles.courseImage}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.courseHeader}>
            <View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{course?.level}</Text>
              </View>
              <Text style={styles.courseTitle}>{course?.title}</Text>
            </View>
            <View style={styles.priceContainer}>
              {selectedLocation && selectedLocation.discount > 0 && (
                <Text style={styles.originalPrice}>${course.precio}</Text>
              )}
              <Text style={styles.coursePrice}>${calculateFinalPrice()}</Text>
            </View>
          </View>

          <View style={styles.instructorContainer}>
            <Image
              source={{ uri: course?.instructor?.avatar }}
              style={styles.instructorAvatar}
            />
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>
                {course?.instructor?.name}
              </Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={Colors.warning} />
                <Text style={styles.ratingText}>
                  {course?.rating} ({course?.reviewCount} reseñas)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="calendar" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Duración</Text>
                <Text style={styles.infoValue}>{course?.duracion}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="clock" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Horario</Text>
                <Text style={styles.infoValue}>{course?.schedule}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="map-pin" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Modalidad</Text>
                <Text style={styles.infoValue}>{course?.modalidad}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="calendar" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Inicia</Text>
                <Text style={styles.infoValue}>{new Date(course?.startDate).toLocaleDateString()}</Text>
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
              <Text style={styles.descriptionText}>{course?.descripcion}</Text>

              {course?.sede && (
                <>
                  <Text style={styles.requirementsTitle}>Información de la Sede</Text>
                  <View style={styles.sedeContainer}>
                    <View style={styles.sedeItem}>
                      <Icon name="map-pin" size={16} color={Colors.primary} />
                      <Text style={styles.sedeText}>{course.sede.nombre}</Text>
                    </View>
                    <View style={styles.sedeItem}>
                      <Icon name="navigation" size={16} color={Colors.primary} />
                      <Text style={styles.sedeText}>{course.sede.direccion}</Text>
                    </View>
                    <View style={styles.sedeItem}>
                      <Icon name="phone" size={16} color={Colors.primary} />
                      <Text style={styles.sedeText}>{course.sede.telefono}</Text>
                    </View>
                    <View style={styles.sedeItem}>
                      <Icon name="mail" size={16} color={Colors.primary} />
                      <Text style={styles.sedeText}>{course.sede.email}</Text>
                    </View>
                    {course.sede.whatsapp && (
                      <View style={styles.sedeItem}>
                        <Icon name="message-circle" size={16} color={Colors.primary} />
                        <Text style={styles.sedeText}>{course.sede.whatsapp}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              <Text style={styles.requirementsTitle}>Requisitos</Text>
              {course?.requerimientos ? (
                typeof course.requerimientos === 'string' ? (
                  <Text style={styles.requirementText}>{course.requerimientos}</Text>
                ) : Array.isArray(course.requerimientos) && course.requerimientos.length > 0 ? (
                  course.requerimientos.map((requirement, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.requirementText}>{requirement}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.requirementText}>Sin requisitos previos</Text>
                )
              ) : (
                <Text style={styles.requirementText}>Sin requisitos previos</Text>
              )}
            </View>
          )}

          {activeTab === 'topics' && (
            <View style={styles.tabContent}>
              <Text style={styles.topicsTitle}>Contenido del Curso</Text>
              {course?.contenidos ? (
                typeof course.contenidos === 'string' ? (
                  <Text style={styles.topicText}>{course.contenidos}</Text>
                ) : Array.isArray(course.contenidos) && course.contenidos.length > 0 ? (
                  course.contenidos.map((topic, index) => (
                    <View key={index} style={styles.topicItem}>
                      <View style={styles.topicNumber}>
                        <Text style={styles.topicNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.topicText}>{topic}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.topicText}>Contenido por definir</Text>
                )
              ) : (
                <Text style={styles.topicText}>Contenido por definir</Text>
              )}
            </View>
          )}

          {activeTab === 'instructor' && (
            <View style={styles.tabContent}>
              <View style={styles.instructorDetailContainer}>
                <Image
                  source={{ uri: course?.instructor?.avatar }}
                  style={styles.instructorDetailAvatar}
                />
                <Text style={styles.instructorDetailName}>
                  {course?.instructor?.name}
                </Text>
                <Text style={styles.instructorBio}>
                  {course?.instructor?.bio}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={
            isEnrolled 
              ? "Ya Inscrito" 
              : userType !== 'student'
                ? "Iniciar Sesión para Inscribirse"
                : "Inscribirse al Curso"
          }
          onPress={handleEnroll}
          fullWidth
          disabled={loading}
          style={isEnrolled ? { backgroundColor: Colors.success } : {}}
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
              data={course?.locations}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Metrics.mediumSpacing,
  },
  errorText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Metrics.mediumSpacing,
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
  sedeContainer: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  sedeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.smallSpacing,
  },
  sedeText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.baseSpacing,
    flex: 1,
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