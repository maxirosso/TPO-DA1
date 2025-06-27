import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import dataService from '../../services/dataService';

const { width } = Dimensions.get('window');

const VerificationScreen = ({ navigation, route }) => {
  const { email = '', userType = 'usuario', alias = '' } = route.params || {};
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [activeInput, setActiveInput] = useState(null);
  
  const { verifyCode, resendVerificationCode, enterVisitorMode, setUser } = useContext(AuthContext);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;
    
    // Update the digits of the code
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);
    
    // Auto-focus the next input if the current one is filled
    if (text && index < 3) {
      inputRefs[index + 1].current.focus();
      setActiveInput(index + 1);
    }
  };
  
  const handleKeyPress = (e, index) => {
    // Handle backspace key to move to the previous input
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs[index - 1].current.focus();
      setActiveInput(index - 1);
    }
  };

  const handleKeyboardPress = (key) => {
    if (activeInput === null) {
      // If no input is active, activate the first empty one
      for (let i = 0; i < verificationCode.length; i++) {
        if (!verificationCode[i]) {
          setActiveInput(i);
          inputRefs[i].current.focus();
          break;
        }
      }
      
      // If all inputs are filled, select the last one
      if (activeInput === null) {
        setActiveInput(verificationCode.length - 1);
        inputRefs[verificationCode.length - 1].current.focus();
      }
      return;
    }

    if (key === '⌫') {
      // Handle backspace
      const newCode = [...verificationCode];
      if (newCode[activeInput]) {
        newCode[activeInput] = '';
        setVerificationCode(newCode);
      } else if (activeInput > 0) {
        // Move to previous input if current is empty
        setActiveInput(activeInput - 1);
        inputRefs[activeInput - 1].current.focus();
      }
    } else if (key === 'espacio') {
      // Space - do nothing
      return;
    } else if (key === 'return') {
      // Handle return - validate the code
      if (verificationCode.every(digit => digit !== '')) {
        handleVerify();
      }
    } else if (/^\d$/.test(key)) {
      // Handle digit press
      const newCode = [...verificationCode];
      newCode[activeInput] = key;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (activeInput < verificationCode.length - 1) {
        setActiveInput(activeInput + 1);
        inputRefs[activeInput + 1].current.focus();
      }
    }
  };
  
  const handleVerify = async () => {
    // Verificar que el código esté completo
    const codigo = verificationCode.join('');
    if (codigo.length !== 4) {
      Alert.alert('Código Incompleto', 'Por favor ingresa el código de 4 dígitos completo.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🟢 Verificando código:', { email, codigo, userType });
      
      let verificationResult;
      
      if (userType === 'visitante') {
        // Verificar código de visitante
        verificationResult = await dataService.verifyVisitorCode(email, codigo);
        
        console.log('🟢 Resultado verificación visitante:', verificationResult);
        
        if (verificationResult && verificationResult.success && verificationResult.user) {
          // Guardar datos del usuario en el contexto
          const userData = {
            idUsuario: verificationResult.user.idUsuario,
            mail: verificationResult.user.mail,
            nickname: verificationResult.user.nickname,
            tipo: verificationResult.user.tipo,
            habilitado: verificationResult.user.habilitado
          };
          
          console.log('🟢 Guardando datos del visitante en contexto:', userData);
          setUser(userData);
          
          Alert.alert(
            'Registro Completado',
            'Tu registro como visitante se ha completado exitosamente. ¡Ya puedes explorar ChefNet!',
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
        } else {
          Alert.alert(
            'Código Inválido',
            'El código ingresado es incorrecto o ha expirado. Por favor, intenta nuevamente o solicita un nuevo código.'
          );
        }
      } else {
        // Verificar código de usuario normal
        verificationResult = await dataService.verifyUserCode(email, codigo);
        
        if (verificationResult) {
          // Navegar a completar perfil para usuarios normales
          navigation.navigate('CompleteProfile', { email });
        } else {
          Alert.alert(
            'Código Inválido',
            'El código ingresado es incorrecto o ha expirado. Por favor, intenta nuevamente o solicita un nuevo código.'
          );
        }
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert(
        'Error de Verificación',
        error.message || 'Ha ocurrido un error al verificar tu código. Por favor, intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    if (isResending) return;
    
    setIsResending(true);
    
    try {
      console.log('🟢 Reenviando código:', { email, userType });
      
      let resendResult;
      
      if (userType === 'visitante') {
        // Reenviar código de visitante
        resendResult = await dataService.resendVisitorCode(email);
      } else {
        // Reenviar código de usuario normal
        resendResult = await dataService.resendUserCode(email);
      }
      
      if (resendResult) {
        Alert.alert(
          'Código Reenviado',
          'Hemos enviado un nuevo código de verificación a tu correo electrónico.'
        );
        // Resetear el timer de 24 horas
        setTimeLeft(24 * 60 * 60);
      } else {
        Alert.alert(
          'Error',
          'No se pudo reenviar el código. Verifica tu email e intenta nuevamente.'
        );
      }
      
    } catch (error) {
      console.error('Resend code error:', error);
      Alert.alert(
        'Error',
        error.message || 'Ha ocurrido un error al reenviar el código. Por favor, intenta nuevamente más tarde.'
      );
    } finally {
      setIsResending(false);
    }
  };

  // Generate keyboard rows
  const renderKeyboardRow = (keys) => {
    return (
      <View style={styles.keyboardRow}>
        {keys.map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.keyboardKey,
              ['⌫', 'espacio', 'return', '123'].includes(key) && styles.functionKey
            ]}
            onPress={() => handleKeyboardPress(key)}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <Text style={styles.headerTitle}>Ingresar código</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.content}>
        <Text style={styles.emailMessage}>
          {userType === 'visitante' 
            ? `Ingresa el código de 4 dígitos que recibiste en tu correo para completar tu registro como visitante (${email})`
            : `Ingresa el código de 4 dígitos que recibiste en tu correo (${email})`
          }
        </Text>
        
        <View style={styles.codeInputContainer}>
          {verificationCode.map((digit, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setActiveInput(index);
                inputRefs[index].current.focus();
              }}
              style={[
                styles.codeInputWrapper,
                activeInput === index && styles.codeInputWrapperActive
              ]}
            >
              <TextInput
                ref={inputRefs[index]}
                style={styles.codeInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                onFocus={() => setActiveInput(index)}
                showSoftInputOnFocus={false}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>¿No recibiste el código?</Text>
          <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
            <Text style={[styles.resendButton, isResending && styles.resendButtonDisabled]}>
              {isResending ? 'Enviando...' : 'Reenviar'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Button
          title="Continuar"
          onPress={handleVerify}
          fullWidth
          style={styles.verifyButton}
          isLoading={isLoading}
        />
        
        {/* Virtual Keyboard */}
        <View style={styles.keyboard}>
          {renderKeyboardRow(['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'])}
          <View style={styles.keyboardMiddleRow}>
            {renderKeyboardRow(['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'])}
          </View>
          <View style={styles.keyboardBottomRow}>
            <TouchableOpacity
              style={[styles.keyboardKey, styles.functionKey]}
              onPress={() => handleKeyboardPress('123')}
            >
              <Text style={styles.keyText}>123</Text>
            </TouchableOpacity>
            
            <View style={styles.letterKeysContainer}>
              {renderKeyboardRow(['Z', 'X', 'C', 'V', 'B', 'N', 'M'])}
            </View>
            
            <TouchableOpacity
              style={[styles.keyboardKey, styles.functionKey]}
              onPress={() => handleKeyboardPress('⌫')}
            >
              <Text style={styles.keyText}>⌫</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyboardLastRow}>
            <TouchableOpacity
              style={[styles.keyboardKey, styles.functionKey, { flex: 1, marginHorizontal: 4 }]}
              onPress={() => handleKeyboardPress('espacio')}
            >
              <Text style={styles.keyText}>espacio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.keyboardKey, styles.functionKey, { flex: 1, marginHorizontal: 4 }]}
              onPress={() => handleKeyboardPress('return')}
            >
              <Text style={styles.keyText}>return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={styles.expirationText}>
          Tu código de verificación expirará en{' '}
          <Text style={styles.expirationTime}>{formatTimeLeft()}</Text>
        </Text>
      </View>
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
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  emailMessage: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Metrics.smallFontSize,
    marginBottom: Metrics.largeSpacing,
    marginTop: Metrics.smallSpacing,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Metrics.largeSpacing,
  },
  codeInputWrapper: {
    width: 48,
    height: 58,
    borderRadius: Metrics.borderRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  codeInputWrapperActive: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  codeInput: {
    fontSize: Metrics.largeFontSize,
    color: Colors.textDark,
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Metrics.largeSpacing,
  },
  resendText: {
    color: Colors.textSecondary,
    fontSize: Metrics.smallFontSize,
  },
  resendButton: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: Metrics.smallFontSize,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  verifyButton: {
    marginBottom: Metrics.mediumSpacing,
  },
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Metrics.smallSpacing,
    alignItems: 'center',
  },
  expirationText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textSecondary,
  },
  expirationTime: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  keyboard: {
    backgroundColor: Colors.keyboardBackground,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 'auto',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  keyboardMiddleRow: {
    paddingHorizontal: 10,
  },
  keyboardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  letterKeysContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  keyboardLastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  keyboardKey: {
    backgroundColor: Colors.card,
    borderRadius: 6,
    padding: 12,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: width / 12,
  },
  functionKey: {
    backgroundColor: Colors.keyboardFunctionKey,
    paddingHorizontal: 12,
  },
  keyText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
  },
});

export default VerificationScreen;