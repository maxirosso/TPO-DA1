import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Camera } from 'react-native-camera';

import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

const QRScannerScreen = ({ navigation, route }) => {
  const { courseId } = route.params || {};
  const [scanning, setScanning] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [processingAttendance, setProcessingAttendance] = useState(false);

  // Aquí deberías integrar el escaneo real con la cámara y el backend
  // useEffect(() => {
  //   if (scanning && !scanned) {
  //     // Integrar con la cámara y backend aquí
  //   }
  // }, [scanning, scanned, courseId]);

  const handleValidQRCode = (result) => {
    setProcessingAttendance(true);
    
    // Simulate API call to register attendance
    setTimeout(() => {
      setProcessingAttendance(false);
      
      Alert.alert(
        'Asistencia Registrada',
        'Tu asistencia ha sido registrada exitosamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 2000);
  };

  const handleCancelScan = () => {
    navigation.goBack();
  };

  const handleRescan = () => {
    setScanned(false);
    setScanning(true);
    setScanResult(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleCancelScan}
        >
          <Icon name="x" size={24} color={Colors.card} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escanear Código QR</Text>
      </View>

      <View style={styles.cameraContainer}>
        {/* Note: In a real app, you would use the actual Camera component */}
        <View style={styles.mockCamera}>
          <View style={styles.scanArea}>
            {scanning && !scanned && (
              <View style={styles.scanAnimation} />
            )}
            {scanned && processingAttendance && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.processingText}>Procesando asistencia...</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          {scanning
            ? 'Escaneando...'
            : scanned && processingAttendance
            ? 'Procesando...'
            : 'Escaneo Completado'}
        </Text>
        <Text style={styles.instructionsText}>
          {scanning
            ? 'Apunta la cámara al código QR ubicado en la entrada del aula para registrar tu asistencia.'
            : scanned && processingAttendance
            ? 'Estamos registrando tu asistencia. Por favor espera un momento.'
            : 'Tu asistencia ha sido registrada exitosamente.'}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        {!scanning && !processingAttendance && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={handleRescan}
          >
            <Icon name="refresh-cw" size={20} color={Colors.primary} />
            <Text style={styles.rescanButtonText}>Escanear Nuevamente</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.mediumSpacing,
    backgroundColor: Colors.primary,
  },
  closeButton: {
    position: 'absolute',
    left: Metrics.mediumSpacing,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.card,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockCamera: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 2,
    borderColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanAnimation: {
    width: '80%',
    height: 2,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: '50%',
    left: '10%',
  },
  processingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  processingText: {
    color: Colors.card,
    marginTop: Metrics.baseSpacing,
    fontSize: Metrics.baseFontSize,
  },
  instructionsContainer: {
    padding: Metrics.mediumSpacing,
    backgroundColor: Colors.card,
  },
  instructionsTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.mediumLineHeight,
  },
  actionsContainer: {
    padding: Metrics.mediumSpacing,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.baseSpacing,
  },
  rescanButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: Metrics.smallSpacing,
  },
});

export default QRScannerScreen;