import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { api } from '../../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
  const [stage, setStage] = useState(1); // 1 = email, 2 = code verification, 3 = new password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos en segundos

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Timer para código de verificación (30 minutos)
  useEffect(() => {
    let timer;
    if (stage === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Etapa 1: Enviar código de recuperación
  const handleSendCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Por favor, ingresa un email válido');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Enviando código de recuperación a:', email);
      const response = await api.auth.resetPassword(email);
      
      console.log('Respuesta del servidor:', response);
      
      // El backend retorna un string directamente si es exitoso
      if (response && (typeof response === 'string' || response.success !== false)) {
        Alert.alert(
          'Código Enviado',
          'Se ha enviado un código de recuperación de 4 dígitos a tu correo electrónico. El código tiene una validez de 30 minutos.',
          [{ 
            text: 'Continuar', 
            onPress: () => {
              setStage(2);
              setTimeLeft(30 * 60); // Resetear timer a 30 minutos
            }
          }]
        );
      } else {
        Alert.alert('Error', response.message || 'No se pudo enviar el código de recuperación. Verifica que tu email esté registrado en el sistema.');
      }
    } catch (error) {
      console.error('Error sending recovery code:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'No se pudo enviar el código de recuperación.';
      
      if (error.response) {
        // Error del servidor
        if (error.response.status === 400) {
          errorMessage = 'Email no encontrado en el sistema o usuario no habilitado.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
        } else {
          errorMessage = error.response.data || 'Error desconocido del servidor.';
        }
      } else if (error.request) {
        // Error de red
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar entrada de código de verificación
  const handleCodeInput = (value, index) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus siguiente input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit cuando el código esté completo
    if (value && index === 3 && newCode.every(digit => digit !== '')) {
      handleVerifyCode(newCode.join(''));
    }
  };

  // Etapa 2: Verificar código
  const handleVerifyCode = async (codeToVerify = null) => {
    const code = codeToVerify || verificationCode.join('');
    
    if (code.length !== 4) {
      Alert.alert('Error', 'Por favor ingresa el código de 4 dígitos completo');
      return;
    }

    if (timeLeft <= 0) {
      Alert.alert('Código Expirado', 'El código ha expirado. Por favor solicita uno nuevo.');
      setStage(1);
      setVerificationCode(['', '', '', '']);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🟡 Verificando código de recuperación:', { email, code });
      const response = await api.auth.verifyRecoveryCode(email, code);
      
      console.log('🟢 Respuesta de verificación:', response);
      
      // El backend retorna un Map<String, Object> con success y message
      if (response && response.success === true) {
        Alert.alert(
          'Código Válido',
          'Código verificado correctamente. Ahora puedes establecer tu nueva contraseña.',
          [{ text: 'Continuar', onPress: () => setStage(3) }]
        );
      } else {
        const errorMessage = response?.message || 'Código inválido o expirado. Verifica que hayas ingresado el código correcto y que no hayan pasado 30 minutos.';
        Alert.alert('Error', errorMessage);
        
        // Limpiar código para permitir reintento
        setVerificationCode(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (error) {
      console.error('🔴 Error verifying code:', error);
      
      let errorMessage = 'No se pudo verificar el código.';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Código inválido o expirado. Los códigos tienen una validez de 30 minutos.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = 'Error del servidor al verificar el código.';
        }
      } else if (error.request) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
      
      // Limpiar código en caso de error
      setVerificationCode(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Etapa 3: Cambiar contraseña
  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa una nueva contraseña');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const code = verificationCode.join('');
      console.log('🟡 Cambiando contraseña para:', email);
      
      const response = await api.auth.changePasswordWithCode(email, code, newPassword);
      
      console.log('🟢 Respuesta de cambio de contraseña:', response);
      
      // El backend retorna un Map<String, Object> con success y message
      if (response && response.success === true) {
        Alert.alert(
          '¡Contraseña Cambiada!',
          'Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
          [{ 
            text: 'Ir al Login', 
            onPress: () => navigation.navigate('Login')
          }]
        );
      } else {
        const errorMessage = response?.message || 'No se pudo cambiar la contraseña. Es posible que el código haya expirado.';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('🔴 Error changing password:', error);
      
      let errorMessage = 'No se pudo cambiar la contraseña.';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Código inválido o expirado. Los códigos tienen una validez de 30 minutos.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = 'Error del servidor al cambiar la contraseña.';
        }
      } else if (error.request) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar cada etapa
  const renderStageOne = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={styles.subtitle}>
        Ingresa tu dirección de correo electrónico y te enviaremos un código de recuperación de 4 dígitos válido por 30 minutos.
      </Text>

      <Input
        label="Dirección de Correo"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        keyboardType="email-address"
        leftIcon="mail"
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={handleSendCode}
      />

      <Button
        title="Enviar Código"
        onPress={handleSendCode}
        fullWidth
        style={styles.actionButton}
        isLoading={isLoading}
      />

      <TouchableOpacity
        style={styles.backToLoginButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.backToLoginText}>
          Volver al inicio de sesión
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStageTwo = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Verificar Código</Text>
      <Text style={styles.subtitle}>
        Ingresa el código de 4 dígitos que enviamos a {email}. El código tiene una validez de 30 minutos.
      </Text>

      <View style={styles.codeContainer}>
        {verificationCode.map((digit, index) => (
          <TextInput
            key={index}
            ref={inputRefs[index]}
            style={styles.codeInput}
            value={digit}
            onChangeText={(value) => handleCodeInput(value, index)}
            keyboardType="numeric"
            maxLength={1}
            autoFocus={index === 0}
            selectTextOnFocus
          />
        ))}
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          Tiempo restante: <Text style={styles.timerTime}>{formatTimeLeft()}</Text>
        </Text>
        {timeLeft <= 300 && ( // Mostrar advertencia cuando quedan menos de 5 minutos
          <Text style={styles.warningText}>
            ⚠️ El código expirará pronto
          </Text>
        )}
      </View>

      <Button
        title="Verificar Código"
        onPress={handleVerifyCode}
        fullWidth
        style={styles.actionButton}
        isLoading={isLoading}
        disabled={verificationCode.join('').length !== 4 || timeLeft <= 0}
      />

      <TouchableOpacity
        style={styles.resendButton}
        onPress={() => {
          setStage(1);
          setVerificationCode(['', '', '', '']);
          setTimeLeft(30 * 60);
        }}
      >
        <Text style={styles.resendText}>
          Enviar nuevo código
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStageThree = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Nueva Contraseña</Text>
      <Text style={styles.subtitle}>
        Establece tu nueva contraseña. Debe tener al menos 6 caracteres.
      </Text>

      <Input
        label="Nueva Contraseña"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        leftIcon="lock"
        returnKeyType="next"
        onSubmitEditing={() => {}}
      />

      <Input
        label="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirma tu nueva contraseña"
        secureTextEntry
        leftIcon="lock"
        returnKeyType="done"
        onSubmitEditing={handleChangePassword}
      />

      <Button
        title="Cambiar Contraseña"
        onPress={handleChangePassword}
        fullWidth
        style={styles.actionButton}
        isLoading={isLoading}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        enabled
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.headerContainer}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  if (stage > 1) {
                    setStage(stage - 1);
                  } else {
                    navigation.goBack();
                  }
                }}
              >
                <Icon name="chevron-left" size={24} color={Colors.textDark} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {stage === 1 && 'Recuperar Contraseña'}
                {stage === 2 && 'Verificar Código'}
                {stage === 3 && 'Nueva Contraseña'}
              </Text>
            </View>
          </LinearGradient>

          {stage === 1 && renderStageOne()}
          {stage === 2 && renderStageTwo()}
          {stage === 3 && renderStageThree()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    width: '100%',
    paddingTop: Metrics.mediumSpacing,
    paddingBottom: Metrics.mediumSpacing,
    borderBottomLeftRadius: Metrics.mediumBorderRadius,
    borderBottomRightRadius: Metrics.mediumBorderRadius,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Metrics.mediumSpacing,
  },
  backButton: {
    padding: Metrics.smallSpacing,
    marginRight: Metrics.smallSpacing,
  },
  headerTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  formContainer: {
    padding: Metrics.mediumSpacing,
    marginTop: Metrics.largeSpacing,
  },
  title: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  subtitle: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.xLargeSpacing,
  },
  actionButton: {
    marginTop: Metrics.largeSpacing,
  },
  backToLoginButton: {
    marginTop: Metrics.xLargeSpacing,
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Metrics.largeSpacing,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.smallBorderRadius,
    textAlign: 'center',
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Metrics.largeSpacing,
  },
  timerText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  timerTime: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  warningText: {
    fontSize: Metrics.smallFontSize,
    color: '#FF6B35', // Color naranjo para advertencia
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Metrics.baseSpacing,
  },
  resendButton: {
    marginTop: Metrics.largeSpacing,
    alignItems: 'center',
  },
  resendText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen; 