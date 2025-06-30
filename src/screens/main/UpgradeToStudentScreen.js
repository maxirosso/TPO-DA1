import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import dataService from '../../services/dataService';
import { AuthContext } from '../../context/AuthContext';

const UpgradeToStudentScreen = ({ navigation, route }) => {
  const { user, setUser, exitVisitorMode } = useContext(AuthContext);
  const { userId, userEmail } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    numeroTramiteDNI: '',
    metodoPago: '',
    numeroTarjeta: '',
    nombreTarjeta: '',
    fechaVencimiento: '',
    codigoSeguridad: '',
    fotoDNIFrente: null,
    fotoDNIDorso: null,
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagePicker = (type) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    Alert.alert(
      'Seleccionar Foto',
      'Elige cómo quieres agregar la imagen',
      [
        { text: 'Cámara', onPress: () => launchCamera(options, response => handleImageResponse(response, type)) },
        { text: 'Galería', onPress: () => launchImageLibrary(options, response => handleImageResponse(response, type)) },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleImageResponse = (response, type) => {
    if (response.didCancel || response.error) return;
    
    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      setFormData(prev => ({
        ...prev,
        [type]: {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `${type}.jpg`,
          size: asset.fileSize
        }
      }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.numeroTramiteDNI.trim()) {
      errors.push('Número de trámite del DNI es requerido');
    }
    
    if (!formData.numeroTarjeta.trim()) {
      errors.push('Número de tarjeta es requerido');
    } else if (formData.numeroTarjeta.replace(/\s/g, '').length < 13) {
      errors.push('Número de tarjeta inválido');
    }
    
    if (!formData.nombreTarjeta.trim()) {
      errors.push('Nombre del titular es requerido');
    }
    
    if (!formData.fechaVencimiento.trim()) {
      errors.push('Fecha de vencimiento es requerida');
    } else if (!/^\d{2}\/\d{2}$/.test(formData.fechaVencimiento)) {
      errors.push('Formato de fecha inválido (MM/AA)');
    }
    
    if (!formData.codigoSeguridad.trim()) {
      errors.push('Código de seguridad es requerido');
    } else if (formData.codigoSeguridad.length < 3) {
      errors.push('Código de seguridad inválido');
    }
    
    if (!formData.fotoDNIFrente) {
      errors.push('Foto del frente del DNI es requerida');
    }
    
    if (!formData.fotoDNIDorso) {
      errors.push('Foto del dorso del DNI es requerida');
    }

    if (!formData.password.trim()) {
      errors.push('La contraseña es requerida para alumnos');
    } else if (formData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Errores de Validación', errors.join('\n'));
      return;
    }

    if (!userId || userId === 'undefined' || userId === null) {
      Alert.alert('Error', 'No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    setLoading(true);
    try {
      let identifierToUse = userId;
      if (isNaN(parseInt(userId))) {
        identifierToUse = userEmail || userId;
        console.log('Using email as identifier:', identifierToUse);
      }
      
      console.log('Sending upgrade request with identifier:', identifierToUse);
      const result = await dataService.upgradeToStudent(identifierToUse, formData);
      
      if (user) {
        const updatedUser = {
          ...user,
          tipo: 'alumno'
        };
        setUser(updatedUser);
      }
      
      exitVisitorMode();
      
      Alert.alert(
        '¡Felicidades!',
        'Has sido upgradado a alumno exitosamente. Ahora puedes acceder a cursos premium.',
        [
          {
            text: 'Continuar',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomeTab' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error upgrading to student:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo procesar tu solicitud. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderImageUpload = (title, field, image) => (
    <View style={styles.imageUploadContainer}>
      <Text style={styles.imageUploadTitle}>{title}</Text>
      <TouchableOpacity
        style={[styles.imageUploadBox, image && styles.imageUploadBoxFilled]}
        onPress={() => handleImagePicker(field)}
      >
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
        ) : (
          <>
            <Icon name="camera" size={40} color={Colors.textMedium} />
            <Text style={styles.imageUploadText}>Tocar para agregar foto</Text>
          </>
        )}
      </TouchableOpacity>
      {image && (
        <TouchableOpacity
          style={styles.changeImageButton}
          onPress={() => handleImagePicker(field)}
        >
          <Text style={styles.changeImageText}>Cambiar imagen</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={Colors.card} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade a Alumno</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Icon name="graduation-cap" size={50} color={Colors.primary} />
          <Text style={styles.infoTitle}>¡Conviértete en Alumno!</Text>
          <Text style={styles.infoDescription}>
            Como alumno podrás inscribirte a cursos premium y acceder a contenido exclusivo. 
            Solo se cobra cuando te inscribas a un curso.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información del DNI</Text>
          <Input
            label="Número de Trámite del DNI"
            value={formData.numeroTramiteDNI}
            onChangeText={(value) => handleInputChange('numeroTramiteDNI', value)}
            placeholder="Ej: 12345678"
            keyboardType="numeric"
            maxLength={8}
          />

          {renderImageUpload('Foto DNI - Frente', 'fotoDNIFrente', formData.fotoDNIFrente)}
          {renderImageUpload('Foto DNI - Dorso', 'fotoDNIDorso', formData.fotoDNIDorso)}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <Text style={styles.sectionSubtitle}>
            Solo se utilizará para facturar cursos cuando te inscribas
          </Text>
          
          <Input
            label="Número de Tarjeta"
            value={formData.numeroTarjeta}
            onChangeText={(value) => handleInputChange('numeroTarjeta', formatCardNumber(value))}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={19}
          />

          <Input
            label="Nombre del Titular"
            value={formData.nombreTarjeta}
            onChangeText={(value) => handleInputChange('nombreTarjeta', value.toUpperCase())}
            placeholder="JUAN PEREZ"
            autoCapitalize="characters"
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Vencimiento"
                value={formData.fechaVencimiento}
                onChangeText={(value) => handleInputChange('fechaVencimiento', formatExpiryDate(value))}
                placeholder="MM/AA"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="CVV"
                value={formData.codigoSeguridad}
                onChangeText={(value) => handleInputChange('codigoSeguridad', value)}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contraseña de Alumno</Text>
          <Text style={styles.sectionSubtitle}>
            Como alumno necesitarás una contraseña para acceder a cursos premium
          </Text>
          
          <Input
            label="Contraseña"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
          />

          <Input
            label="Confirmar Contraseña"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            placeholder="Repite tu contraseña"
            secureTextEntry
          />
        </View>

        <View style={styles.warningCard}>
          <Icon name="shield" size={24} color={Colors.warning} />
          <Text style={styles.warningText}>
            Tus datos están protegidos con encriptación de nivel bancario. 
            Solo se realizarán cargos cuando te inscribas a un curso.
          </Text>
        </View>

        <Button
          title="Enviar Solicitud"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          fullWidth
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.card,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 10,
    marginBottom: 5,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 15,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  imageUploadContainer: {
    marginBottom: 15,
  },
  imageUploadTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  imageUploadBox: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
    minHeight: 120,
  },
  imageUploadBoxFilled: {
    borderStyle: 'solid',
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  imageUploadText: {
    fontSize: 14,
    color: Colors.textMedium,
    marginTop: 8,
    textAlign: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changeImageButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  changeImageText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  warningCard: {
    backgroundColor: Colors.warningLight,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 13,
    color: Colors.warningDark,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    marginBottom: 10,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default UpgradeToStudentScreen; 