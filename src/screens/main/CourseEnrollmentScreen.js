import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const CourseEnrollmentScreen = ({ navigation, route }) => {
  const { course, location } = route.params || {};
  
  const [paymentMethod, setPaymentMethod] = useState('saved_card'); // 'saved_card', 'new_card', 'otro'
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock saved card
  const savedCard = {
    last4: '5678',
    brand: 'visa',
    expiryDate: '12/25',
  };
  
  const calculateDiscount = () => {
    if (!location || !location.discount) return 0;
    return (course.price * location.discount) / 100;
  };
  
  const calculateTotal = () => {
    const discount = calculateDiscount();
    return course.price - discount;
  };
  
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19); // maximo 16 digitos + 3 espacios
  };
  
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };
  
  const handleCardNumberChange = (text) => {
    setCardNumber(formatCardNumber(text));
  };
  
  const handleExpiryDateChange = (text) => {
    setExpiryDate(formatExpiryDate(text));
  };
  
  const handleCvvChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    setCvv(cleaned.slice(0, 3));
  };
  
  const validateForm = () => {
    if (paymentMethod === 'new_card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('Error', 'Por favor, ingresa un número de tarjeta válido.');
        return false;
      }
      
      if (!expiryDate || expiryDate.length !== 5) {
        Alert.alert('Error', 'Por favor, ingresa una fecha de expiración válida.');
        return false;
      }
      
      if (!cvv || cvv.length !== 3) {
        Alert.alert('Error', 'Por favor, ingresa un código de seguridad válido.');
        return false;
      }
      
      if (!cardholderName) {
        Alert.alert('Error', 'Por favor, ingresa el nombre del titular de la tarjeta.');
        return false;
      }
    }
    
    return true;
  };
  
  const handleEnrollment = () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      Alert.alert(
        'Inscripción Exitosa',
        `Te has inscrito exitosamente al curso "${course.title}". Se ha enviado un correo electrónico con los detalles a tu dirección registrada.`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'AppNavigator', params: { screen: 'MyCoursesScreen' } }
                ],
              });
            },
          },
        ]
      );
    }, 2000);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        enabled
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
            <Text style={styles.headerTitle}>Inscripción a Curso</Text>
          </View>
        </LinearGradient>
        
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.courseCard}>
            <Image
              source={{ uri: course.imageUrl }}
              style={styles.courseImage}
              resizeMode="cover"
            />
            
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              
              <View style={styles.locationContainer}>
                <Icon name="map-pin" size={14} color={Colors.textMedium} />
                <Text style={styles.locationText}>{location.name}</Text>
              </View>
              
              <View style={styles.dateContainer}>
                <Icon name="calendar" size={14} color={Colors.textMedium} />
                <Text style={styles.dateText}>
                  {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Resumen del Pago</Text>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Precio del curso</Text>
              <Text style={styles.summaryValue}>${course.price.toFixed(2)}</Text>
            </View>
            
            {location.discount > 0 && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Descuento ({location.discount}%)</Text>
                <Text style={styles.discountValue}>-${calculateDiscount().toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <View style={styles.totalItem}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Método de Pago</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'saved_card' && styles.selectedPaymentOption,
              ]}
              onPress={() => setPaymentMethod('saved_card')}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioButton,
                    paymentMethod === 'saved_card' && styles.radioButtonSelected,
                  ]}
                />
              </View>
              
              <View style={styles.cardInfo}>
                <Icon name="credit-card" size={24} color={Colors.primary} />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardLabel}>Tarjeta Guardada</Text>
                  <Text style={styles.cardDescription}>
                    {savedCard.brand.toUpperCase()} •••• {savedCard.last4}
                  </Text>
                  <Text style={styles.cardExpiry}>Vence: {savedCard.expiryDate}</Text>
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'new_card' && styles.selectedPaymentOption,
              ]}
              onPress={() => setPaymentMethod('new_card')}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioButton,
                    paymentMethod === 'new_card' && styles.radioButtonSelected,
                  ]}
                />
              </View>
              
              <View style={styles.cardInfo}>
                <Icon name="credit-card" size={24} color={Colors.textDark} />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardLabel}>Nueva Tarjeta</Text>
                  <Text style={styles.cardDescription}>
                    Agregar una nueva tarjeta de crédito o débito
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'other' && styles.selectedPaymentOption,
              ]}
              onPress={() => setPaymentMethod('other')}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioButton,
                    paymentMethod === 'other' && styles.radioButtonSelected,
                  ]}
                />
              </View>
              
              <View style={styles.cardInfo}>
                <Icon name="dollar-sign" size={24} color={Colors.textDark} />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardLabel}>Otros Métodos</Text>
                  <Text style={styles.cardDescription}>
                    Pagar en persona en la sede seleccionada
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            
            {paymentMethod === 'new_card' && (
              <View style={styles.newCardForm}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Número de Tarjeta</Text>
                  <View style={styles.cardNumberContainer}>
                    <TextInput
                      style={styles.cardNumberInput}
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChangeText={handleCardNumberChange}
                      keyboardType="numeric"
                      maxLength={19} // 16 digitos + 3 espacios
                    />
                    <Icon name="credit-card" size={20} color={Colors.textMedium} />
                  </View>
                </View>
                
                <View style={styles.rowInputs}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Fecha de Expiración</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChangeText={handleExpiryDateChange}
                      keyboardType="numeric"
                      maxLength={5} 
                    />
                  </View>
                  
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      value={cvv}
                      onChangeText={handleCvvChange}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nombre en la Tarjeta</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="NOMBRE COMPLETO"
                    value={cardholderName}
                    onChangeText={setCardholderName}
                    autoCapitalize="characters"
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.saveCardOption}
                  onPress={() => setSaveCard(!saveCard)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      saveCard && styles.checkboxSelected,
                    ]}
                  >
                    {saveCard && <Icon name="check" size={12} color={Colors.card} />}
                  </View>
                  <Text style={styles.saveCardText}>
                    Guardar esta tarjeta para futuras compras
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Al inscribirte, aceptas nuestros{' '}
              <Text style={styles.termsLink}>Términos y Condiciones</Text> y la{' '}
              <Text style={styles.termsLink}>Política de Cancelación</Text>.
            </Text>
          </View>
          
          <View style={styles.cancelPolicyContainer}>
            <Text style={styles.cancelPolicyTitle}>Política de Cancelación:</Text>
            <View style={styles.policyItem}>
              <Icon name="check" size={14} color={Colors.success} />
              <Text style={styles.policyText}>
                Cancelación gratuita hasta 10 días hábiles antes del inicio.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Icon name="alert-circle" size={14} color={Colors.warning} />
              <Text style={styles.policyText}>
                70% de reembolso entre 9 días y 1 día antes del inicio.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Icon name="x" size={14} color={Colors.error} />
              <Text style={styles.policyText}>
                50% de reembolso el día de inicio. Sin reembolso después.
              </Text>
            </View>
          </View>
          
          <Button
            title={paymentMethod === 'other' ? "Reservar Plaza" : "Completar Pago"}
            onPress={handleEnrollment}
            fullWidth
            style={styles.enrollButton}
            isLoading={isLoading}
          />
          
          <View style={styles.securePaymentContainer}>
            <Icon name="lock" size={14} color={Colors.textMedium} />
            <Text style={styles.securePaymentText}>Pago seguro con cifrado SSL</Text>
          </View>
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
    flex: 1,
  },
  scrollContentContainer: {
    padding: Metrics.mediumSpacing,
    paddingBottom: Metrics.xxLargeSpacing,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    overflow: 'hidden',
    marginBottom: Metrics.mediumSpacing,
  },
  courseImage: {
    width: 100,
    height: 100,
  },
  courseInfo: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  courseTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.smallSpacing,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 8,
  },
  sectionContainer: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  sectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  summaryValue: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  discountValue: {
    fontSize: Metrics.baseFontSize,
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Metrics.baseSpacing,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  totalValue: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Metrics.baseSpacing,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.baseSpacing,
  },
  selectedPaymentOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  radioContainer: {
    marginRight: Metrics.baseSpacing,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetails: {
    marginLeft: Metrics.baseSpacing,
    flex: 1,
  },
  cardLabel: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  cardExpiry: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginTop: 2,
  },
  newCardForm: {
    marginTop: Metrics.baseSpacing,
  },
  inputContainer: {
    marginBottom: Metrics.baseSpacing,
  },
  inputLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: Metrics.baseSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    paddingHorizontal: Metrics.baseSpacing,
  },
  cardNumberInput: {
    flex: 1,
    paddingVertical: Metrics.baseSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  saveCardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Metrics.smallSpacing,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Metrics.baseSpacing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  saveCardText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  termsContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  termsText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.mediumLineHeight,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  cancelPolicyContainer: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  cancelPolicyTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  policyText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 8,
    flex: 1,
  },
  enrollButton: {
    marginBottom: Metrics.baseSpacing,
  },
  securePaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securePaymentText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 4,
  },
});

export default CourseEnrollmentScreen;