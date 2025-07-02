import React, { useState, useEffect, useCallback, useContext } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { AuthContext } from '../../context/AuthContext';
import dataService from '../../services/dataService';

const MyCoursesScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('active');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingCourses, setUpcomingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);

  useFocusEffect(
    useCallback(() => {

      loadCourses(false); 
    }, [])
  );

  const loadUserAccountBalance = async (userId) => {
    try {
      console.log('Cargando cuenta corriente para usuario:', userId);
      const alumnoData = await dataService.getAlumnoById(userId);
      
      if (alumnoData && (alumnoData.accountBalance !== undefined || alumnoData.cuentaCorriente !== undefined)) {
        const balance = alumnoData.accountBalance !== undefined ? alumnoData.accountBalance : alumnoData.cuentaCorriente;
        console.log('Cuenta corriente cargada desde backend:', balance);
        setAccountBalance(Number(balance) || 0);
      } else {
        console.log('No se encontró información de cuenta corriente');
        setAccountBalance(0);
      }
    } catch (error) {
      console.error('Error cargando cuenta corriente:', error);
      setAccountBalance(0);
    }
  };

  const loadCourses = async (showLoading = true) => {
    console.log('Iniciando carga de mis cursos...');
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      let userId = null;
      let userType = null;
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        userId = parsed.id || parsed.idUsuario;
        userType = parsed.tipo;
      }
      
      console.log('Usuario ID para cargar mis cursos:', userId);
      console.log('Tipo de usuario:', userType);
      
      if (!userId) throw new Error('Usuario no autenticado');
      
      if (userType && userType !== 'alumno') {
        console.log('Usuario no es alumno, tipo:', userType);
        setError('Para ver cursos debes estar registrado como alumno. Ve a "Actualizar a Alumno" en tu perfil.');
        setEnrolledCourses([]);
        setUpcomingCourses([]);
        return;
      }
      
      console.log('Cargando cursos del usuario...');
      const userCourses = await dataService.getUserCourses(userId);
      console.log('Cursos del usuario recibidos:', userCourses.length);
      
      if (userCourses.length === 0) {
        console.log(' DEBUG: No hay cursos ');
        console.log('Ejecutando debug de conexión...');
        const debugResult = await dataService.debugConnection();
        console.log('Resultado debug:', debugResult);
      }
      
      if (userCourses.length === 0) {
        console.log(' No hay cursos para este alumno');
        setError('No tienes cursos inscriptos. Explora los cursos disponibles para inscribirte.');
        setEnrolledCourses([]);
        setUpcomingCourses([]);
        return;
      }
      
      const activeCourses = userCourses.filter(c => c.status === 'active' || c.status === 'upcoming' || c.status === 'completed');
      const upcomingCourses = userCourses.filter(c => c.status === 'upcoming');
      
      console.log('Cursos activos filtrados:', activeCourses.length);
      console.log('Cursos próximos filtrados:', upcomingCourses.length);
      
      setEnrolledCourses(activeCourses);
      setUpcomingCourses(upcomingCourses);
      
      if (activeCourses.length > 0) {
        setError(null);
      }
      
      console.log('Carga de mis cursos completada exitosamente');
    } catch (err) {
      console.error('Error al cargar mis cursos:', err);
      
      if (err.message.includes('no autenticado')) {
        setError('Debes iniciar sesión para ver tus cursos.');
      } else if (err.message.includes('Network Error') || err.message.includes('connect')) {
        setError('Error de conexión. Verifica tu conexión a internet y que el servidor esté funcionando.');
      } else {
        setError('No se pudieron cargar tus cursos. Inténtalo nuevamente.');
      }
      
      setEnrolledCourses([]);
      setUpcomingCourses([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const getFilteredCourses = () => {
    console.log('FILTRANDO CURSOS');
    console.log('Tab activo:', activeTab);
    console.log('Cursos inscritos:', enrolledCourses);
    console.log('Cursos próximos:', upcomingCourses);
    
    let filtered = [];
    switch (activeTab) {
      case 'active':
        filtered = enrolledCourses.filter(course => course.status === 'active');
        break;
      case 'completed':
        filtered = enrolledCourses.filter(course => course.status === 'completed');
        break;
      case 'upcoming':
        filtered = enrolledCourses.filter(course => course.status === 'upcoming');
        break;
      default:
        filtered = [];
    }
    
    console.log('Cursos filtrados para mostrar:', filtered);
    return filtered;
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
    if (!course.id) {
      Alert.alert('Error', 'No se puede registrar asistencia porque el curso no tiene un identificador válido.');
      return;
    }
    navigation.navigate('QRScannerScreen', { courseId: course.id });
  };

  const handleCancelCourse = (course) => {
    console.log('CANCELAR CURSO');
    console.log('Course data:', course);
    console.log('idInscripcion:', course.idInscripcion);
    
    if (!course.idInscripcion) {
      console.error('No se encontró idInscripcion en el curso');
      Alert.alert('Error', 'No se puede cancelar la inscripción porque no se encontró el ID de inscripción.');
      return;
    }

    const today = new Date();
    const startDate = new Date(course.startDate);
    const daysDifference = Math.floor((startDate - today) / (1000 * 60 * 60 * 24));
    
    let refundPercentage = 0;
    let refundMessage = '';
    let warningMessage = '';
    
    if (daysDifference >= 10) {
      refundPercentage = 100;
      refundMessage = 'Reembolso completo (100%)';
    } else if (daysDifference >= 1 && daysDifference < 10) {
      refundPercentage = 70;
      refundMessage = 'Reembolso del 70%';
    } else if (daysDifference === 0) {
      refundPercentage = 50;
      refundMessage = 'Reembolso del 50% (mismo día de inicio)';
    } else {
      refundPercentage = 0;
      refundMessage = 'Sin reembolso';
      warningMessage = '\nATENCIÓN: El curso ya ha iniciado. No recibirás reembolso, pero podrás darte de baja si es necesario.';
    }
    
    console.log('Días hasta inicio:', daysDifference);
    console.log('Porcentaje de reembolso:', refundPercentage);
    console.log('Mensaje de reembolso:', refundMessage);
    
    const alertMessage = `¿Estás seguro de que deseas cancelar tu inscripción al curso "${course.title}"?\n\n${refundMessage}${warningMessage}`;
    
    Alert.alert(
      'Cancelar Inscripción',
      alertMessage,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            console.log('Iniciando cancelación...');
            try {
              setLoading(true);
              const result = await dataService.cancelEnrollment(course.idInscripcion, true);
              console.log('Resultado de cancelación:', result);
              
              let confirmationMessage = '';
              if (daysDifference < 0) {
                confirmationMessage = `Has cancelado tu inscripción al curso "${course.title}".\n\nAunque el curso ya había iniciado, tu cancelación ha sido procesada sin reembolso. Esperamos que encuentres otro curso que se ajuste mejor a tus necesidades.`;
              } else if (refundPercentage === 0) {
                confirmationMessage = `Has cancelado tu inscripción al curso "${course.title}".\n\nNo se procesará reembolso debido a la proximidad de la fecha de inicio.`;
              } else {
                confirmationMessage = `Has cancelado tu inscripción al curso "${course.title}".\n\nSe ha iniciado el proceso de reembolso del ${refundPercentage}% del valor del curso. El reintegro ha sido acreditado automáticamente en tu cuenta corriente.`;
              }
              
              const userId = user?.id || user?.idUsuario;
              if (userId && refundPercentage > 0) {
                await loadUserAccountBalance(parseInt(userId, 10));
              }

              Alert.alert(
                'Inscripción Cancelada',
                confirmationMessage,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      loadCourses(false); 
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error al cancelar inscripción:', error);
              Alert.alert('Error', `No se pudo cancelar la inscripción: ${error.message || 'Error desconocido'}`);
            } finally {
              setLoading(false);
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
              title="Ver Detalles"
              onPress={() => navigation.navigate('CourseDetail', { 
                course: item,
                courseId: item.id || item.idCurso || item.idCronograma,
                isEnrolled: true,
                userType: 'student'
              })}
              type="primary"
              size="small"
              iconName="info"
              style={styles.detailsButton}
            />
            
            <Button
              title="Ver Certificado"
              onPress={() => Alert.alert('Certificado', 'Función para ver e imprimir el certificado del curso.')}
              type="secondary"
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
              onPress={() => navigation.navigate('CourseDetail', { 
                course: item,
                courseId: item.id || item.idCurso || item.idCronograma,
                isEnrolled: true,
                userType: 'student'
              })}
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
        keyExtractor={(item, index) => {
          const id = item.id || item.idCurso || item.idCronograma || item.idInscripcion;
          return `course_${id}_${item.title}_${index}`;
        }}
        contentContainerStyle={styles.coursesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="book-open" size={60} color={Colors.textLight} />
            
            {error ? (
              <>
                <Text style={styles.emptyTitle}>
                  {error.includes('alumno') ? '¡Actualiza tu cuenta!' : 'Sin cursos'}
                </Text>
                <Text style={styles.emptyText}>
                  {error}
                </Text>
                
                {error.includes('alumno') ? (
                  <Button
                    title="Actualizar a Alumno"
                    onPress={() => navigation.navigate('UpgradeToStudentScreen')}
                    style={styles.exploreButton}
                  />
                ) : error.includes('inscriptos') ? (
                  <Button
                    title="Ver Cursos Disponibles"
                    onPress={() => navigation.navigate('CoursesTab')}
                    style={styles.exploreButton}
                  />
                ) : error.includes('conexión') ? (
                  <Button
                    title="Reintentar"
                    onPress={() => loadCourses()}
                    style={styles.exploreButton}
                  />
                ) : (
                  <Button
                    title="Reintentar"
                    onPress={() => loadCourses()}
                    style={styles.exploreButton}
                  />
                )}
              </>
            ) : (
              <>
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
              </>
            )}
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
    backgroundColor: Colors.success + '20',
  },
  failedBadge: {
    backgroundColor: Colors.error + '20', 
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
    backgroundColor: Colors.primary + '10', 
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
    backgroundColor: Colors.primary + '10', 
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
    gap: Metrics.baseSpacing / 2,
  },
  attendanceButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  certificateButton: {
    flex: 1,
  },
  detailsButton: {
    flex: 1,
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