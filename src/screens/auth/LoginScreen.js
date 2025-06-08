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
  Image,
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  const { signIn, resendVerificationCode, enterVisitorMode } = useContext(AuthContext);
  
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
  
  const handleVisitorMode = () => {
    enterVisitorMode();
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
      
      <TouchableOpacity
        style={styles.visitorButton}
        onPress={handleVisitorMode}
      >
        <Text style={styles.visitorButtonText}>
          Continuar como Visitante
        </Text>
      </TouchableOpacity>
    </>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
            colors={['#00A4A4', '#00A4A4']}
            style={styles.headerContainer}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.headerTitle}>Chef Net</Text>
              <Image
                source={require('../../assets/images/chef_hat.png')}
                style={styles.headerChefHat}
                resizeMode="contain"
              />
            </View>

            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitleHeader}>Bienvenido a ChefNet!</Text>
              <Text style={styles.welcomeSubtitleHeader}>
                Inicia sesión para acceder a tus recetas y cursos
              </Text>
            </View>
          </LinearGradient>

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
    paddingTop: Metrics.xxLargeSpacing * 2,
    paddingBottom: Metrics.mediumSpacing,
    backgroundColor: '#00A4A4',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Metrics.largeSpacing,  // Más espacio con el texto de bienvenida
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Metrics.mediumSpacing,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '700',
    color: Colors.card,
    marginRight: Metrics.smallSpacing,
  },
  headerChefHat: {
    width: 32,
    height: 32,
    tintColor: Colors.card,
  },
  welcomeContainer: {
    alignItems: 'center',
  },

  welcomeTitleHeader: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '700',
    color: Colors.card,
    marginBottom: Metrics.baseSpacing,
    textAlign: 'center',
  },
  welcomeSubtitleHeader: {
    fontSize: Metrics.baseFontSize,
    color: Colors.card,
    textAlign: 'center',
    opacity: 0.9,
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
  visitorButton: {
    marginTop: Metrics.baseSpacing,
    alignItems: 'center',
  },
  visitorButtonText: {
    color: Colors.primary,
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
  },
});

export default LoginScreen;