import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { AuthContext } from '../../context/AuthContext';
import dataService from '../../services/dataService';

const CourseScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todas las sedes');
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [categories, setCategories] = useState(['Todas las sedes']);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedCourseToCancel, setSelectedCourseToCancel] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { user } = useContext(AuthContext);
  const [userType, setUserType] = useState('student'); // 'visitor', 'user', 'student'
  const [accountBalance, setAccountBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false); // Nuevo estado para carga de saldo
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [selectedCategory, allCourses, enrolledCourses]);

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let userId = user?.id || user?.idUsuario;
      if (!userId) {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          userId = parsed.id || parsed.idUsuario;
        }
      }
      // Si no hay userId, usar 1 por defecto
      const numericUserId = userId ? parseInt(userId, 10) : 1;
      
      // Load available courses
      const courses = await dataService.getAllCourses(numericUserId);
      setAllCourses(courses);
      
      // Extract unique categories from sede names
      const uniqueCategories = [
        'Todas las sedes',
        ...Array.from(new Set(
          courses
            .filter(c => c.sede && (c.sede.nombre || c.sede.nombreSede))
            .map(c => c.sede.nombre || c.sede.nombreSede)
        ))
      ];
      setCategories(uniqueCategories);
      
      // Load enrolled courses si userId es válido
      if (userId) {
        const enrolled = await dataService.getUserCourses(numericUserId);
        setEnrolledCourses(enrolled);
      }
      
      // Set user type based on user data
      if (user) {
        // Map backend types to frontend types
        const backendType = user.tipo || 'visitor';
        let mappedType = 'visitor'; // default
        
        if (backendType === 'alumno' || backendType === 'student') {
          mappedType = 'student';
        } else if (backendType === 'admin') {
          mappedType = 'admin';
        } else if (backendType === 'usuario') {
          mappedType = 'user';
        }
        
        setUserType(mappedType);
        
        // Cargar la cuenta corriente del usuario si es alumno
        if (mappedType === 'student' && userId) {
          await loadUserAccountBalance(numericUserId);
        }
      }
    } catch (err) {
      setError('No se pudieron cargar los cursos. Intenta nuevamente.');
      console.error('Error loading courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Nueva función para cargar la cuenta corriente del usuario
  const loadUserAccountBalance = async (userId) => {
    setIsLoadingBalance(true);
    try {
      console.log('🏦 Cargando cuenta corriente para usuario:', userId);
      
      // Intentar obtener los datos del alumno desde el backend
      const alumnoData = await dataService.getAlumnoById(userId);
      console.log('📊 Datos del alumno recibidos:', alumnoData);
      
      if (alumnoData && (alumnoData.accountBalance !== undefined || alumnoData.cuentaCorriente !== undefined)) {
        const balance = alumnoData.accountBalance !== undefined ? alumnoData.accountBalance : alumnoData.cuentaCorriente;
        console.log('✅ Cuenta corriente cargada desde backend:', balance);
        setAccountBalance(Number(balance) || 0);
        return;
      } 
      
      // Fallback: verificar si hay datos de alumno en AsyncStorage
      console.log('📱 Intentando cargar desde AsyncStorage...');
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        console.log('👤 Datos de usuario en AsyncStorage:', parsed);
        
        if (parsed.studentInfo && parsed.studentInfo.accountBalance !== undefined) {
          console.log('✅ Cuenta corriente desde AsyncStorage (accountBalance):', parsed.studentInfo.accountBalance);
          setAccountBalance(Number(parsed.studentInfo.accountBalance) || 0);
        } else if (parsed.studentInfo && parsed.studentInfo.cuentaCorriente !== undefined) {
          console.log('✅ Cuenta corriente desde AsyncStorage (cuentaCorriente):', parsed.studentInfo.cuentaCorriente);
          setAccountBalance(Number(parsed.studentInfo.cuentaCorriente) || 0);
        } else {
          console.log('⚠️ No se encontró información de cuenta corriente en AsyncStorage');
          console.log('📋 Estructura de parsed:', JSON.stringify(parsed, null, 2));
          setAccountBalance(0);
        }
      } else {
        console.log('⚠️ No hay datos de usuario en AsyncStorage');
        setAccountBalance(0);
      }
    } catch (error) {
      console.error('❌ Error cargando cuenta corriente:', error);
      console.error('❌ Stack del error:', error.stack);
      setAccountBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Nueva función para actualizar la cuenta corriente después de una inscripción
  const updateAccountBalanceAfterEnrollment = async (coursePrice) => {
    try {
      const newBalance = accountBalance - coursePrice;
      setAccountBalance(newBalance);
      
      // También actualizar en AsyncStorage si existe información del usuario
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.studentInfo) {
          parsed.studentInfo.accountBalance = newBalance;
          parsed.studentInfo.cuentaCorriente = newBalance;
          await AsyncStorage.setItem('user_data', JSON.stringify(parsed));
        }
      }
      
      console.log('💰 Cuenta corriente actualizada. Nuevo saldo:', newBalance);
    } catch (error) {
      console.error('❌ Error actualizando cuenta corriente local:', error);
    }
  };

  const filterCourses = () => {
    let filtered = [...allCourses];
    if (selectedCategory !== 'Todas las sedes') {
      filtered = allCourses.filter(course => 
        course.sede && (course.sede.nombre === selectedCategory || course.sede.nombreSede === selectedCategory)
      );
    }
    setFilteredCourses(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };



  const calculateRefundPercentage = (startDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilStart > 10) return 100;
    if (daysUntilStart >= 1) return 70;
    if (daysUntilStart === 0) return 50;
    return 0;
  };

  const getLocationInfo = (locationId) => {
    if (locationId === 'virtual') {
      return { name: 'Virtual', address: 'Online' };
    }
    return allCourses.find(loc => loc.id === locationId);
  };

  const handleCoursePress = (course) => {
    // Always navigate to course detail screen first
    const enrollment = enrolledCourses.find(e => e.courseId === course.id);
    
    navigation.navigate('CourseDetail', { 
      course, 
      enrollment,
      isEnrolled: !!enrollment,
      userType,
      onEnroll: handleEnrollCourse // Pass the enrollment function
    });
  };

  const handleEnrollCourse = async (course, sede) => {
    setLocationModalVisible(false);
    
    console.log('=== ENROLLMENT DEBUG ===');
    console.log('User:', user);
    console.log('UserType:', userType);
    console.log('Course:', course);
    console.log('Sede:', sede);
    console.log('Account Balance:', accountBalance);
    console.log('Course Price:', course.precio);
    
    if (!user || userType !== 'student') {
      Alert.alert(
        'Acceso Restringido',
        'Debes ser un estudiante registrado para inscribirte en cursos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ir a Perfil', 
            onPress: () => navigation.navigate('Profile')
          }
        ]
      );
      return;
    }

    // Verificar si el usuario tiene fondos suficientes
    if (course.precio && accountBalance < course.precio) {
      Alert.alert(
        'Fondos Insuficientes',
        `No tienes suficiente crédito para inscribirte a este curso.\n\nCosto del curso: ${formatPrice(course.precio)}\nTu crédito actual: ${formatPrice(accountBalance)}\n\nNecesitas agregar ${formatPrice(course.precio - accountBalance)} más a tu cuenta.`,
        [
          { text: 'Entendido', style: 'cancel' },
          { 
            text: 'Agregar Fondos', 
            onPress: () => navigation.navigate('Profile')
          }
        ]
      );
      return;
    }

    try {
      // Convert IDs to integers
      const numericUserId = parseInt(user.id || user.idUsuario, 10);
      const numericCronogramaId = parseInt(course.idCronograma, 10);

      console.log('=== ENROLLMENT PARAMS ===');
      console.log('numericUserId:', numericUserId);
      console.log('numericCronogramaId:', numericCronogramaId);

      const result = await dataService.enrollInCourse(numericUserId, numericCronogramaId);
      
      console.log('=== ENROLLMENT RESULT ===');
      console.log('Result:', result);
      
      if (result) {
        // Refrescar automáticamente el saldo desde el backend
        const userId = parseInt(user.id || user.idUsuario, 10);
        await loadUserAccountBalance(userId);
        
        const sedeInfo = sede ? ` en ${sede.nombre}` : '';
        Alert.alert(
          'Inscripción Exitosa',
          `Te has inscrito exitosamente al curso "${course.title}"${sedeInfo}.\n\nSe ha descontado ${formatPrice(course.precio)} de tu cuenta corriente.\nNuevo saldo: ${formatPrice(accountBalance - course.precio)}\n\nRecibirás un email con:\n• Detalles del curso\n• Requisitos e instrucciones\n• Factura de pago\n• Información de la sede`,
          [{ text: 'OK' }]
        );
        
        // Refresh course list
        loadCourses();
      }
    } catch (error) {
      console.log('=== ENROLLMENT ERROR ===');
      console.log('Error:', error);
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
      
      // Manejar errores específicos del backend
      let errorMessage = 'No se pudo procesar tu inscripción. Por favor, intenta nuevamente.';
      
      if (error.response && error.response.data) {
        const backendError = error.response.data;
        if (typeof backendError === 'string') {
          if (backendError.includes('Fondos insuficientes')) {
            errorMessage = 'No tienes suficiente crédito en tu cuenta corriente para inscribirte a este curso.';
          } else if (backendError.includes('vacantes')) {
            errorMessage = 'No hay vacantes disponibles para este curso.';
          } else {
            errorMessage = backendError;
          }
        }
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleCancelCourse = async (course) => {
    const enrollment = enrolledCourses.find(e => e.idCurso === course.idCurso);
    if (!enrollment) return;

    const refundPercentage = calculateRefundPercentage(course.startDate);
    const refundAmount = (course.precio * refundPercentage) / 100;

    Alert.alert(
      'Cancelar Inscripción',
      `¿Estás seguro que deseas cancelar tu inscripción?\n\nReembolso: ${refundPercentage}% (${formatPrice(refundAmount)})`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, Cancelar',
          onPress: async () => {
            try {
              await dataService.cancelEnrollment(enrollment.idInscripcion, true);
              Alert.alert('Inscripción Cancelada', 'Tu inscripción ha sido cancelada exitosamente.');
              loadCourses();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la inscripción. Por favor, intenta nuevamente.');
            }
          }
        }
      ]
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderCourseCard = ({ item: course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => handleCoursePress(course)}
    >
      <Image
        source={{ uri: course.imageUrl }}
        style={styles.courseImage}
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.descripcion}
        </Text>
        <View style={styles.courseDetails}>
          <View style={styles.detailItem}>
            <Icon name="clock" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{course.duracion || 'No especificado'} horas</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="calendar" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>
              Inicia: {formatDate(course.startDate || course.fechaInicio)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="map-pin" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>
              {course.sede ? (course.sede.nombre || course.sede.nombreSede) : 'Sede no especificada'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="monitor" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{course.modalidad || 'No especificado'}</Text>
          </View>
        </View>
        <View style={styles.courseFooter}>
          <Text style={styles.coursePrice}>{course.precio !== '-' ? formatPrice(course.precio) : 'No especificado'}</Text>
          <Text style={styles.availableSeats}>
            {course.availableSeats} cupos disponibles
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLocationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={locationModalVisible}
      onRequestClose={() => setLocationModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.locationModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Sede</Text>
            <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
              <Icon name="x" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.courseModalTitle}>{selectedCourse?.title}</Text>
          
          <ScrollView style={styles.locationsContainer}>
            {selectedCourse?.locations.map((location, index) => {
              const locationInfo = getLocationInfo(location.locationId);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.locationCard}
                  onPress={() => handleEnrollCourse(selectedCourse, location)}
                  disabled={location.availableSeats <= 0}
                >
                  <View style={styles.locationHeader}>
                    <Text style={styles.locationName}>{locationInfo.name}</Text>
                    <View style={styles.locationPriceContainer}>
                      {location.discount > 0 && (
                        <Text style={styles.locationOriginalPrice}>
                          {formatPrice(selectedCourse.basePrice)}
                        </Text>
                      )}
                      <Text style={styles.locationPrice}>{formatPrice(location.price)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.locationAddress}>{locationInfo.address}</Text>
                  <Text style={styles.locationSchedule}>{location.schedule}</Text>
                  
                  {location.promotion && (
                    <View style={styles.promotionBadge}>
                      <Text style={styles.promotionText}>{location.promotion}</Text>
                    </View>
                  )}
                  
                  <View style={styles.locationFooter}>
                    <Text style={styles.availableSeats}>
                      {location.availableSeats > 0 
                        ? `${location.availableSeats} cupos disponibles`
                        : 'Sin cupos disponibles'
                      }
                    </Text>
                    {location.discount > 0 && (
                      <Text style={styles.locationDiscount}>-{location.discount}%</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderCancelModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={cancelModalVisible}
      onRequestClose={() => setCancelModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirmar Baja</Text>
            <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
              <Icon name="x" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalText}>
            ¿Seguro te quieres dar de baja del curso "{selectedCourseToCancel?.course?.title}"?
          </Text>
          
          {selectedCourseToCancel?.refundAmount > 0 && (
            <View style={styles.refundInfo}>
              <Text style={styles.refundTitle}>Información de Reintegro:</Text>
              <Text style={styles.refundAmount}>
                Monto: {formatPrice(selectedCourseToCancel.refundAmount)} 
                ({selectedCourseToCancel.refundPercentage}% del total)
              </Text>
              <Text style={styles.refundNote}>
                Puedes elegir recibir el reintegro en tu tarjeta de crédito o mantenerlo como crédito en tu cuenta para futuros cursos.
              </Text>
            </View>
          )}
          
          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={() => setCancelModalVisible(false)}
              style={styles.modalCancelButton}
              textStyle={styles.modalCancelButtonText}
            />
            {selectedCourseToCancel?.refundAmount > 0 ? (
              <View style={styles.refundOptions}>
                <Button
                  title="Reintegro a Tarjeta"
                  onPress={() => confirmCancelCourse(false)}
                  style={styles.modalConfirmButton}
                size="small"
                />
                <Button
                  title="Crédito en Cuenta"
                  onPress={() => confirmCancelCourse(true)}
                  style={styles.modalCreditButton}
                  size="small"
                />
              </View>
            ) : (
              <Button
                title="Sí, dar de baja"
                onPress={() => confirmCancelCourse(false)}
                style={styles.modalConfirmButton}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-left" size={24} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cursos de Cocina</Text>
          </View>
          
          {userType === 'student' && (
            <View style={styles.balanceInfo}>
              <Icon name="credit-card" size={16} color={accountBalance > 0 ? Colors.success : Colors.warning} />
              <Text style={[styles.balanceText, { color: accountBalance > 0 ? Colors.success : Colors.warning }]}>
                {isLoadingBalance ? 'Cargando saldo...' : `Crédito disponible: ${formatPrice(accountBalance)}`}
              </Text>
              {accountBalance === 0 && !isLoadingBalance && (
                <Text style={[styles.balanceText, { color: Colors.warning, fontSize: 12, marginLeft: 8 }]}>
                  (Sin fondos)
                </Text>
              )}
            </View>
          )}
          
          {userType !== 'student' && (
            <View style={styles.accessNotice}>
              <Icon name="info" size={16} color={Colors.warning} />
              <Text style={styles.accessNoticeText}>
                {userType === 'visitor' 
                  ? 'Regístrate como estudiante para acceder a todos los detalles y funcionalidades'
                  : 'Actualiza tu perfil a estudiante para inscribirte a cursos'
                }
              </Text>
            </View>
          )}
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
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <View key={`course-${course.id || course.idCurso || course.idCronograma || index}-${index}`}>
              {renderCourseCard({ item: course })}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="book-open" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>
              {selectedCategory === 'Mis Cursos' 
                ? 'No tienes cursos inscritos'
                : 'No hay cursos disponibles'
              }
            </Text>
            <Text style={styles.emptyText}>
              {selectedCategory === 'Mis Cursos'
                ? 'Explora nuestros cursos disponibles y encuentra el perfecto para ti.'
                : selectedCategory === 'Todas las sedes' 
                  ? 'No se encontraron cursos disponibles.'
                  : `No se encontraron cursos en la sede ${selectedCategory}.`
              }
            </Text>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {renderLocationModal()}
      {renderCancelModal()}
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
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  backButton: {
    marginRight: Metrics.baseSpacing,
  },
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.baseSpacing,
  },
  balanceText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.success,
    marginLeft: Metrics.smallSpacing,
    fontWeight: '500',
  },
  accessNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  accessNoticeText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.warning,
    marginLeft: Metrics.smallSpacing,
    flex: 1,
  },
  categoriesContainer: {
    paddingRight: Metrics.mediumSpacing,
  },
  categoryTab: {
    backgroundColor: Colors.card,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
    marginRight: Metrics.baseSpacing,
  },
  selectedCategoryTab: {
    backgroundColor: Colors.primary,
  },
  categoryTabText: {
    color: Colors.textDark,
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: Colors.card,
  },
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  courseCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    marginBottom: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 180,
  },
  courseInfo: {
    padding: Metrics.mediumSpacing,
  },
  courseTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  courseDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
  },
  courseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Metrics.mediumSpacing,
    marginBottom: Metrics.smallSpacing,
  },
  detailText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePrice: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  availableSeats: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.xLargeSpacing,
  },
  emptyTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  emptyText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.mediumLineHeight,
  },
  bottomPadding: {
    height: Metrics.xxLargeSpacing,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    margin: Metrics.mediumSpacing,
    width: '90%',
    maxHeight: '80%',
  },
  locationModalContent: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    margin: Metrics.mediumSpacing,
    width: '95%',
    maxHeight: '85%',
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
  courseModalTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
    textAlign: 'center',
  },
  locationsContainer: {
    maxHeight: 400,
  },
  locationCard: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  locationName: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  locationPriceContainer: {
    alignItems: 'flex-end',
  },
  locationOriginalPrice: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  locationPrice: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  locationAddress: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.smallSpacing,
  },
  locationSchedule: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
    fontWeight: '500',
    marginBottom: Metrics.baseSpacing,
  },
  promotionBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 4,
    borderRadius: Metrics.baseBorderRadius,
    alignSelf: 'flex-start',
    marginBottom: Metrics.baseSpacing,
  },
  promotionText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.success,
    fontWeight: '500',
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationDiscount: {
    fontSize: Metrics.smallFontSize,
    color: Colors.success,
    fontWeight: '500',
  },
  modalText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
    lineHeight: Metrics.mediumLineHeight,
  },
  refundInfo: {
    backgroundColor: Colors.info + '10',
    padding: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.mediumSpacing,
  },
  refundTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  refundAmount: {
    fontSize: Metrics.baseFontSize,
    color: Colors.success,
    fontWeight: '500',
    marginBottom: Metrics.baseSpacing,
  },
  refundNote: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.baseLineHeight,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    marginRight: Metrics.baseSpacing,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelButtonText: {
    color: Colors.textDark,
  },
  modalConfirmButton: {
    flex: 1,
    marginLeft: Metrics.baseSpacing,
    backgroundColor: Colors.error,
  },
  refundOptions: {
    flex: 2,
    marginLeft: Metrics.baseSpacing,
  },
  modalCreditButton: {
    marginTop: Metrics.baseSpacing,
    backgroundColor: Colors.success,
  },
});

export default CourseScreen;