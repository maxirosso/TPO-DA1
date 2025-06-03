import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { AuthContext } from '../../context/AuthContext';

const CourseDetailScreen = ({ route, navigation }) => {
  const { course, enrollment, isEnrolled = false } = route.params;
  const { user, isVisitor } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('overview');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLocationInfo = (locationId) => {
    const locations = {
      '1': {
        name: 'Sede Palermo',
        address: 'Av. Santa Fe 3421, Palermo, CABA',
        phone: '+54 11 4567-8901',
        facilities: ['Cocina profesional', 'Equipamiento completo', 'Estacionamiento'],
      },
      '2': {
        name: 'Sede Recoleta',
        address: 'Av. Callao 1234, Recoleta, CABA',
        phone: '+54 11 4567-8902',
        facilities: ['Cocina gourmet', 'Bodega de vinos', 'Salón de eventos'],
      },
      '3': {
        name: 'Sede Belgrano',
        address: 'Av. Cabildo 2567, Belgrano, CABA',
        phone: '+54 11 4567-8903',
        facilities: ['Laboratorio de pastelería', 'Horno industrial', 'Cámara frigorífica'],
      },
      'virtual': {
        name: 'Virtual',
        address: 'Online',
        phone: 'Soporte técnico: +54 11 4567-8900',
        facilities: ['Plataforma Zoom', 'Grabaciones disponibles', 'Chat en vivo'],
      }
    };
    return locations[locationId] || locations['virtual'];
  };

  const handleCallLocation = (phone) => {
    const phoneNumber = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleOpenMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  const handleQRScan = () => {
    navigation.navigate('QRScanner', { 
      courseId: course.id,
      enrollmentId: enrollment?.id 
    });
  };

  const handleRestrictedAction = (actionName) => {
    Alert.alert(
      'Funcionalidad Limitada',
      `Para ${actionName}, necesitas crear una cuenta. Los visitantes solo pueden ver información básica de los cursos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Crear Cuenta', 
          onPress: () => {
            // Navigate to registration
            navigation.navigate('ProfileTab');
          }
        }
      ]
    );
  };

  const renderTabButton = (tabId, title, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabId && styles.activeTabButton]}
      onPress={() => setActiveTab(tabId)}
    >
      <Icon 
        name={icon} 
        size={16} 
        color={activeTab === tabId ? Colors.card : Colors.textMedium} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tabId && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderVisitorOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.visitorNotice}>
        <Icon name="info" size={20} color={Colors.warning} />
        <Text style={styles.visitorNoticeText}>
          Modo visitante: Solo puedes ver información básica. Regístrate para acceder al contenido completo.
        </Text>
      </View>

      {/* Basic Course Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción del Curso</Text>
        <Text style={styles.sectionText}>
          {course.description || course.fullDescription?.substring(0, 200) + '...'}
        </Text>
        <TouchableOpacity 
          style={styles.readMoreButton}
          onPress={() => handleRestrictedAction('ver la descripción completa')}
        >
          <Text style={styles.readMoreText}>Leer más</Text>
          <Icon name="lock" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Basic Course Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Básica</Text>
        <View style={styles.basicDetailsGrid}>
          <View style={styles.basicDetailItem}>
            <Icon name="clock" size={16} color={Colors.primary} />
            <Text style={styles.basicDetailLabel}>Duración</Text>
            <Text style={styles.basicDetailValue}>{course.duration}</Text>
          </View>
          <View style={styles.basicDetailItem}>
            <Icon name="dollar-sign" size={16} color={Colors.primary} />
            <Text style={styles.basicDetailLabel}>Precio</Text>
            <Text style={styles.basicDetailValue}>{formatPrice(course.price)}</Text>
          </View>
        </View>
      </View>

      {/* Registration Call to Action */}
      <View style={styles.registrationCTA}>
        <Text style={styles.ctaTitle}>¿Te interesa este curso?</Text>
        <Text style={styles.ctaDescription}>
          Regístrate para acceder a información detallada, inscribirte y más.
        </Text>
        <Button
          title="Crear Cuenta"
          onPress={() => navigation.navigate('ProfileTab')}
          style={styles.ctaButton}
          fullWidth
        />
      </View>
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Course Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción del Curso</Text>
        <Text style={styles.sectionText}>{course.fullDescription}</Text>
      </View>

      {/* Instructor Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructor</Text>
        <View style={styles.instructorCard}>
          <Image
            source={{ uri: course.instructor.avatar }}
            style={styles.instructorImage}
          />
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{course.instructor.name}</Text>
            <Text style={styles.instructorExperience}>{course.instructor.experience}</Text>
            <Text style={styles.instructorBio}>{course.instructor.bio}</Text>
          </View>
        </View>
      </View>

      {/* Course Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Curso</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Icon name="clock" size={16} color={Colors.primary} />
            <Text style={styles.detailLabel}>Duración</Text>
            <Text style={styles.detailValue}>{course.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="book" size={16} color={Colors.primary} />
            <Text style={styles.detailLabel}>Horas totales</Text>
            <Text style={styles.detailValue}>{course.totalHours}h</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="calendar" size={16} color={Colors.primary} />
            <Text style={styles.detailLabel}>Inicio</Text>
            <Text style={styles.detailValue}>{formatDate(course.startDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="flag" size={16} color={Colors.primary} />
            <Text style={styles.detailLabel}>Finalización</Text>
            <Text style={styles.detailValue}>{formatDate(course.endDate)}</Text>
          </View>
        </View>
      </View>

      {/* Topics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temas a Abordar</Text>
        {course.topics.map((topic, index) => (
          <View key={index} style={styles.topicItem}>
            <Icon name="check-circle" size={16} color={Colors.success} />
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>

      {/* Practical Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividades Prácticas</Text>
        {course.practicalActivities.map((activity, index) => (
          <View key={index} style={styles.topicItem}>
            <Icon name="tool" size={16} color={Colors.warning} />
            <Text style={styles.topicText}>{activity}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRequirementsTab = () => (
    <View style={styles.tabContent}>
      {/* Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requisitos del Estudiante</Text>
        {course.requirements.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <Icon name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.requirementText}>{requirement}</Text>
          </View>
        ))}
      </View>

      {/* Provided Materials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Materiales Incluidos</Text>
        {course.providedMaterials.map((material, index) => (
          <View key={index} style={styles.providedItem}>
            <Icon name="package" size={16} color={Colors.success} />
            <Text style={styles.providedText}>{material}</Text>
          </View>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instrucciones Importantes</Text>
        {course.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>{index + 1}</Text>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderLocationTab = () => {
    const selectedLocation = course.locations.find(loc => 
      isEnrolled ? loc.locationId === enrollment?.locationId : true
    ) || course.locations[0];
    
    const locationInfo = getLocationInfo(selectedLocation.locationId);

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Sede</Text>
          
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationName}>{locationInfo.name}</Text>
              <Text style={styles.locationModality}>{course.modality}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.locationAddress}
              onPress={() => handleOpenMaps(locationInfo.address)}
            >
              <Icon name="map-pin" size={16} color={Colors.primary} />
              <Text style={styles.locationAddressText}>{locationInfo.address}</Text>
              <Icon name="external-link" size={14} color={Colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.locationPhone}
              onPress={() => handleCallLocation(locationInfo.phone)}
            >
              <Icon name="phone" size={16} color={Colors.primary} />
              <Text style={styles.locationPhoneText}>{locationInfo.phone}</Text>
            </TouchableOpacity>

            <View style={styles.scheduleInfo}>
              <Icon name="clock" size={16} color={Colors.textMedium} />
              <Text style={styles.scheduleText}>{selectedLocation.schedule}</Text>
            </View>

            {selectedLocation.promotion && (
              <View style={styles.promotionBanner}>
                <Icon name="tag" size={16} color={Colors.success} />
                <Text style={styles.promotionText}>{selectedLocation.promotion}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Facilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instalaciones</Text>
          {locationInfo.facilities.map((facility, index) => (
            <View key={index} style={styles.facilityItem}>
              <Icon name="check" size={16} color={Colors.success} />
              <Text style={styles.facilityText}>{facility}</Text>
            </View>
          ))}
        </View>

        {/* QR Code Section for Enrolled Students */}
        {isEnrolled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Registro de Asistencia</Text>
            <View style={styles.qrSection}>
              <Icon name="qr-code" size={48} color={Colors.primary} />
              <Text style={styles.qrTitle}>Escanear QR para Asistencia</Text>
              <Text style={styles.qrDescription}>
                Escanea el código QR en la entrada de la sede y del aula para registrar tu asistencia.
              </Text>
              <Button
                title="Abrir Escáner QR"
                onPress={handleQRScan}
                iconName="camera"
                style={styles.qrButton}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEnrollmentTab = () => {
    if (!isEnrolled) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.notEnrolledContainer}>
            <Icon name="info" size={48} color={Colors.textLight} />
            <Text style={styles.notEnrolledTitle}>No estás inscrito en este curso</Text>
            <Text style={styles.notEnrolledText}>
              Inscríbete para acceder a la información de tu progreso y asistencia.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {/* Enrollment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Inscripción</Text>
          <View style={styles.enrollmentCard}>
            <View style={styles.enrollmentRow}>
              <Text style={styles.enrollmentLabel}>Fecha de inscripción:</Text>
              <Text style={styles.enrollmentValue}>{formatDate(enrollment.enrollmentDate)}</Text>
            </View>
            <View style={styles.enrollmentRow}>
              <Text style={styles.enrollmentLabel}>Monto pagado:</Text>
              <Text style={styles.enrollmentValue}>{formatPrice(enrollment.paymentAmount)}</Text>
            </View>
            <View style={styles.enrollmentRow}>
              <Text style={styles.enrollmentLabel}>Método de pago:</Text>
              <Text style={styles.enrollmentValue}>{enrollment.paymentMethod}</Text>
            </View>
            <View style={styles.enrollmentRow}>
              <Text style={styles.enrollmentLabel}>Estado:</Text>
              <View style={[styles.statusBadge, 
                enrollment.status === 'active' ? styles.activeStatus : styles.inactiveStatus
              ]}>
                <Text style={styles.statusText}>
                  {enrollment.status === 'active' ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progreso del Curso</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Asistencia</Text>
              <Text style={styles.progressPercentage}>{enrollment.attendancePercentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${enrollment.attendancePercentage}%` }]}
              />
            </View>
            <Text style={styles.progressNote}>
              Mínimo requerido: 75% para aprobar el curso
            </Text>
            
            <View style={styles.classInfo}>
              <View style={styles.classInfoItem}>
                <Text style={styles.classInfoLabel}>Próxima clase:</Text>
                <Text style={styles.classInfoValue}>{enrollment.nextClass}</Text>
              </View>
              <View style={styles.classInfoItem}>
                <Text style={styles.classInfoLabel}>Clases restantes:</Text>
                <Text style={styles.classInfoValue}>{enrollment.remainingClasses}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Attendance Record */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registro de Asistencia</Text>
          {enrollment.attendanceRecord.map((record, index) => (
            <View key={index} style={styles.attendanceItem}>
              <View style={styles.attendanceDate}>
                <Text style={styles.attendanceDateText}>{formatDate(record.date)}</Text>
              </View>
              <View style={[
                styles.attendanceStatus,
                record.attended ? styles.attendedStatus : styles.absentStatus
              ]}>
                <Icon 
                  name={record.attended ? "check-circle" : "x-circle"} 
                  size={16} 
                  color={record.attended ? Colors.success : Colors.error} 
                />
                <Text style={[
                  styles.attendanceStatusText,
                  { color: record.attended ? Colors.success : Colors.error }
                ]}>
                  {record.attended ? 'Presente' : 'Ausente'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Account Balance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de Cuenta</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Saldo disponible:</Text>
              <Text style={styles.accountBalance}>{formatPrice(15000)}</Text>
            </View>
            <Text style={styles.accountNote}>
              Puedes usar tu saldo para inscribirte a otros cursos o recibir reintegros.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
      {/* Header */}
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
          <Text style={styles.headerTitle}>{course.title}</Text>
        </View>
      </LinearGradient>

      {/* Course Image and Basic Info */}
      <View style={styles.courseImageContainer}>
        <Image
          source={{ uri: course.imageUrl }}
          style={styles.courseImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        >
          <View style={styles.courseBasicInfo}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{course.level}</Text>
            </View>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseCategory}>{course.category}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('overview', 'Resumen', 'book-open')}
          {renderTabButton('requirements', 'Requisitos', 'list')}
          {renderTabButton('location', 'Ubicación', 'map-pin')}
          {renderTabButton('enrollment', 'Mi Progreso', 'user')}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (isVisitor ? renderVisitorOverviewTab() : renderOverviewTab())}
        {activeTab === 'requirements' && (isVisitor ? renderVisitorOverviewTab() : renderRequirementsTab())}
        {activeTab === 'location' && (isVisitor ? renderVisitorOverviewTab() : renderLocationTab())}
        {activeTab === 'enrollment' && (isVisitor ? renderVisitorOverviewTab() : renderEnrollmentTab())}
        
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
    alignItems: 'center',
    marginTop: Metrics.mediumSpacing,
  },
  backButton: {
    marginRight: Metrics.baseSpacing,
  },
  headerTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
  },
  courseImageContainer: {
    position: 'relative',
    height: 200,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: Metrics.mediumSpacing,
  },
  courseBasicInfo: {
    alignItems: 'flex-start',
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 4,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.baseSpacing,
  },
  levelText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.card,
  },
  courseTitle: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '600',
    color: Colors.card,
    marginBottom: 4,
  },
  courseCategory: {
    fontSize: Metrics.baseFontSize,
    color: Colors.card,
    opacity: 0.8,
  },
  tabsContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
    marginHorizontal: Metrics.smallSpacing,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
    borderRadius: Metrics.baseBorderRadius,
  },
  tabButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    marginLeft: Metrics.smallSpacing,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: Colors.card,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: Metrics.mediumSpacing,
  },
  section: {
    marginBottom: Metrics.largeSpacing,
  },
  sectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
  },
  sectionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
  },
  instructorCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Metrics.mediumSpacing,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  instructorExperience: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    marginBottom: Metrics.baseSpacing,
  },
  instructorBio: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.baseLineHeight,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginTop: Metrics.smallSpacing,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    textAlign: 'center',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Metrics.baseSpacing,
  },
  topicText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.baseSpacing,
    flex: 1,
    lineHeight: Metrics.baseLineHeight,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Metrics.baseSpacing,
    backgroundColor: Colors.error + '10',
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  requirementText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.baseSpacing,
    flex: 1,
  },
  providedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Metrics.baseSpacing,
    backgroundColor: Colors.success + '10',
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  providedText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.baseSpacing,
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Metrics.baseSpacing,
    backgroundColor: Colors.card,
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  instructionNumber: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: Metrics.baseSpacing,
    minWidth: 20,
  },
  instructionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    flex: 1,
    lineHeight: Metrics.baseLineHeight,
  },
  locationCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  locationName: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  locationModality: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  locationAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  locationAddressText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.baseSpacing,
    flex: 1,
  },
  locationPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  locationPhoneText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    marginLeft: Metrics.baseSpacing,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  scheduleText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.baseSpacing,
    fontWeight: '500',
  },
  promotionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  promotionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.success,
    marginLeft: Metrics.baseSpacing,
    fontWeight: '500',
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  facilityText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.baseSpacing,
  },
  qrSection: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.largeSpacing,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  qrDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.baseLineHeight,
    marginBottom: Metrics.mediumSpacing,
  },
  qrButton: {
    minWidth: 200,
  },
  notEnrolledContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.xLargeSpacing,
  },
  notEnrolledTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  notEnrolledText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.mediumLineHeight,
  },
  enrollmentCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  enrollmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  enrollmentLabel: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  enrollmentValue: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  statusBadge: {
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 4,
    borderRadius: Metrics.baseBorderRadius,
  },
  activeStatus: {
    backgroundColor: Colors.success + '20',
  },
  inactiveStatus: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  progressTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  progressPercentage: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: Metrics.roundedFull,
    overflow: 'hidden',
    marginBottom: Metrics.baseSpacing,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Metrics.roundedFull,
  },
  progressNote: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.mediumSpacing,
  },
  classInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classInfoItem: {
    flex: 1,
  },
  classInfoLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: 4,
  },
  classInfoValue: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.baseSpacing,
  },
  attendanceDate: {
    flex: 1,
  },
  attendanceDateText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendedStatus: {
    backgroundColor: Colors.success + '10',
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 4,
    borderRadius: Metrics.baseBorderRadius,
  },
  absentStatus: {
    backgroundColor: Colors.error + '10',
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 4,
    borderRadius: Metrics.baseBorderRadius,
  },
  attendanceStatusText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    marginLeft: Metrics.smallSpacing,
  },
  accountCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  accountLabel: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  accountBalance: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.success,
  },
  accountNote: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.baseLineHeight,
  },
  bottomPadding: {
    height: Metrics.xxLargeSpacing,
  },
  visitorNotice: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.largeSpacing,
  },
  visitorNoticeText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Metrics.baseSpacing,
  },
  readMoreText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    marginLeft: Metrics.baseSpacing,
  },
  basicDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  basicDetailItem: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    alignItems: 'center',
  },
  basicDetailLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginTop: Metrics.smallSpacing,
    marginBottom: 4,
  },
  basicDetailValue: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    textAlign: 'center',
  },
  registrationCTA: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginTop: Metrics.largeSpacing,
  },
  ctaTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  ctaDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.baseSpacing,
  },
  ctaButton: {
    minWidth: '100%',
  },
});

export default CourseDetailScreen; 