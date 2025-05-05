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

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('signIn');
  const [email, setEmail] = useState('test@example.com');  // Default email for development
  const [password, setPassword] = useState('password');    // Default password for development
  const [isLoading, setIsLoading] = useState(false);
  
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  const { signIn, resendVerificationCode } = useContext(AuthContext);
  
  const handleSignIn = async () => {
    Keyboard.dismiss();
    
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.log('Error al iniciar sesión:', error);
      
      if (error.message === 'Invalid credentials') {
        Alert.alert(
          'Error al iniciar sesión',
          'El correo electrónico o la contraseña son incorrectos. Si no tienes una cuenta, por favor regístrate primero.'
        );
      } else if (error.message === 'EMAIL_NOT_VERIFIED') {
        // This shouldn't happen with our development modifications
        Alert.alert(
          'Correo No Verificado',
          'Tu correo electrónico aún no ha sido verificado. ¿Deseas que te enviemos un nuevo código de verificación?',
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Enviar Código',
              onPress: async () => {
                try {
                  const sent = await resendVerificationCode(email);
                  if (sent) {
                    navigation.navigate('Verification', { email });
                  } else {
                    Alert.alert(
                      'Error',
                      'No pudimos enviar el código de verificación. Por favor, intenta registrarte nuevamente.'
                    );
                  }
                } catch (err) {
                  console.error('Error sending verification code:', err);
                  Alert.alert(
                    'Error',
                    'Ha ocurrido un error al enviar el código de verificación.'
                  );
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error al iniciar sesión',
          'Ha ocurrido un error inesperado. Por favor, intenta nuevamente más tarde.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = () => {
    navigation.navigate('Signup');
  };
  
  const renderSignInTab = () => (
    <>
      <Input
        ref={emailInputRef}
        label="Dirección de Correo"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        keyboardType="email-address"
        leftIcon="mail"
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
        placeholder="••••••••"
        secureTextEntry
        leftIcon="lock"
        returnKeyType="done"
        blurOnSubmit={true}
        onSubmitEditing={handleSignIn}
        rightComponent={
          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordButton}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        }
      />
      
      <Button
        title="Iniciar Sesión"
        onPress={handleSignIn}
        fullWidth
        style={styles.signInButton}
        isLoading={isLoading}
      />
      
      <View style={styles.devNote}>
        <Text style={styles.devNoteText}>
          Modo de desarrollo: Utiliza el correo y contraseña predeterminados, 
          o regístrate para crear una nueva cuenta.
        </Text>
      </View>
      
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o continúa con</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="google" size={20} color={Colors.textDark} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="facebook" size={20} color={Colors.textDark} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="apple" size={20} color={Colors.textDark} />
        </TouchableOpacity>
      </View>
    </>
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
                onPress={() => navigation.goBack()}
              >
                <Icon name="chevron-left" size={24} color={Colors.textDark} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Cuenta</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="pie-chart" size={48} color={Colors.card} />
            </View>
            <Text style={styles.welcomeTitle}>Bienvenido a ChefNet</Text>
            <Text style={styles.welcomeSubtitle}>
              Inicia sesión para acceder a tus recetas y cursos
            </Text>
          </View>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'signIn' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('signIn')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'signIn' && styles.activeTabText,
                ]}
              >
                Iniciar Sesión
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'signUp' && styles.activeTab,
              ]}
              onPress={handleSignUp}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'signUp' && styles.activeTabText,
                ]}
              >
                Registrarse
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            {renderSignInTab()}
          </View>
        </ScrollView>
        
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomText}>
            ¿No tienes una cuenta?{' '}
            <Text
              style={styles.bottomLink}
              onPress={handleSignUp}
            >
              Registrarse
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
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: Metrics.largeSpacing,
    paddingTop: Metrics.baseSpacing,
    paddingBottom: Metrics.xLargeSpacing,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: Metrics.xLargeBorderRadius,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Metrics.mediumSpacing,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Metrics.largeSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  tab: {
    flex: 1,
    paddingVertical: Metrics.mediumSpacing,
    alignItems: 'center',
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
    color: Colors.primary,
  },
  formContainer: {
    paddingHorizontal: Metrics.largeSpacing,
  },
  forgotPasswordButton: {
    paddingVertical: Metrics.smallSpacing,
  },
  forgotPasswordText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  signInButton: {
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  devNote: {
    backgroundColor: Colors.primary + '20',
    padding: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.mediumSpacing,
  },
  devNoteText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    textAlign: 'center',
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
    justifyContent: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: Metrics.baseBorderRadius,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Metrics.baseSpacing,
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

export default LoginScreen;