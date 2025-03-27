import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const SignupScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('regularUser');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const emailInputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  const { signUp } = useContext(AuthContext);
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleSignUp = async () => {
    Keyboard.dismiss();
    
    // Validate inputs
    if (!email || !username || !password) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos requeridos.');
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Email inválido', 'Por favor, ingresa una dirección de correo electrónico válida.');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    if (!termsAccepted) {
      Alert.alert('Términos y condiciones', 'Debes aceptar los términos y condiciones para continuar.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register user and send verification email
      const result = await signUp({
        email,
        username,
        password,
        userType: activeTab === 'regularUser' ? 'regular' : 'student'
      });
      
      // If registration successful, navigate to verification screen
      if (result && result.success) {
        navigation.navigate('Verification', { email });
      }
    } catch (error) {
      // Handle registration errors
      console.error('Registration error:', error);
      Alert.alert(
        'Error en el registro',
        'Ha ocurrido un error al registrar tu cuenta. Por favor, intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
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
                onPress={() => navigation.goBack()}
              >
                <Icon name="chevron-left" size={24} color={Colors.textDark} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Crear Cuenta</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.content}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Bienvenido a CulinaryDelight</Text>
              <Text style={styles.welcomeMessage}>
                Comienza tu viaje culinario creando una cuenta. Te enviaremos un código de verificación para completar tu registro.
              </Text>
            </View>
            
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'regularUser' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('regularUser')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'regularUser' && styles.activeTabText,
                  ]}
                >
                  Usuario Regular
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'student' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('student')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'student' && styles.activeTabText,
                  ]}
                >
                  Estudiante
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <Input
                ref={emailInputRef}
                label="Correo Electrónico"
                value={email}
                onChangeText={setEmail}
                placeholder="tu@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => usernameInputRef.current?.focus()}
              />
              
              <Input
                ref={usernameInputRef}
                label="Nombre de Usuario / Alias"
                value={username}
                onChangeText={setUsername}
                placeholder="Elige un nombre de usuario único"
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
              
              <Input
                ref={passwordInputRef}
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={handleSignUp}
              />
              
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  activeOpacity={0.7}
                >
                  {termsAccepted ? (
                    <View style={styles.checkedBox}>
                      <Icon name="check" size={14} color={Colors.card} />
                    </View>
                  ) : (
                    <View style={styles.uncheckedBox} />
                  )}
                </TouchableOpacity>
                
                <Text style={styles.termsText}>
                  Acepto los{' '}
                  <Text style={styles.termsLink}>Términos de Servicio</Text> y la{' '}
                  <Text style={styles.termsLink}>Política de Privacidad</Text>
                </Text>
              </View>
              
              <Button
                title="Crear Cuenta"
                onPress={handleSignUp}
                fullWidth
                style={styles.createAccountButton}
                isLoading={isLoading}
              />
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o regístrate con</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity style={[styles.socialButton, styles.socialButtonWide]}>
                  <Icon name="google" size={20} color={Colors.textDark} style={styles.socialIcon} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.socialButton, styles.socialButtonWide]}>
                  <Icon name="facebook" size={20} color={Colors.textDark} style={styles.socialIcon} />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomText}>
            ¿Ya tienes una cuenta?{' '}
            <Text
              style={styles.bottomLink}
              onPress={() => navigation.navigate('Login')}
            >
              Iniciar Sesión
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.mediumSpacing,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Metrics.baseSpacing,
  },
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  welcomeContainer: {
    marginBottom: Metrics.largeSpacing,
  },
  welcomeTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  welcomeMessage: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: Metrics.mediumSpacing,
  },
  tab: {
    flex: 1,
    paddingVertical: Metrics.mediumSpacing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textMedium,
  },
  activeTabText: {
    color: Colors.textDark,
  },
  formContainer: {
    marginBottom: Metrics.largeSpacing,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Metrics.mediumSpacing,
    marginTop: Metrics.baseSpacing,
  },
  checkbox: {
    marginRight: Metrics.baseSpacing,
    marginTop: 2,
  },
  uncheckedBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: Colors.textMedium,
    borderRadius: 4,
  },
  checkedBox: {
    width: 16,
    height: 16,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
  },
  termsLink: {
    color: Colors.primary,
  },
  createAccountButton: {
    marginVertical: Metrics.mediumSpacing,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: Metrics.baseSpacing,
    color: Colors.textMedium,
    fontSize: Metrics.smallFontSize,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    height: 48,
    borderRadius: Metrics.baseBorderRadius,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonWide: {
    flexDirection: 'row',
    flex: 1,
    marginHorizontal: Metrics.baseSpacing,
  },
  socialIcon: {
    marginRight: Metrics.baseSpacing,
  },
  socialButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  bottomContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Metrics.mediumSpacing,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  bottomLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;