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

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { AuthContext } from '../../context/AuthContext';

// Mock data for company locations
const companyLocations = [
  {
    id: '1',
    name: 'Sede Palermo',
    address: 'Av. Santa Fe 3421, Palermo, CABA',
    phone: '+54 11 4567-8901',
    email: 'palermo@chefnet.com',
    coordinates: { lat: -34.5875, lng: -58.3974 },
    facilities: ['Cocina profesional', 'Equipamiento completo', 'Estacionamiento'],
    capacity: 24,
  },
  {
    id: '2',
    name: 'Sede Recoleta',
    address: 'Av. Callao 1234, Recoleta, CABA',
    phone: '+54 11 4567-8902',
    email: 'recoleta@chefnet.com',
    coordinates: { lat: -34.5936, lng: -58.3962 },
    facilities: ['Cocina gourmet', 'Bodega de vinos', 'Salón de eventos'],
    capacity: 16,
  },
  {
    id: '3',
    name: 'Sede Belgrano',
    address: 'Av. Cabildo 2567, Belgrano, CABA',
    phone: '+54 11 4567-8903',
    email: 'belgrano@chefnet.com',
    coordinates: { lat: -34.5627, lng: -58.4583 },
    facilities: ['Laboratorio de pastelería', 'Horno industrial', 'Cámara frigorífica'],
    capacity: 20,
  },
];

// Enhanced course data with multiple locations and detailed information
const allCourses = [
  {
    id: '1',
    title: 'Cocina Italiana Básica',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
    category: 'Almuerzo',
    level: 'Principiante',
    shortDescription: 'Aprende los fundamentos de la cocina italiana, desde pastas auténticas hasta salsas clásicas.',
    fullDescription: 'Un curso completo que te enseñará las técnicas tradicionales de la cocina italiana. Aprenderás a preparar pastas frescas, salsas clásicas como carbonara y bolognesa, y platos principales como osso buco y risotto. Este curso incluye técnicas de amasado, cocción al dente, y secretos de la nonna italiana.',
    instructor: {
      name: 'Chef Marco Rossi',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
      experience: '15 años de experiencia',
      bio: 'Chef italiano con formación en Roma y Milán. Especialista en cocina tradicional del norte de Italia.',
    },
    basePrice: 30000,
    duration: '6 semanas',
    totalHours: 24,
    startDate: '2024-02-15',
    endDate: '2024-03-28',
    requirements: ['Delantal', 'Gorro de cocina', 'Cuaderno de notas'],
    providedMaterials: ['Ingredientes frescos', 'Utensilios básicos', 'Recetario impreso'],
    topics: [
      'Historia y fundamentos de la cocina italiana',
      'Preparación de pasta fresca (tagliatelle, ravioli, gnocchi)',
      'Salsas tradicionales (carbonara, amatriciana, pesto)',
      'Técnicas de cocción y timing',
      'Risottos clásicos',
      'Presentación y maridajes'
    ],
    practicalActivities: [
      'Preparación de 3 tipos de pasta fresca',
      'Elaboración de 5 salsas clásicas',
      'Cocción de risotto perfecto',
      'Menú completo italiano de 3 pasos'
    ],
    instructions: [
      'Llegar 15 minutos antes del inicio',
      'Traer delantal y gorro limpios',
      'Cabello recogido obligatorio',
      'No usar perfumes fuertes',
      'Uñas cortas y sin esmalte'
    ],
    isPopular: true,
    locations: [
      {
        locationId: '1',
        schedule: 'Martes y Jueves 18:00-20:00',
        price: 25000,
        discount: 17,
        promotion: 'Descuento por inauguración',
        maxStudents: 12,
        currentStudents: 8,
        availableSeats: 4,
      },
      {
        locationId: '2',
        schedule: 'Sábados 10:00-14:00',
        price: 28000,
        discount: 7,
        promotion: 'Descuento fin de semana',
        maxStudents: 10,
        currentStudents: 6,
        availableSeats: 4,
      }
    ],
    modality: 'Presencial',
    status: 'available', // available, full, completed, cancelled
  },
  {
    id: '2',
    title: 'Cocina Basada en Plantas',
    imageUrl: 'https://images.unsplash.com/photo-1516685018646-549198525c1b',
    category: 'Almuerzo',
    level: 'Todos los Niveles',
    shortDescription: 'Domina el arte de crear comidas deliciosas y nutritivas basadas en plantas.',
    fullDescription: 'Descubre cómo crear platos vegetarianos y veganos llenos de sabor y nutrición. Aprenderás técnicas de cocción, combinaciones de sabores y presentación profesional. Este curso revolucionará tu forma de ver la cocina sin productos animales.',
    instructor: {
      name: 'Chef Sarah Green',
      avatar: 'https://images.unsplash.com/photo-1611432579699-484f7990b127',
      experience: '10 años de experiencia',
      bio: 'Especialista en cocina plant-based con certificación internacional en nutrición vegana.',
    },
    basePrice: 22000,
    duration: '4 semanas',
    totalHours: 16,
    startDate: '2024-02-10',
    endDate: '2024-03-02',
    requirements: ['Ingredientes básicos (lista proporcionada)'],
    providedMaterials: ['Recetario digital', 'Videos tutoriales', 'Guía nutricional'],
    topics: [
      'Fundamentos de la nutrición vegetal',
      'Proteínas vegetales y combinaciones',
      'Técnicas de marinado y condimentación',
      'Sustitutos de ingredientes animales',
      'Fermentación básica',
      'Presentación creativa'
    ],
    practicalActivities: [
      'Preparación de leches vegetales',
      'Elaboración de quesos veganos',
      'Hamburguesas y albóndigas vegetales',
      'Postres sin lácteos ni huevos'
    ],
    instructions: [
      'Curso 100% virtual',
      'Conexión estable a internet requerida',
      'Cámara encendida durante las clases',
      'Ingredientes preparados antes de cada sesión'
    ],
    isPopular: true,
    locations: [
      {
        locationId: 'virtual',
        schedule: 'Sábados 10:00-13:00',
        price: 22000,
        discount: 0,
        promotion: null,
        maxStudents: 25,
        currentStudents: 18,
        availableSeats: 7,
      }
    ],
    modality: 'Virtual',
    status: 'available',
  },
  {
    id: '3',
    title: 'Cenas Gourmet',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    category: 'Cena',
    level: 'Avanzado',
    shortDescription: 'Aprende a preparar cenas elegantes y sofisticadas para ocasiones especiales.',
    fullDescription: 'Un curso avanzado para crear menús de cena gourmet. Incluye técnicas de alta cocina, maridajes y presentación profesional. Dirigido a cocineros con experiencia previa que buscan perfeccionar sus habilidades.',
    instructor: {
      name: 'Chef Antoine Dubois',
      avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90',
      experience: '20 años de experiencia',
      bio: 'Chef francés con estrella Michelin. Especialista en alta cocina y técnicas moleculares.',
    },
    basePrice: 45000,
    duration: '8 semanas',
    totalHours: 32,
    startDate: '2024-03-01',
    endDate: '2024-04-26',
    requirements: ['Experiencia previa en cocina', 'Cuchillos profesionales', 'Mandil profesional'],
    providedMaterials: ['Ingredientes premium', 'Equipamiento profesional', 'Certificado de finalización'],
    topics: [
      'Técnicas de alta cocina francesa',
      'Maridajes con vinos y espirituosos',
      'Presentación gourmet y emplatado',
      'Menús de temporada y estacionales',
      'Cocina molecular básica',
      'Gestión de costos en alta cocina'
    ],
    practicalActivities: [
      'Menú degustación de 7 pasos',
      'Técnicas de sous vide',
      'Elaboración de espumas y geles',
      'Cena completa para 4 comensales'
    ],
    instructions: [
      'Experiencia mínima de 2 años requerida',
      'Evaluación previa obligatoria',
      'Uniforme completo de chef',
      'Puntualidad estricta',
      'Compromiso de asistencia 100%'
    ],
    isPopular: false,
    locations: [
      {
        locationId: '2',
        schedule: 'Viernes 19:00-22:00',
        price: 35000,
        discount: 22,
        promotion: 'Descuento por lanzamiento',
        maxStudents: 8,
        currentStudents: 3,
        availableSeats: 5,
      }
    ],
    modality: 'Presencial',
    status: 'available',
  },
  {
    id: '4',
    title: 'Pastelería Francesa',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    category: 'Cena',
    level: 'Intermedio',
    shortDescription: 'Domina las técnicas clásicas de la pastelería francesa.',
    fullDescription: 'Aprende a crear postres franceses clásicos como macarons, éclairs, tartas y mousses con técnicas profesionales. Este curso te dará las bases sólidas para convertirte en un pastelero experto.',
    instructor: {
      name: 'Chef Marie Leclerc',
      avatar: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65',
      experience: '12 años de experiencia',
      bio: 'Maître Pâtissière formada en París. Especialista en técnicas clásicas francesas.',
    },
    basePrice: 32000,
    duration: '6 semanas',
    totalHours: 24,
    startDate: '2024-02-18',
    endDate: '2024-03-31',
    requirements: ['Delantal', 'Manga pastelera', 'Espátulas básicas'],
    providedMaterials: ['Ingredientes premium', 'Moldes especializados', 'Kit de decoración'],
    topics: [
      'Masas básicas francesas (pâte brisée, sablée, feuilletée)',
      'Cremas y rellenos clásicos',
      'Técnicas de decoración profesional',
      'Métodos de horneado y control de temperatura',
      'Macarons perfectos',
      'Conservación y presentación'
    ],
    practicalActivities: [
      'Elaboración de 5 tipos de masas',
      'Preparación de cremas básicas',
      'Decoración con manga y boquillas',
      'Proyecto final: tarta personalizada'
    ],
    instructions: [
      'Cabello completamente recogido',
      'Uñas cortas sin esmalte',
      'Ropa cómoda y cerrada',
      'Puntualidad estricta por tiempos de horneado',
      'Traer recipientes para llevar preparaciones'
    ],
    isPopular: true,
    locations: [
      {
        locationId: '3',
        schedule: 'Domingos 14:00-17:00',
        price: 28000,
        discount: 12,
        promotion: 'Descuento estudiantes',
        maxStudents: 10,
        currentStudents: 9,
        availableSeats: 1,
      }
    ],
    modality: 'Presencial',
    status: 'available',
  },
];

// Mock enrolled courses for student
const enrolledCourses = [
  {
    courseId: '4',
    locationId: '3',
    enrollmentDate: '2024-01-15',
    paymentAmount: 28000,
    paymentMethod: 'Tarjeta de crédito ****1234',
    status: 'active', // active, completed, cancelled
    attendancePercentage: 85,
    attendanceRecord: [
      { date: '2024-02-18', attended: true },
      { date: '2024-02-25', attended: true },
      { date: '2024-03-03', attended: false },
      { date: '2024-03-10', attended: true },
      { date: '2024-03-17', attended: true },
    ],
    nextClass: '2024-03-24 14:00',
    remainingClasses: 2,
    canCancel: true,
    cancellationDeadline: '2024-02-08',
    refundPercentage: 0, // Based on current date vs start date
  }
];

// Course categories
const courseCategories = [
  'Todos los cursos',
  'Populares', 
  'Almuerzo',
  'Cena',
  'Mis Cursos',
];

const CourseScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos los cursos');
  const [filteredCourses, setFilteredCourses] = useState(allCourses);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedCourseToCancel, setSelectedCourseToCancel] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { user } = useContext(AuthContext);
  
  // Mock user type - in real app this would come from auth context
  const [userType, setUserType] = useState('student'); // 'visitor', 'user', 'student'
  const [accountBalance, setAccountBalance] = useState(15000); // Student account balance

  useEffect(() => {
    filterCourses();
  }, [selectedCategory]);

  const filterCourses = () => {
    let filtered = [...allCourses];
    
    switch (selectedCategory) {
      case 'Todos los cursos':
        filtered = allCourses;
        break;
      case 'Populares':
        filtered = allCourses.filter(course => course.isPopular);
        break;
      case 'Almuerzo':
        filtered = allCourses.filter(course => course.category === 'Almuerzo');
        break;
      case 'Cena':
        filtered = allCourses.filter(course => course.category === 'Cena');
        break;
      case 'Mis Cursos':
        filtered = allCourses.filter(course => 
          enrolledCourses.some(enrolled => enrolled.courseId === course.id)
        );
        break;
      default:
        filtered = allCourses;
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
    return companyLocations.find(loc => loc.id === locationId);
  };

  const handleCoursePress = (course) => {
    if (userType !== 'student') {
      Alert.alert(
        'Acceso Restringido',
        userType === 'visitor' 
          ? 'Regístrate como estudiante para ver los detalles completos del curso.'
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

    // Check if already enrolled
    const enrollment = enrolledCourses.find(e => e.courseId === course.id);
    if (enrollment) {
      navigation.navigate('CourseDetail', { 
        course, 
        enrollment,
        isEnrolled: true 
      });
      return;
    }

    // Show location selection if multiple locations
    if (course.locations.length > 1) {
      setSelectedCourse(course);
      setLocationModalVisible(true);
    } else {
      handleEnrollCourse(course, course.locations[0]);
    }
  };

  const handleEnrollCourse = (course, location) => {
    setLocationModalVisible(false);
    
    if (location.availableSeats <= 0) {
      Alert.alert(
        'Curso Completo',
        'Este curso ya no tiene cupos disponibles en esta sede. Te notificaremos si se abren nuevos cupos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const finalPrice = location.price;
    const locationInfo = getLocationInfo(location.locationId);

    Alert.alert(
      'Confirmar Inscripción',
      `Curso: ${course.title}\nSede: ${locationInfo.name}\nHorario: ${location.schedule}\nPrecio: ${formatPrice(finalPrice)}\n\n${location.promotion ? `Promoción: ${location.promotion}\n` : ''}El pago se realizará con tu tarjeta de crédito registrada.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Inscribirse', 
          onPress: () => processEnrollment(course, location)
        }
      ]
    );
  };

  const processEnrollment = async (course, location) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment processing
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        // Add to enrolled courses
        const newEnrollment = {
          courseId: course.id,
          locationId: location.locationId,
          enrollmentDate: new Date().toISOString().split('T')[0],
          paymentAmount: location.price,
          paymentMethod: 'Tarjeta de crédito ****1234',
          status: 'active',
          attendancePercentage: 0,
          attendanceRecord: [],
          nextClass: course.startDate + ' ' + location.schedule.split(' ')[2],
          remainingClasses: course.totalHours / 4, // Assuming 4 hours per class
          canCancel: true,
          cancellationDeadline: course.startDate,
          refundPercentage: calculateRefundPercentage(course.startDate),
        };
        
        enrolledCourses.push(newEnrollment);
        
        Alert.alert(
          'Inscripción Exitosa',
          `Te has inscrito exitosamente al curso "${course.title}".\n\nRecibirás un email con:\n• Detalles del curso\n• Requisitos e instrucciones\n• Factura de pago\n• Información de la sede`,
          [{ text: 'OK' }]
        );
        
        filterCourses();
      } else {
        Alert.alert(
          'Error en el Pago',
          'No se pudo procesar el pago con tu tarjeta de crédito. Verifica los datos de tu tarjeta o intenta con otro método de pago.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Ups, parece que ha habido un error al procesar tu inscripción. Por favor, intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelCourse = (course) => {
    const enrollment = enrolledCourses.find(e => e.courseId === course.id);
    if (!enrollment) return;

    const refundPercentage = calculateRefundPercentage(course.startDate);
    const refundAmount = (enrollment.paymentAmount * refundPercentage) / 100;

    setSelectedCourseToCancel({ course, enrollment, refundPercentage, refundAmount });
    setCancelModalVisible(true);
  };

  const confirmCancelCourse = async (useAccountCredit = false) => {
    try {
      setCancelModalVisible(false);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        const { course, enrollment, refundAmount } = selectedCourseToCancel;
        
        // Remove from enrolled courses
        const index = enrolledCourses.findIndex(e => e.courseId === course.id);
        if (index > -1) {
          enrolledCourses.splice(index, 1);
        }
        
        // Update account balance if using credit
        if (useAccountCredit && refundAmount > 0) {
          setAccountBalance(prev => prev + refundAmount);
        }
        
        Alert.alert(
          'Baja Exitosa',
          `Te has dado de baja del curso "${course.title}" exitosamente.\n\n${refundAmount > 0 ? `Reintegro: ${formatPrice(refundAmount)}\n${useAccountCredit ? 'Acreditado en tu cuenta corriente' : 'Se procesará en tu tarjeta de crédito en 5-7 días hábiles'}` : 'No corresponde reintegro según las políticas de cancelación.'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Ups, parece que ha habido un error al procesar tu baja. Por favor, intenta nuevamente o contacta con atención al cliente.',
          [{ text: 'OK' }]
        );
      }
      
      setSelectedCourseToCancel(null);
      filterCourses();
    } catch (error) {
      Alert.alert(
        'Error',
        'Ups, parece que ha habido un error al procesar tu baja. Por favor, intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
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

  const renderCourseCard = (course) => {
    const canViewDetails = userType === 'student';
    const enrollment = enrolledCourses.find(e => e.courseId === course.id);
    const isEnrolled = !!enrollment;
    
    // Get best price across all locations
    const bestLocation = course.locations.reduce((best, current) => 
      current.price < best.price ? current : best
    );
    
    return (
      <TouchableOpacity 
        key={course.id} 
        style={styles.courseCard}
        onPress={() => handleCoursePress(course)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: course.imageUrl }}
          style={styles.courseImage}
          resizeMode="cover"
        />
        <View style={styles.courseContent}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <View style={[
              styles.levelBadge,
              course.level === 'Principiante' ? styles.beginnerBadge : 
              course.level === 'Avanzado' ? styles.advancedBadge : styles.intermediateBadge
            ]}>
              <Text style={styles.levelText}>{course.level}</Text>
            </View>
          </View>
          
          <Text style={styles.courseDescription}>
            {canViewDetails ? course.fullDescription : course.shortDescription}
          </Text>
          
          {canViewDetails && (
            <View style={styles.courseDetails}>
              <View style={styles.detailRow}>
                <Icon name="clock" size={14} color={Colors.textMedium} />
                <Text style={styles.detailText}>{course.duration} • {course.totalHours}h totales</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="map-pin" size={14} color={Colors.textMedium} />
                <Text style={styles.detailText}>
                  {course.modality} • {course.locations.length} sede{course.locations.length > 1 ? 's' : ''} disponible{course.locations.length > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="users" size={14} color={Colors.textMedium} />
                <Text style={styles.detailText}>
                  {course.locations.reduce((total, loc) => total + loc.availableSeats, 0)} cupos disponibles
                </Text>
              </View>
              {isEnrolled && (
                <View style={styles.enrollmentInfo}>
                  <View style={styles.detailRow}>
                    <Icon name="check-circle" size={14} color={Colors.success} />
                    <Text style={[styles.detailText, { color: Colors.success }]}>
                      Inscrito • {enrollment.attendancePercentage}% asistencia
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="calendar" size={14} color={Colors.primary} />
                    <Text style={[styles.detailText, { color: Colors.primary }]}>
                      Próxima clase: {enrollment.nextClass}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.courseFooter}>
            <View style={styles.instructorContainer}>
              <Image
                source={{ uri: course.instructor.avatar }}
                style={styles.instructorAvatar}
              />
              <View>
                <Text style={styles.instructorName}>{course.instructor.name}</Text>
                {canViewDetails && (
                  <Text style={styles.instructorExperience}>{course.instructor.experience}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.priceContainer}>
              {bestLocation.discount > 0 && (
                <Text style={styles.originalPrice}>{formatPrice(course.basePrice)}</Text>
              )}
              <Text style={styles.coursePrice}>
                Desde {formatPrice(bestLocation.price)}
              </Text>
              {bestLocation.discount > 0 && (
                <Text style={styles.discountBadge}>-{bestLocation.discount}%</Text>
              )}
            </View>
          </View>
          
          {canViewDetails && (
            <View style={styles.actionContainer}>
              {isEnrolled ? (
                <View style={styles.enrolledActions}>
                  <Button
                    title="Ver Detalles"
                    onPress={() => navigation.navigate('CourseDetail', { 
                      course, 
                      enrollment,
                      isEnrolled: true 
                    })}
                    style={styles.detailButton}
                    size="small"
                  />
                  <Button
                    title="Cancelar Curso"
                    onPress={() => handleCancelCourse(course)}
                    style={styles.cancelButton}
                    textStyle={styles.cancelButtonText}
                    size="small"
                  />
                </View>
              ) : (
                <Button
                  title={course.locations.length > 1 ? 'Ver Sedes' : 'Inscribirse'}
                  onPress={() => handleCoursePress(course)}
                  style={styles.buyButton}
                />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
          
          {userType === 'student' && accountBalance > 0 && (
            <View style={styles.balanceInfo}>
              <Icon name="credit-card" size={16} color={Colors.success} />
              <Text style={styles.balanceText}>
                Crédito disponible: {formatPrice(accountBalance)}
              </Text>
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
          data={courseCategories}
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
          filteredCourses.map(course => renderCourseCard(course))
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
                : 'No se encontraron cursos en esta categoría.'
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
  courseContent: {
    padding: Metrics.mediumSpacing,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Metrics.baseSpacing,
  },
  courseTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  levelBadge: {
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 4,
    borderRadius: Metrics.baseBorderRadius,
  },
  beginnerBadge: {
    backgroundColor: Colors.success + '20',
  },
  intermediateBadge: {
    backgroundColor: Colors.warning + '20',
  },
  advancedBadge: {
    backgroundColor: Colors.error + '20',
  },
  levelText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  courseDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.mediumSpacing,
  },
  courseDetails: {
    marginBottom: Metrics.mediumSpacing,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.smallSpacing,
  },
  detailText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: Metrics.smallSpacing,
  },
  enrollmentInfo: {
    backgroundColor: Colors.success + '10',
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginTop: Metrics.baseSpacing,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Metrics.baseSpacing,
  },
  instructorName: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  instructorExperience: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  coursePrice: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  discountBadge: {
    fontSize: Metrics.smallFontSize,
    color: Colors.success,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
  },
  buyButton: {
    flex: 1,
    height: 44,
  },
  enrolledActions: {
    flexDirection: 'row',
    flex: 1,
  },
  detailButton: {
    flex: 1,
    height: 44,
    marginRight: Metrics.baseSpacing,
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  cancelButtonText: {
    color: Colors.error,
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
  availableSeats: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
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