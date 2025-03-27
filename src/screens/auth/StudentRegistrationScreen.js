import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const StudentRegistrationScreen = ({ navigation }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleContinue = () => {
    if (!cardNumber || !expiry || !cvv || !cardName) {
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Verification', { email: 'estudiante@ejemplo.com' });
    }, 1500);
  };
  
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };
  
  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
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
            <Text style={styles.headerTitle}>Registro de Estudiante</Text>
          </View>
        </LinearGradient>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '33%' }]} />
            </View>
            <Text style={styles.progressText}>Paso 1/3</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoIcon}>
              <Icon name="info" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.infoText}>
              El registro como estudiante es gratuito a menos que te inscribas en un curso. Necesitarás proporcionar información de pago para futuras inscripciones.
            </Text>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Método de Pago</Text>
            <Text style={styles.sectionDescription}>
              Agrega un método de pago para las inscripciones a cursos. No te cobraremos hasta que te registres en un curso.
            </Text>
            
            <Input
              label="Número de Tarjeta"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              placeholder="1234 5678 9012 3456"
              keyboardType="number-pad"
              leftIcon="credit-card"
            />
            
            <View style={styles.rowFields}>
              <Input
                label="Fecha de Expiración"
                value={expiry}
                onChangeText={(text) => setExpiry(formatExpiry(text))}
                placeholder="MM/AA"
                keyboardType="number-pad"
                style={styles.halfField}
              />
              
              <Input
                label="Código de Seguridad"
                value={cvv}
                onChangeText={setCvv}
                placeholder="CVV"
                keyboardType="number-pad"
                maxLength={3}
                style={styles.halfField}
              />
            </View>
            
            <Input
              label="Nombre en la Tarjeta"
              value={cardName}
              onChangeText={setCardName}
              placeholder="Juan Pérez"
            />
            
            <Text style={styles.altPaymentLabel}>O usa otro método de pago</Text>
            
            <View style={styles.altPaymentsContainer}>
              <TouchableOpacity style={styles.altPaymentButton}>
                <Icon name="dollar-sign" size={20} color={Colors.textDark} style={styles.altPaymentIcon} />
                <Text style={styles.altPaymentText}>Pagar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.altPaymentButton}>
                <Icon name="credit-card" size={20} color={Colors.textDark} style={styles.altPaymentIcon} />
                <Text style={styles.altPaymentText}>PayPal</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Button
            title="Continuar"
            onPress={handleContinue}
            fullWidth
            style={styles.continueButton}
            isLoading={isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles remain unchanged
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
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  infoIcon: {
    marginRight: Metrics.baseSpacing,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
    lineHeight: Metrics.mediumLineHeight,
  },
  sectionContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  sectionTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  sectionDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.mediumSpacing,
  },
  rowFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '48%',
  },
  altPaymentLabel: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  altPaymentsContainer: {
    flexDirection: 'row',
    marginBottom: Metrics.mediumSpacing,
  },
  altPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    marginRight: Metrics.baseSpacing,
    flex: 1,
  },
  altPaymentIcon: {
    marginRight: Metrics.smallSpacing,
  },
  altPaymentText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  continueButton: {
    marginTop: Metrics.baseSpacing,
    marginBottom: Metrics.xxLargeSpacing,
  },
});

export default StudentRegistrationScreen;