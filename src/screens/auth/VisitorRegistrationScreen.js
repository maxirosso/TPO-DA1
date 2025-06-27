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

  // Generar sugerencias de alias localmente como fallback
  const generateLocalAliasSuggestions = (baseAlias) => {
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

  // Obtener sugerencias de alias del backend
  const getSugerenciasAlias = async (baseAlias) => {
    try {
      const response = await dataService.getSugerenciasAlias(baseAlias);
      if (response && response.sugerencias && response.sugerencias.length > 0) {
        return response.sugerencias;
      }
    } catch (error) {
      console.log('Error obteniendo sugerencias del backend:', error);
    }
    
    // Fallback a sugerencias locales
    return generateLocalAliasSuggestions(baseAlias);
  };

  // Manejar registro de visitante con verificación
  const handleVisitorRegistration = async () => {
    console.log('🟢 Iniciando registro de visitante con verificación:', { email, alias });
    
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
      console.log('🟡 Registrando visitante en backend (Etapa 1)...');
      
      // Registrar visitante etapa 1 (envía código)
      const registrationResult = await dataService.registerVisitorStage1(email, alias);
      
      console.log('🟢 Resultado del backend:', registrationResult);

      // Verificar si fue exitoso
      if (registrationResult && registrationResult.success) {
        console.log('🟢 Registro etapa 1 exitoso!');
        
        Alert.alert(
          'Código Enviado',
          registrationResult.message || 'Se ha enviado un código de verificación de 4 dígitos a tu email. El código es válido por 24 horas.',
          [
            { 
              text: 'Continuar', 
              onPress: () => {
                // Navegar a la pantalla de verificación
                navigation.navigate('Verification', { 
                  email: email,
                  userType: 'visitante',
                  alias: alias 
                });
              }
            }
          ]
        );
      } else {
        // Registro falló, verificar la razón
        if (registrationResult.aliasUnavailable) {
          // Alias no disponible con sugerencias
          console.log('🟡 Alias no disponible, mostrando sugerencias del backend');
          if (registrationResult.suggestions && registrationResult.suggestions.length > 0) {
            setAliasSuggestions(registrationResult.suggestions);
          } else {
            // Fallback a sugerencias locales
            const localSuggestions = generateLocalAliasSuggestions(alias);
            setAliasSuggestions(localSuggestions);
          }
          
          Alert.alert(
            'Alias No Disponible',
            'Este alias ya está en uso. Te sugerimos algunas alternativas disponibles.'
          );
        } else {
          // Otro tipo de error (email ya registrado, etc.)
          Alert.alert(
            'Error de Registro',
            registrationResult.error || 'No se pudo completar el registro. Intenta nuevamente.'
          );
        }
      }

    } catch (error) {
      console.log('🔴 Registration error:', error);
      console.log('🔴 Error response data:', error.response?.data);
      console.log('🔴 Error aliasUnavailable:', error.aliasUnavailable);
      console.log('🔴 Error suggestions:', error.suggestions);
      
      // Verificar si es un error estructurado del backend
      if (error.backendResponse || error.response?.data) {
        const backendData = error.backendResponse || error.response?.data;
        console.log('🟡 Error estructurado del backend:', backendData);
        
        if (error.aliasUnavailable || backendData.aliasUnavailable) {
          // Alias no disponible con sugerencias
          console.log('🟡 Alias no disponible, mostrando sugerencias del error');
          const suggestions = error.suggestions || backendData.suggestions;
          if (suggestions && suggestions.length > 0) {
            console.log('🟢 Sugerencias encontradas:', suggestions);
            setAliasSuggestions(suggestions);
          } else {
            console.log('🟡 No hay sugerencias del backend, generando localmente');
            // Fallback a sugerencias locales
            const localSuggestions = generateLocalAliasSuggestions(alias);
            setAliasSuggestions(localSuggestions);
          }
          
          Alert.alert(
            'Alias No Disponible',
            'Este alias ya está en uso. Te sugerimos algunas alternativas disponibles.'
          );
        } else {
          // Otro tipo de error estructurado (email ya registrado, etc.)
          const errorMessage = backendData.error || error.message || 'No se pudo completar el registro. Intenta nuevamente.';
          Alert.alert(
            'Error de Registro',
            errorMessage
          );
        }
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        // Errores de red
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar al servidor. Verifica tu conexión a internet e intenta nuevamente.',
        );
      } else {
        // Otros errores generales
        Alert.alert(
          'Error de Registro', 
          error.message || 'No se pudo completar el registro. Intenta nuevamente.'
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
            Te enviaremos un código de verificación para completar tu registro.
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
          title={loading ? "Registrando..." : "Crear Usuario"}
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
    marginBottom: Metrics.largeSpacing,
  },
  infoSection: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.largeSpacing,
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
    backgroundColor: Colors.primary + '10',
    borderRadius: Metrics.baseBorderRadius,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    marginBottom: Metrics.largeSpacing,
  },
  upgradeButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default VisitorRegistrationScreen; 