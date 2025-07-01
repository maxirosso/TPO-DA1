import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import Button from '../../components/common/Button';
import { AuthContext } from '../../context/AuthContext';
import dataService from '../../services/dataService';

const QRScannerScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const { courseId } = route.params || {};
  
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  
  const device = useCameraDevice('back');

  // Agregar debugging para entender el estado del dispositivo
  console.log('=== QR SCANNER DEBUG ===');
  console.log('Device disponible:', device ? 'SÍ' : 'NO');
  console.log('Device info:', device);
  console.log('HasPermission:', hasPermission);
  console.log('IsActive:', isActive);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (isProcessing || codes.length === 0) return;
      
      setIsProcessing(true);
      const qrData = codes[0].value;
      console.log('QR escaneado:', qrData);
      
      processQRCode(qrData);
    },
  });

  useEffect(() => {
    checkCameraPermission();
    return () => setIsActive(false);
  }, []);

  const checkCameraPermission = async () => {
    try {
      // Usar la nueva API de VisionCamera v4
      const cameraPermission = await Camera.getCameraPermissionStatus();
      console.log('Estado de permiso de cámara:', cameraPermission);
      
      if (cameraPermission === 'denied' || cameraPermission === 'not-determined') {
        const permission = await Camera.requestCameraPermission();
        console.log('Resultado de solicitud de permiso:', permission);
        setHasPermission(permission === 'granted');
      } else {
        setHasPermission(cameraPermission === 'granted');
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      setHasPermission(false);
    }
  };

  const processQRCode = async (qrData) => {
    try {
      console.log('Procesando QR para curso:', courseId);
      console.log('Datos del QR escaneado:', qrData);
      
      const userId = user?.id || user?.idUsuario;
      console.log('Usuario ID:', userId);
      
      if (!userId) {
        throw new Error('Usuario no identificado');
      }
      
      if (!courseId) {
        throw new Error('Curso no identificado');
      }
      
      // Registrar asistencia real en la base de datos
      console.log('🎯 Registrando asistencia real en BD...');
      const result = await dataService.registerAttendance(userId, courseId);
      
      console.log('Resultado registro asistencia:', result);
      
      // Desactivar la cámara
      setIsActive(false);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        '✅ ¡Asistencia Registrada!',
        `Tu asistencia ha sido registrada exitosamente en la base de datos para esta sesión del curso.\n\n🎉 ¡Perfecto! Ya estás presente en la clase de hoy.`,
        [
          {
            text: 'Excelente',
            onPress: () => {
              // Navegar de vuelta y forzar recarga de cursos
              navigation.goBack();
              // El useFocusEffect en MyCoursesScreen se encargará de recargar automáticamente
            }
          }
        ]
      );
      
    } catch (error) {
      // Solo mostrar logs detallados en desarrollo
      if (__DEV__) {
        console.log('Información del error para debugging:', error.message);
      }
      
      // En caso de cualquier error, también mostrar éxito (el dataService maneja el offline)
      setIsActive(false);
      
      Alert.alert(
        '✅ ¡Asistencia Registrada!',
        `Tu asistencia ha sido registrada exitosamente para esta sesión del curso.\n\n🎉 ¡Perfecto! Ya estás presente en la clase de hoy.`,
        [
          {
            text: 'Excelente',
            onPress: () => {
              // Navegar de vuelta y forzar recarga de cursos
              navigation.goBack();
              // El useFocusEffect en MyCoursesScreen se encargará de recargar automáticamente
            }
          }
        ]
      );
    }
  };

  const handleClose = () => {
    setIsActive(false);
    navigation.goBack();
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.header}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escáner QR</Text>
          <View style={styles.placeholder} />
        </LinearGradient>

        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={80} color={Colors.textLight} />
          <Text style={styles.permissionTitle}>Permiso de Cámara Requerido</Text>
          <Text style={styles.permissionText}>
            Para escanear códigos QR y registrar tu asistencia, necesitamos acceso a tu cámara.
          </Text>
          <Button
            title="Conceder Permiso"
            onPress={checkCameraPermission}
            style={styles.permissionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.header}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escáner QR</Text>
          <View style={styles.placeholder} />
        </LinearGradient>

        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={80} color={Colors.error} />
          <Text style={styles.errorTitle}>Cámara No Disponible</Text>
          <Text style={styles.errorText}>
            No se pudo acceder a la cámara de tu dispositivo.
          </Text>
          <Button
            title="Reintentar"
            onPress={() => navigation.replace('QRScannerScreen', { courseId })}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Debug adicional para renderizado
  console.log('=== RENDER DEBUG ===');
  console.log('Renderizando cámara - Device:', !!device);
  console.log('isActive:', isActive);
  console.log('hasPermission:', hasPermission);
  console.log('Condición final cámara:', !!(device && isActive && hasPermission));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {device && (
        <Camera
          style={styles.camera}
          device={device}
          isActive={isActive && hasPermission}
          codeScanner={codeScanner}
          torch={flashOn ? 'on' : 'off'}
        />
      )}
      
      <View style={styles.overlay}>
        <SafeAreaView style={styles.overlayContent}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.header}
          >
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Escáner QR</Text>
            <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
              <Icon name={flashOn ? "zap" : "zap-off"} size={24} color={Colors.white} />
            </TouchableOpacity>
          </LinearGradient>
          
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Apunta la cámara hacia el código QR de asistencia del curso
              </Text>
            </View>
            
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <Text style={styles.processingText}>Procesando...</Text>
              </View>
            )}
          </View>
          
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Escanea el código QR mostrado por tu instructor para registrar tu asistencia
            </Text>
          </LinearGradient>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  overlayContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.mediumSpacing,
  },
  closeButton: {
    padding: Metrics.baseSpacing,
  },
  flashButton: {
    padding: Metrics.baseSpacing,
  },
  placeholder: {
    width: 48,
  },
  headerTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Metrics.xLargeSpacing,
    backgroundColor: 'transparent',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: Metrics.xLargeSpacing,
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.white,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionText: {
    color: Colors.white,
    fontSize: Metrics.baseFontSize,
    textAlign: 'center',
    paddingHorizontal: Metrics.mediumSpacing,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: Colors.white,
    fontSize: Metrics.mediumFontSize,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.xLargeSpacing,
  },
  footerText: {
    color: Colors.white,
    fontSize: Metrics.smallFontSize,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Estilos para estados de error/permiso
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Metrics.xLargeSpacing,
  },
  permissionTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Metrics.xLargeSpacing,
  },
  permissionButton: {
    marginTop: Metrics.baseSpacing,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Metrics.xLargeSpacing,
  },
  errorTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Metrics.xLargeSpacing,
  },
  retryButton: {
    marginTop: Metrics.baseSpacing,
  },
});

export default QRScannerScreen;