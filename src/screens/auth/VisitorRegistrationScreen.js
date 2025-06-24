import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import dataService from '../../services/dataService';
import api from '../../services/api';
import apiConfig from '../../config/api.config';
import { AuthContext } from '../../context/AuthContext';

const VisitorRegistrationScreen = ({ navigation }) => {
  const { enterVisitorMode } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [aliasSuggestions, setAliasSuggestions] = useState([]);

  // Validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Generar sugerencias de alias
  const generateAliasSuggestions = (baseAlias) => {
    const suggestions = [];
    const base = baseAlias.replace(/\d+$/, ''); // Remover números al final
    
    // Agregar números aleatorios
    for (let i = 0; i < 3; i++) {
      suggestions.push(base + Math.floor(Math.random() * 1000));
    }
    
    // Agregar año actual
    suggestions.push(base + new Date().getFullYear());
    
    // Agregar variaciones
    suggestions.push(base + '_chef');
    suggestions.push('chef_' + base);
    
    return suggestions;
  };

  // Verificar disponibilidad de username
  const checkUsernameAvailability = async (username) => {
    console.log('🟡 Verificando username:', username);
    try {
      // Agregar timeout de 5 segundos para evitar que se quede colgado
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      console.log('🟡 Llamando a api.auth.checkUsername...');
      console.log('🔍 Base URL que se usará:', apiConfig.API_BASE_URL);
      
      const response = await Promise.race([
        api.auth.checkUsername(username),
        timeoutPromise
      ]);
      
      console.log('🟢 Respuesta completa verificación username:', response);
      console.log('🟢 Datos respuesta:', response.data);
      
      // Verificar si la respuesta tiene la estructura correcta
      if (response && response.data) {
        if (!response.data.available) {
          console.log('🟡 Username no disponible, generando sugerencias...');
          const suggestions = response.data.suggestions || generateAliasSuggestions(username);
          setAliasSuggestions(suggestions);
          Alert.alert(
            'Alias No Disponible',
            'Este alias ya está en uso. Te sugerimos algunas alternativas.',
          );
          return false;
        }
        console.log('🟢 Username disponible según respuesta');
        return true;
      } else {
        console.log('🟠 Respuesta inesperada, asumiendo disponible');
        return true;
      }
    } catch (error) {
      console.log('🔴 Error checking username (usando fallback local):', error);
      console.log('🔴 Error details:', error.message, error.status);
      // Si falla la verificación, generar sugerencias localmente
      // pero permitir que continúe (el backend validará finalmente)
      return true;
    }
  };

  // Manejar registro de visitante
  const handleVisitorRegistration = async () => {
    console.log('🟢 Iniciando registro de visitante:', { email, alias });
    
    // Validaciones
    if (!email.trim() || !isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!alias.trim() || alias.length < 3) {
      Alert.alert('Error', 'El alias debe tener al menos 3 caracteres');
      return;
    }

    console.log('🟢 Validaciones pasadas, iniciando loading...');
    setLoading(true);
    
    try {
      console.log('🟡 Verificando disponibilidad del alias...');
      // Verificar disponibilidad del alias
      const aliasAvailable = await checkUsernameAvailability(alias);
      console.log('🟢 Resultado verificación alias:', aliasAvailable);
      
      if (!aliasAvailable) {
        console.log('🔴 Alias no disponible, mostrando sugerencias');
        setLoading(false);
        return; // La función ya mostró las sugerencias - NO continuar con registro
      }

      console.log('🟡 Registrando visitante en backend...');
      console.log('🔍 Registrando con datos:', { email, alias });
      
      // Registrar visitante con timeout más corto
      const registrationTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout al registrar')), 8000)
      );
      
      const registrationResult = await Promise.race([
        dataService.registerVisitor(email, alias),
        registrationTimeoutPromise
      ]);
      
      console.log('🟢 Registro exitoso!');
      console.log('🟢 Resultado registro:', registrationResult);

      Alert.alert(
        'Registro Exitoso',
        'Te registraste correctamente como visitante. Puedes comenzar a explorar recetas y cursos. Si tienes conectividad, recibirás un email de confirmación.',
        [
          { 
            text: 'Continuar', 
            onPress: () => {
              // Activar modo visitante y navegar a la app principal
              enterVisitorMode();
            }
          }
        ]
      );

    } catch (error) {
      console.log('🔴 Registration error:', error);
      console.log('🔴 Error response:', error.response);
      console.log('🔴 Error message:', error.message);
      console.log('🔴 Error status:', error.status);
      
      if (error.message.includes('Timeout')) {
        Alert.alert(
          'Registro Completado',
          'El registro puede haberse completado pero el servidor está tardando en responder. Intenta iniciar sesión como visitante o verifica si recibiste un email de confirmación.',
          [
            { text: 'Intentar Login', onPress: () => navigation.navigate('Login') },
            { text: 'Reintentar', onPress: () => {} }
          ]
        );
      } else if (error.response && error.response.status === 400) {
        // Error del backend - probablemente email o alias ya registrado
        const errorMessage = error.response.data || error.message;
        console.log('🔴 Backend error message:', errorMessage);
        
        if (errorMessage.includes('alias ya está registrado') || errorMessage.includes('El alias ya está registrado')) {
          // Alias ya está en uso - generar sugerencias
          const suggestions = generateAliasSuggestions(alias);
          setAliasSuggestions(suggestions);
          Alert.alert(
            'Alias No Disponible',
            'Este alias ya está en uso. Te sugerimos algunas alternativas disponibles.'
          );
        } else if (errorMessage.includes('email ya está registrado') || errorMessage.includes('El email ya está registrado')) {
          Alert.alert(
            'Email Ya Registrado',
            'Este email ya está registrado. Si el proceso de registración no se completó nunca, deberás enviar un mail a la empresa para liberarlo.'
          );
        } else {
          Alert.alert(
            'Error de Registro',
            errorMessage || 'No se pudo completar el registro. Intenta nuevamente.'
          );
        }
      } else if (error.message.includes('ya registrado')) {
        // Mensaje de error en español del backend
        if (error.message.includes('alias')) {
          const suggestions = generateAliasSuggestions(alias);
          setAliasSuggestions(suggestions);
          Alert.alert(
            'Alias No Disponible',
            'Este alias ya está en uso. Te sugerimos algunas alternativas.'
          );
        } else {
          Alert.alert(
            'Datos Ya Registrados',
            'El email o alias ya están registrados. Si el proceso de registración no se completó nunca, deberás enviar un mail a la empresa para liberarlo.'
          );
        }
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar al servidor. Verifica tu conexión a internet e intenta nuevamente.',
        );
      } else if (error.status === 500) {
        Alert.alert(
          'Error del Servidor',
          'Hay un problema temporal en el servidor. El registro puede haberse completado. Intenta iniciar sesión o verifica tu email.'
        );
      } else {
        // Error genérico - mostrar el mensaje completo para debugging
        console.log('🔴 Error completo para mostrar:', JSON.stringify(error, null, 2));
        Alert.alert(
          'Error de Registro', 
          `No se pudo completar el registro. Detalles: ${error.message || 'Error desconocido'}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar sugerencia de alias
  const selectAliasSuggestion = (suggestion) => {
    setAlias(suggestion);
    setAliasSuggestions([]);
  };

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
          <Text style={styles.headerTitle}>Registro de Visitante</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>¡Bienvenido a ChefNet!</Text>
          <Text style={styles.welcomeDescription}>
            Como visitante podrás explorar recetas y ver cursos disponibles. 
            Solo necesitamos tu email y un alias para comenzar.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email *</Text>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Alias *</Text>
          <Input
            value={alias}
            onChangeText={(text) => {
              setAlias(text);
              // Limpiar sugerencias cuando el usuario modifica el alias
              if (aliasSuggestions.length > 0) {
                setAliasSuggestions([]);
              }
            }}
            placeholder="Mi alias único"
            autoCapitalize="none"
            leftIcon="user"
          />
          <Text style={styles.helpText}>
            Elige un alias único que te identifique en ChefNet
          </Text>
        </View>

        {/* Sugerencias de alias */}
        {aliasSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Sugerencias de alias disponibles:</Text>
            <View style={styles.suggestionsGrid}>
              {aliasSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => selectAliasSuggestion(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Button
          title={loading ? "Registrando..." : "Registrarse como Visitante"}
          onPress={handleVisitorRegistration}
          style={styles.registerButton}
          disabled={loading}
          iconName="user-plus"
        />

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Como visitante podrás:</Text>
          <View style={styles.benefitItem}>
            <Icon name="eye" size={16} color={Colors.primary} />
            <Text style={styles.benefitText}>Ver recetas y cursos disponibles</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="search" size={16} color={Colors.primary} />
            <Text style={styles.benefitText}>Buscar recetas por nombre e ingredientes</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="info" size={16} color={Colors.primary} />
            <Text style={styles.benefitText}>Explorar información básica de cursos</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.upgradeButtonText}>
            ¿Quieres más funcionalidades? Regístrate como Usuario
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  form: {
    flex: 1,
    paddingHorizontal: Metrics.mediumSpacing,
  },
  welcomeSection: {
    paddingVertical: Metrics.largeSpacing,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  welcomeDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.baseLineHeight,
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
  helpText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginTop: Metrics.smallSpacing,
  },
  suggestionsContainer: {
    marginBottom: Metrics.mediumSpacing,
    padding: Metrics.mediumSpacing,
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  suggestionsTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Metrics.baseSpacing,
  },
  suggestionButton: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  suggestionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  registerButton: {
    marginVertical: Metrics.largeSpacing,
  },
  infoSection: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  infoTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  benefitText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    marginLeft: Metrics.baseSpacing,
    flex: 1,
  },
  upgradeButton: {
    padding: Metrics.mediumSpacing,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.xxLargeSpacing,
  },
  upgradeButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default VisitorRegistrationScreen; 