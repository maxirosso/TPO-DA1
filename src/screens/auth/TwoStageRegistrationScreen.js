import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import dataService from '../../services/dataService';

const TwoStageRegistrationScreen = ({ navigation, route }) => {
  const { userType = 'comun' } = route.params || {}; // 'comun' or 'alumno'

  // Stage 1 data
  const [stage, setStage] = useState(1); // 1 = initial registration, 2 = complete profile
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Stage 2 data - Complete Profile
  const [profileData, setProfileData] = useState({
    nombre: '',
    password: '',
    confirmPassword: '',
    direccion: '',
    telefono: '',
  });

  // Student specific data (only for student registration)
  const [studentData, setStudentData] = useState({
    medioPago: '',
    dniFrente: '',
    dniFondo: '',
    tramite: '',
  });

  const [loading, setLoading] = useState(false);

  // Stage 1: Initial Registration (Email + Username)
  const handleStageOneSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!username.trim() || username.length < 3) {
      Alert.alert('Error', 'El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Check if email exists and registration was completed
      const existingUser = await dataService.getUserByEmail(email);
      
      if (existingUser && existingUser.habilitado === 'Si') {
        // User exists and registration is complete
        Alert.alert(
          'Usuario Existente',
          'Ya existe una cuenta con este email y el proceso de registración fue completado. ¿Deseas recuperar tu contraseña?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Recuperar Contraseña', 
              onPress: () => handlePasswordRecovery()
            }
          ]
        );
        return;
      }

      if (existingUser && existingUser.habilitado !== 'Si') {
        // User exists but registration was never completed
        Alert.alert(
          'Registro Incompleto',
          'Ya existe una cuenta con este email pero el proceso de registración no se completó. Para liberar este email debes enviar un mail a la empresa para realizar un proceso por fuera de la aplicación móvil.',
          [{ text: 'Entendido', style: 'default' }]
        );
        return;
      }

      // Check username availability
      const usernameAvailable = await checkUsernameAvailability(username);
      if (!usernameAvailable) {
        return; // checkUsernameAvailability handles showing suggestions
      }

      // Generate temporary user ID for registration
      const tempUserId = Math.floor(Math.random() * 1000000);

      // Send verification email
      if (userType === 'alumno') {
        await dataService.registerStudent(email, tempUserId, 'pending', 'pending', 'pending', 'pending');
      } else {
        await dataService.registerVisitor(email, tempUserId);
      }

      setEmailSent(true);
      Alert.alert(
        'Verificación Enviada',
        'Se ha enviado un código de verificación a tu email. El código tiene una validez de 24 horas.',
        [{ text: 'Entendido', onPress: () => {} }]
      );

    } catch (error) {
      console.log('Registration error:', error);
      
      if (error.message.includes('ya registrado')) {
        // Username/email already exists, show suggestions
        const suggestions = await generateUsernameSuggestions(username);
        setUsernameSuggestions(suggestions);
        Alert.alert(
          'Nombre de Usuario No Disponible',
          'Este nombre de usuario ya está en uso. Por favor elige uno de los sugeridos o intenta con otro.',
        );
      } else {
        Alert.alert('Error', 'No se pudo enviar el código de verificación. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check username availability and generate suggestions if needed
  const checkUsernameAvailability = async (username) => {
    try {
      const response = await fetch(dataService.api.baseURL + '/auth/check-username?username=' + encodeURIComponent(username));
      const result = await response.json();
      
      if (!result.available) {
        setUsernameSuggestions(result.suggestions || []);
        Alert.alert(
          'Nombre de Usuario No Disponible',
          'Este nombre de usuario ya está en uso. Te sugerimos algunas alternativas.',
        );
        return false;
      }
      return true;
    } catch (error) {
      console.log('Error checking username:', error);
      return true; // Allow to proceed if check fails
    }
  };

  // Generate username suggestions
  const generateUsernameSuggestions = async (baseUsername) => {
    const suggestions = [];
    const base = baseUsername.replace(/\d+$/, ''); // Remove trailing numbers
    
    // Add random numbers
    for (let i = 0; i < 3; i++) {
      suggestions.push(base + Math.floor(Math.random() * 1000));
    }
    
    // Add current year
    suggestions.push(base + new Date().getFullYear());
    
    return suggestions;
  };

  // Handle password recovery
  const handlePasswordRecovery = async () => {
    try {
      await dataService.resetPassword(email);
      Alert.alert(
        'Código Enviado',
        'Se ha enviado un código de recuperación de contraseña a tu email. El código tiene una validez de 30 minutos.'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el código de recuperación');
    }
  };

  // Stage 2: Complete Profile (after email verification)
  const handleVerifyAndComplete = async () => {
    if (!verificationCode.trim() || verificationCode.length < 6) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación de 6 dígitos');
      return;
    }

    // Validate profile data
    if (!profileData.nombre.trim()) {
      Alert.alert('Error', 'El nombre completo es obligatorio');
      return;
    }

    if (!profileData.password.trim() || profileData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (profileData.password !== profileData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Validate student data if registering as student
    if (userType === 'alumno') {
      if (!studentData.medioPago.trim()) {
        Alert.alert('Error', 'El medio de pago es obligatorio para alumnos');
        return;
      }
      if (!studentData.dniFrente.trim()) {
        Alert.alert('Error', 'La foto del DNI frente es obligatoria');
        return;
      }
      if (!studentData.dniFondo.trim()) {
        Alert.alert('Error', 'La foto del DNI dorso es obligatoria');
        return;
      }
      if (!studentData.tramite.trim()) {
        Alert.alert('Error', 'El número de trámite es obligatorio');
        return;
      }
    }

    setLoading(true);
    try {
      // Verify email with code (simulate verification)
      const emailVerified = await verifyEmailCode(verificationCode);
      if (!emailVerified) {
        Alert.alert('Error', 'Código de verificación inválido o expirado');
        return;
      }

      // Create complete user profile
      const userData = {
        mail: email,
        nickname: username,
        nombre: profileData.nombre,
        password: profileData.password,
        direccion: profileData.direccion,
        telefono: profileData.telefono,
        tipo: userType,
        habilitado: 'Si'
      };

      // Register user
      await dataService.register(userData);

      // If student, upgrade to student with additional data
      if (userType === 'alumno') {
        const studentRequest = {
          dniFrente: studentData.dniFrente,
          dniFondo: studentData.dniFondo,
          tramite: studentData.tramite,
          medioPago: studentData.medioPago
        };

        // Get user ID to upgrade
        const user = await dataService.getUserByEmail(email);
        if (user) {
          await dataService.upgradeToStudent(user.id, studentRequest);
        }
      }

      Alert.alert(
        'Registro Exitoso',
        `Tu cuenta ha sido creada exitosamente como ${userType === 'alumno' ? 'Alumno' : 'Usuario'}. Ya puedes iniciar sesión.`,
        [{ text: 'Continuar', onPress: () => navigation.navigate('Login') }]
      );

    } catch (error) {
      console.log('Profile completion error:', error);
      Alert.alert('Error', 'No se pudo completar el registro. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate email verification (in real app, this would call backend)
  const verifyEmailCode = async (code) => {
    try {
      const response = await fetch(dataService.api.baseURL + '/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.log('Email verification error:', error);
      return false;
    }
  };

  const renderStageOne = () => (
    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
      <View style={styles.stageHeader}>
        <Text style={styles.stageTitle}>
          {userType === 'alumno' ? 'Registro de Alumno - Paso 1' : 'Registro de Usuario - Paso 1'}
        </Text>
        <Text style={styles.stageDescription}>
          Ingresa tu email y elige un nombre de usuario. Te enviaremos un código de verificación.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          placeholderTextColor={Colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!emailSent}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre de Usuario *</Text>
        <TextInput
          style={styles.textInput}
          value={username}
          onChangeText={setUsername}
          placeholder="Elige un nombre de usuario"
          placeholderTextColor={Colors.textLight}
          autoCapitalize="none"
          editable={!emailSent}
        />
        {usernameSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>Sugerencias disponibles:</Text>
            {usernameSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setUsername(suggestion);
                  setUsernameSuggestions([]);
                }}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {userType === 'alumno' && (
        <View style={styles.infoBox}>
          <Icon name="info" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>
            Como alumno podrás inscribirte a cursos. El registro es gratuito, solo se facturan los cursos a los que te inscribas.
          </Text>
        </View>
      )}

      {emailSent && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Código de Verificación *</Text>
          <TextInput
            style={styles.textInput}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Ingresa el código de 6 dígitos"
            placeholderTextColor={Colors.textLight}
            keyboardType="numeric"
            maxLength={6}
          />
          <Text style={styles.helpText}>
            Revisa tu email y ingresa el código de verificación. El código expira en 24 horas.
          </Text>
        </View>
      )}

      {!emailSent ? (
        <Button
          title={loading ? "Enviando..." : "Enviar Código de Verificación"}
          onPress={handleStageOneSubmit}
          style={styles.submitButton}
          disabled={loading}
          iconName="mail"
        />
      ) : (
        <Button
          title="Continuar al Paso 2"
          onPress={() => setStage(2)}
          style={styles.submitButton}
          iconName="arrow-right"
        />
      )}
    </ScrollView>
  );

  const renderStageTwo = () => (
    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
      <View style={styles.stageHeader}>
        <Text style={styles.stageTitle}>
          {userType === 'alumno' ? 'Registro de Alumno - Paso 2' : 'Registro de Usuario - Paso 2'}
        </Text>
        <Text style={styles.stageDescription}>
          Completa tu perfil para finalizar el registro.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Código de Verificación *</Text>
        <TextInput
          style={styles.textInput}
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="Código de 6 dígitos de tu email"
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      {/* Personal Information */}
      <Text style={styles.sectionTitle}>Información Personal</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre Completo *</Text>
        <TextInput
          style={styles.textInput}
          value={profileData.nombre}
          onChangeText={(text) => setProfileData({ ...profileData, nombre: text })}
          placeholder="Tu nombre completo"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Contraseña *</Text>
        <TextInput
          style={styles.textInput}
          value={profileData.password}
          onChangeText={(text) => setProfileData({ ...profileData, password: text })}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor={Colors.textLight}
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirmar Contraseña *</Text>
        <TextInput
          style={styles.textInput}
          value={profileData.confirmPassword}
          onChangeText={(text) => setProfileData({ ...profileData, confirmPassword: text })}
          placeholder="Repite tu contraseña"
          placeholderTextColor={Colors.textLight}
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dirección</Text>
        <TextInput
          style={styles.textInput}
          value={profileData.direccion}
          onChangeText={(text) => setProfileData({ ...profileData, direccion: text })}
          placeholder="Ciudad, País"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Teléfono</Text>
        <TextInput
          style={styles.textInput}
          value={profileData.telefono}
          onChangeText={(text) => setProfileData({ ...profileData, telefono: text })}
          placeholder="+54 11 1234-5678"
          placeholderTextColor={Colors.textLight}
          keyboardType="phone-pad"
        />
      </View>

      {/* Student Additional Information */}
      {userType === 'alumno' && (
        <>
          <Text style={styles.sectionTitle}>Información de Alumno</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Medio de Pago *</Text>
            <TextInput
              style={styles.textInput}
              value={studentData.medioPago}
              onChangeText={(text) => setStudentData({ ...studentData, medioPago: text })}
              placeholder="Tarjeta de crédito, débito, transferencia"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Foto DNI Frente *</Text>
            <TextInput
              style={styles.textInput}
              value={studentData.dniFrente}
              onChangeText={(text) => setStudentData({ ...studentData, dniFrente: text })}
              placeholder="URL o referencia de la foto del DNI frente"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Foto DNI Dorso *</Text>
            <TextInput
              style={styles.textInput}
              value={studentData.dniFondo}
              onChangeText={(text) => setStudentData({ ...studentData, dniFondo: text })}
              placeholder="URL o referencia de la foto del DNI dorso"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de Trámite DNI *</Text>
            <TextInput
              style={styles.textInput}
              value={studentData.tramite}
              onChangeText={(text) => setStudentData({ ...studentData, tramite: text })}
              placeholder="Número de trámite del DNI"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
            />
          </View>
        </>
      )}

      <Button
        title={loading ? "Finalizando Registro..." : "Completar Registro"}
        onPress={handleVerifyAndComplete}
        style={styles.submitButton}
        disabled={loading}
        iconName="check-circle"
      />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
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
          <Text style={styles.headerTitle}>Registro</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{stage}/2</Text>
          </View>
        </View>
      </LinearGradient>

      {stage === 1 ? renderStageOne() : renderStageTwo()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  progressContainer: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.roundedFull,
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
  },
  progressText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  form: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  stageHeader: {
    marginBottom: Metrics.xLargeSpacing,
  },
  stageTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  stageDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
  },
  sectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
    marginTop: Metrics.mediumSpacing,
  },
  inputGroup: {
    marginBottom: Metrics.mediumSpacing,
  },
  inputLabel: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    backgroundColor: Colors.card,
  },
  helpText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginTop: Metrics.baseSpacing,
    lineHeight: Metrics.baseLineHeight,
  },
  suggestionsContainer: {
    marginTop: Metrics.baseSpacing,
    padding: Metrics.mediumSpacing,
    backgroundColor: Colors.primary + '10',
    borderRadius: Metrics.baseBorderRadius,
  },
  suggestionsLabel: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: Metrics.baseSpacing,
  },
  suggestionItem: {
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.baseSpacing,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  suggestionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '10',
    padding: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.mediumSpacing,
  },
  infoText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    marginLeft: Metrics.baseSpacing,
    flex: 1,
    lineHeight: Metrics.baseLineHeight,
  },
  submitButton: {
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.xxLargeSpacing,
  },
});

export default TwoStageRegistrationScreen; 