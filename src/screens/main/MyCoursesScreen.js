import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import dataService from '../../services/dataService';

const MyCoursesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingCourses, setUpcomingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      let userId = null;
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        userId = parsed.id || parsed.idUsuario;
      }
      if (!userId) throw new Error('Usuario no autenticado');
      const userCourses = await dataService.getUserCourses(userId);
      setEnrolledCourses(userCourses.filter(c => c.status === 'active'));
      setUpcomingCourses(userCourses.filter(c => c.status === 'upcoming'));
    } catch (err) {
      setError('No se pudieron cargar tus cursos.');
      setEnrolledCourses([]);
      setUpcomingCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCourses = () => {
    switch (activeTab) {
      case 'active':
        return enrolledCourses.filter(course => course.status === 'active');
      case 'completed':
        return enrolledCourses.filter(course => course.status === 'completed');
      case 'upcoming':
        return upcomingCourses;
      default:
        return [];
    }
  };

  const calculateAttendancePercentage = (course) => {
    if (!Array.isArray(course.attendance)) return 0;
    const totalSessions = course.attendance.length;
    if (totalSessions === 0) return 0;
    const attendedSessions = course.attendance.filter(session => session.attended).length;
    return (attendedSessions / totalSessions) * 100;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatNextSession = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const day = date.toLocaleDateString(undefined, { weekday: 'long' });
    const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    
    return `${day}, ${time}`;
  };

  const handleAttendanceQR = (course) => {
    // Navegar solo si el id del curso es válido
    if (!course.id) {
      Alert.alert('Error', 'No se puede registrar asistencia porque el curso no tiene un identificador válido.');
      return;
    }
    navigation.navigate('QRScannerScreen', { courseId: course.id });
  };

  const handleCancelCourse = (course) => {
    // Verificar que el curso tenga un ID de inscripción válido
    if (!course.idInscripcion) {
      Alert.alert('Error', 'No se puede cancelar la inscripción porque no se encontró el ID de inscripción.');
      return;
    }

    const today = new Date();
    const startDate = new Date(course.startDate);
    const daysDifference = Math.floor((startDate - today) / (1000 * 60 * 60 * 24));
    
    let refundPercentage = 0;
    if (daysDifference >= 10) {
      refundPercentage = 100;
    } else if (daysDifference >= 1 && daysDifference < 10) {
      refundPercentage = 70;
    } else if (daysDifference === 0) {
      refundPercentage = 50;
    }
    
    Alert.alert(
      'Cancelar Inscripción',
      `¿Estás seguro de que deseas cancelar tu inscripción al curso "${course.title}"?\n\nReembolso estimado: ${refundPercentage}%`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dataService.cancelEnrollment(course.idInscripcion, true);
              Alert.alert(
                'Inscripción Cancelada',
                `Has cancelado tu inscripción al curso "${course.title}". Se ha iniciado el proceso de reembolso del ${refundPercentage}% del valor del curso.`
              );
              // Recargar la lista de cursos
              loadCourses();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la inscripción. Por favor, intenta nuevamente.');
            }
          },
        },
      ]
    );
  };

  const renderActiveCourseItem = ({ item }) => {
    const nextSessionFormatted = formatNextSession(item.nextSession);
    const attendancePercentage = calculateAttendancePercentage(item);
    const isAttendanceSufficient = attendancePercentage >= 75;

    return (
      <View style={styles.courseCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.courseImage} />
        
        <View style={styles.courseContent}>
          <Text style={styles.courseTitle}>{item.title}</Text>
          
          <View style={styles.courseInfo}>
            <View style={styles.infoRow}>
              <Icon name="map-pin" size={14} color={Colors.textMedium} />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="user" size={14} color={Colors.textMedium} />
              <Text style={styles.infoText}>{item.instructor}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="calendar" size={14} color={Colors.textMedium} />
              <Text style={styles.infoText}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>
          
          {item.status === 'active' && nextSessionFormatted && (
            <View style={styles.nextSessionContainer}>
              <Text style={styles.nextSessionLabel}>Próxima clase:</Text>
              <Text style={styles.nextSessionDate}>{nextSessionFormatted}</Text>
            </View>
          )}
          
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Progreso del curso</Text>
              <Text style={styles.progressPercentage}>{item.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
          </View>
          
          <View style={styles.attendanceContainer}>
            <View style={styles.attendanceInfo}>
              <Text style={styles.attendanceLabel}>Asistencia</Text>
              <Text 
                style={[
                  styles.attendancePercentage,
                  isAttendanceSufficient ? styles.sufficientAttendance : styles.insufficientAttendance
                ]}
              >
                {attendancePercentage.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.attendanceBar}>
              <View 
                style={[
                  styles.attendanceFill, 
                  { 
                    width: `${attendancePercentage}%`,
                    backgroundColor: isAttendanceSufficient ? Colors.success : Colors.warning
                  }
                ]} 
              />
              <View 
                style={[
                  styles.attendanceThreshold, 
                  { left: '75%' }
                ]}
              />
            </View>
            <Text style={styles.attendanceNote}>
              Mínimo requerido: 75%
            </Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <Button
              title="Marcar Asistencia"
              onPress={() => handleAttendanceQR(item)}
              type="primary"
              size="small"
              iconName="check-circle"
              style={styles.attendanceButton}
            />
            
            <Button
              title="Cancelar Curso"
              onPress={() => handleCancelCourse(item)}
              type="outline"
              size="small"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderCompletedCourseItem = ({ item }) => {
    const attendancePercentage = calculateAttendancePercentage(item);
    const isAttendanceSufficient = attendancePercentage >= 75;
    const isPassed = item.progress >= 90 && isAttendanceSufficient;

    return (
      <View style={styles.courseCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.courseImage} />
        
        <View style={styles.courseContent}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <View style={[
              styles.statusBadge,
              isPassed ? styles.passedBadge : styles.failedBadge
            ]}>
              <Text style={styles.statusText}>
                {isPassed ? 'Aprobado' : 'No Aprobado'}
              </Text>
            </View>
          </View>
          
          <View style={styles.courseInfo}>
            <View style={styles.infoRow}>
              <Icon name="map-pin" size={14} color={Colors.textMedium} />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="user" size={14} color={Colors.textMedium} />
              <Text style={styles.infoText}>{item.instructor}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="calendar" size={14} color={Colors.textMedium} />
              <Text style={styles.infoText}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>
          
          <View style={styles.attendanceContainer}>
            <View style={styles.attendanceInfo}>
              <Text style={styles.attendanceLabel}>Asistencia Final</Text>
              <Text 
                style={[
                  styles.attendancePercentage,
                  isAttendanceSufficient ? styles.sufficientAttendance : styles.insufficientAttendance
                ]}
              >
                {attendancePercentage.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.attendanceBar}>
              <View 
                style={[
                  styles.attendanceFill, 
                  { 
                    width: `${attendancePercentage}%`,
                    backgroundColor: isAttendanceSufficient ? Colors.success : Colors.warning
                  }
                ]} 
              />
              <View 
                style={[
                  styles.attendanceThreshold, 
                  { left: '75%' }
                ]}
              />
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <Button
              title="Ver Certificado"
              onPress={() => Alert.alert('Certificado', 'Función para ver e imprimir el certificado del curso.')}
              type="primary"
              size="small"
              iconName="award"
              style={styles.certificateButton}
              disabled={!isPassed}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderUpcomingCourseItem = ({ item }) => {
    return (
      <View style={styles.courseCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.courseImage} />
        
        <View style={styles.courseContent}>
          <Text style={styles.courseTitle}>{item.title}</Text>
          
          <View style={styles.courseInfo}>
            <View style={styles.infoRow}>
              <Icon name="map-pin" size={14} color={Colors.textMedium} />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="user" size={14} color={Colors.textMedium} />
              <Text style={styles.infoText}>{item.instructor}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="calendar" size={14} color={Colors.textMedium} />
              <Text style={styles.infoText}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>
          
          <View style={styles.upcomingInfoContainer}>
            <Icon name="clock" size={20} color={Colors.primary} />
            <Text style={styles.upcomingInfoText}>
              Inicia en {Math.floor((new Date(item.startDate) - new Date()) / (1000 * 60 * 60 * 24))} días
            </Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <Button
              title="Ver Detalles"
              onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
              type="primary"
              size="small"
              iconName="info"
              style={styles.detailsButton}
            />
            
            <Button
              title="Cancelar Inscripción"
              onPress={() => handleCancelCourse(item)}
              type="outline"
              size="small"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderCourseItem = ({ item }) => {
    switch (activeTab) {
      case 'active':
        return renderActiveCourseItem({ item });
      case 'completed':
        return renderCompletedCourseItem({ item });
      case 'upcoming':
        return renderUpcomingCourseItem({ item });
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mis Cursos</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'active' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.activeTabText,
            ]}
          >
            En Curso
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'completed' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.activeTabText,
            ]}
          >
            Completados
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Próximos
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={getFilteredCourses()}
        renderItem={renderCourseItem}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : `course_${index}`)}
        contentContainerStyle={styles.coursesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="book-open" size={60} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>
              No tienes cursos {activeTab === 'active' ? 'activos' : activeTab === 'completed' ? 'completados' : 'próximos'}
            </Text>
            <Text style={styles.emptyText}>
              Explora nuestro catálogo de cursos para inscribirte en uno.
            </Text>
            <Button
              title="Ver Cursos Disponibles"
              onPress={() => navigation.navigate('CoursesTab')}
              style={styles.exploreButton}
            />
          </View>
        }
      />
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
    paddingVertical: Metrics.mediumSpacing,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingHorizontal: Metrics.mediumSpacing,
  },
  tab: {
    paddingVertical: Metrics.mediumSpacing,
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
  coursesList: {
    padding: Metrics.mediumSpacing,
    paddingBottom: Metrics.xxLargeSpacing,
  },
  courseCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    overflow: 'hidden',
    marginBottom: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseImage: {
    width: '100%',
    height: 140,
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
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Metrics.baseBorderRadius,
    marginLeft: Metrics.baseSpacing,
  },
  passedBadge: {
    backgroundColor: Colors.success + '20', // 20% opacity
  },
  failedBadge: {
    backgroundColor: Colors.error + '20', // 20% opacity
  },
  statusText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
  },
  courseInfo: {
    marginBottom: Metrics.baseSpacing,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 8,
  },
  nextSessionContainer: {
    backgroundColor: Colors.primary + '10', // 10% opacity
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.baseSpacing,
  },
  nextSessionLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: 2,
  },
  nextSessionDate: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.primary,
  },
  progressContainer: {
    marginBottom: Metrics.baseSpacing,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  progressPercentage: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: Metrics.roundedFull,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Metrics.roundedFull,
  },
  attendanceContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  attendanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  attendanceLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  attendancePercentage: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
  },
  sufficientAttendance: {
    color: Colors.success,
  },
  insufficientAttendance: {
    color: Colors.warning,
  },
  attendanceBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: Metrics.roundedFull,
    overflow: 'hidden',
    marginBottom: 4,
    position: 'relative',
  },
  attendanceFill: {
    height: '100%',
    borderRadius: Metrics.roundedFull,
  },
  attendanceThreshold: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    backgroundColor: Colors.textDark,
  },
  attendanceNote: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textMedium,
    textAlign: 'right',
  },
  upcomingInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10', // 10% opacity
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.mediumSpacing,
  },
  upcomingInfoText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: Metrics.baseSpacing,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendanceButton: {
    flex: 1,
    marginRight: Metrics.baseSpacing / 2,
  },
  cancelButton: {
    flex: 1,
    marginLeft: Metrics.baseSpacing / 2,
  },
  certificateButton: {
    flex: 1,
  },
  detailsButton: {
    flex: 1,
    marginRight: Metrics.baseSpacing / 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Metrics.xLargeSpacing,
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
    marginBottom: Metrics.mediumSpacing,
  },
  exploreButton: {
    marginTop: Metrics.baseSpacing,
  },
});

export default MyCoursesScreen;