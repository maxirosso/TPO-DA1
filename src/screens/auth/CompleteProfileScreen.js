import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const CompleteProfileScreen = ({ navigation, route }) => {
  const { email = '' } = route.params || {};
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { completeProfile, signIn } = useContext(AuthContext);
  
  const handleCompleteProfile = async () => {
    //Validar inputs
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      Alert.alert('Error', 'No se encontró el correo electrónico para completar el perfil. Por favor, regístrate nuevamente.');
      return;
    }
    if (!name) {
      Alert.alert('Campos incompletos', 'Por favor, ingresa tu nombre completo.');
      return;
    }
    
    if (password && password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Por favor, verifica que las contraseñas ingresadas sean iguales.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      //Guardar info del perfil 
      const result = await completeProfile(email, {
        name,
        phoneNumber,
        password: password || undefined
      });
      
      if (result) {
        try {
          await signIn(email, password);
          
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } catch (error) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } else {
        Alert.alert(
          'Error',
          'No se pudo completar tu perfil. Por favor, intenta nuevamente.'
        );
      }
    } catch (error) {
      console.error('Errro al completar el perfil:', error);
      Alert.alert(
        'Error',
        'Ha ocurrido un error al completar tu perfil. Por favor, intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    completeProfile(email, { name: email.split('@')[0] })
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      })
      .catch((error) => {
        console.error('Error al omitir la finalizacion del perfil:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
            <Text style={styles.headerTitle}>Completar Perfil</Text>
          </View>
        </LinearGradient>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>Paso 3/3</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Input
              label="Nombre Completo"
              value={name}
              onChangeText={setName}
              placeholder="Ingresa tu nombre completo"
              leftIcon="user"
            />
            
            <Input
              label="Confirmar Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              leftIcon="lock"
            />
            
            <Input
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Vuelve a ingresar tu contraseña"
              secureTextEntry
              leftIcon="lock"
            />
            
            <Input
              label="Número de Teléfono (Opcional)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1 (___) ___-____"
              keyboardType="phone-pad"
              leftIcon="phone"
            />
            
            <Button
              title="Completar Registro"
              onPress={handleCompleteProfile}
              fullWidth
              style={styles.completeButton}
              isLoading={isLoading}
            />
          </View>
          
          <TouchableOpacity
            style={styles.skipContainer}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>Omitir por ahora</Text>
            <Text style={styles.skipSubtext}>
              Puedes completar tu perfil más tarde
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: Metrics.mediumSpacing,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.largeSpacing,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: Metrics.roundedFull,
    overflow: 'hidden',
    marginRight: Metrics.baseSpacing,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Metrics.roundedFull,
  },
  progressText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  formContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  completeButton: {
    marginTop: Metrics.mediumSpacing,
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: Metrics.mediumSpacing,
  },
  skipText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: Metrics.smallSpacing,
  },
  skipSubtext: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
});

export default CompleteProfileScreen;