import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const HelpSupportScreen = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('faq');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    email: '',
  });

  const faqData = [
    {
      id: 1,
      question: '¿Cómo puedo crear una nueva receta?',
      answer: 'Para crear una nueva receta, ve a la pestaña "Explorar" y toca el botón "+" en la esquina superior derecha. Completa todos los campos requeridos: nombre, ingredientes, instrucciones y tiempo de preparación.',
    },
    {
      id: 2,
      question: '¿Cómo guardo mis recetas favoritas?',
      answer: 'Toca el ícono de corazón en cualquier receta para agregarla a tus favoritos. Puedes ver todas tus recetas guardadas en la pestaña "Guardadas".',
    },
    {
      id: 3,
      question: '¿Puedo ajustar las cantidades de ingredientes?',
      answer: 'Sí, en la pantalla de detalles de cualquier receta, puedes usar el escalador de porciones para ajustar automáticamente todas las cantidades según el número de personas.',
    },
    {
      id: 4,
      question: '¿Cómo me inscribo a un curso de cocina?',
      answer: 'Ve a la sección "Cursos" desde el menú principal. Selecciona el curso que te interese, elige la sede y horario, y completa el proceso de inscripción con tu método de pago.',
    },
    {
      id: 5,
      question: '¿Puedo cancelar mi inscripción a un curso?',
      answer: 'Sí, puedes cancelar tu inscripción desde "Mis Cursos" en tu perfil. El reintegro depende de cuándo canceles: 100% si es más de 10 días antes, 70% entre 1-10 días, 50% el mismo día, y 0% después del inicio.',
    },
    {
      id: 6,
      question: '¿Cómo funciona el modo offline?',
      answer: 'Puedes descargar recetas para verlas sin conexión. Ve a la configuración de la app y activa el "Modo Offline", luego descarga las recetas que quieras tener disponibles.',
    },
    {
      id: 7,
      question: '¿Puedo compartir mis recetas con otros usuarios?',
      answer: 'Sí, puedes compartir tus recetas usando el botón de compartir en cada receta. También puedes hacer público tu perfil para que otros usuarios vean todas tus creaciones.',
    },
    {
      id: 8,
      question: '¿Cómo cambio mi contraseña?',
      answer: 'Ve a tu perfil > Configuración de Cuenta > Cambiar Contraseña. Necesitarás tu contraseña actual para establecer una nueva.',
    },
  ];

  const contactOptions = [
    {
      id: 'email',
      title: 'Email de Soporte',
      description: 'soporte@chefnet.com',
      icon: 'mail',
      action: () => Linking.openURL('mailto:soporte@chefnet.com'),
    },
    {
      id: 'phone',
      title: 'Teléfono de Soporte',
      description: '+54 11 4567-8900',
      icon: 'phone',
      action: () => Linking.openURL('tel:+541145678900'),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Chat directo con soporte',
      icon: 'message-circle',
      action: () => Linking.openURL('https://wa.me/541145678900'),
    },
    {
      id: 'website',
      title: 'Centro de Ayuda Web',
      description: 'www.chefnet.com/ayuda',
      icon: 'globe',
      action: () => Linking.openURL('https://www.chefnet.com/ayuda'),
    },
  ];

  const quickActions = [
    {
      id: 'report_bug',
      title: 'Reportar un Error',
      description: 'Informa sobre problemas técnicos',
      icon: 'bug',
      color: Colors.error,
    },
    {
      id: 'feature_request',
      title: 'Sugerir Función',
      description: 'Propón nuevas características',
      icon: 'lightbulb',
      color: Colors.warning,
    },
    {
      id: 'account_help',
      title: 'Problemas de Cuenta',
      description: 'Ayuda con login y configuración',
      icon: 'user',
      color: Colors.primary,
    },
    {
      id: 'payment_help',
      title: 'Problemas de Pago',
      description: 'Ayuda con cursos y facturación',
      icon: 'credit-card',
      color: Colors.success,
    },
  ];

  const handleFAQToggle = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleQuickAction = (actionId) => {
    setContactForm({
      ...contactForm,
      subject: getSubjectForAction(actionId),
    });
    setActiveSection('contact');
  };

  const getSubjectForAction = (actionId) => {
    const subjects = {
      report_bug: 'Reporte de Error - ',
      feature_request: 'Sugerencia de Función - ',
      account_help: 'Problema de Cuenta - ',
      payment_help: 'Problema de Pago - ',
    };
    return subjects[actionId] || '';
  };

  const handleSendMessage = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim() || !contactForm.email.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!contactForm.email.includes('@')) {
      Alert.alert('Error', 'Ingresa un email válido');
      return;
    }

    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Mensaje Enviado',
        'Tu mensaje ha sido enviado exitosamente. Nuestro equipo de soporte te responderá en un plazo de 24-48 horas.',
        [{ text: 'OK', onPress: () => {
          setContactForm({ subject: '', message: '', email: '' });
          setActiveSection('faq');
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el mensaje. Intenta nuevamente.');
    }
  };

  const renderTabButton = (tabId, title, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeSection === tabId && styles.activeTabButton]}
      onPress={() => setActiveSection(tabId)}
    >
      <Icon 
        name={icon} 
        size={16} 
        color={activeSection === tabId ? Colors.card : Colors.textMedium} 
      />
      <Text style={[
        styles.tabButtonText,
        activeSection === tabId && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderFAQSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionDescription}>
        Encuentra respuestas rápidas a las preguntas más frecuentes sobre ChefNet.
      </Text>
      
      {faqData.map((faq) => (
        <TouchableOpacity
          key={faq.id}
          style={styles.faqItem}
          onPress={() => handleFAQToggle(faq.id)}
          activeOpacity={0.7}
        >
          <View style={styles.faqHeader}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Icon 
              name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={Colors.textMedium} 
            />
          </View>
          {expandedFAQ === faq.id && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>{faq.answer}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContactSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionDescription}>
        ¿No encontraste lo que buscabas? Contáctanos directamente.
      </Text>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.subsectionTitle}>Acciones Rápidas</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => handleQuickAction(action.id)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Icon name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contact Options */}
      <View style={styles.contactOptionsContainer}>
        <Text style={styles.subsectionTitle}>Opciones de Contacto</Text>
        {contactOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.contactOption}
            onPress={option.action}
          >
            <View style={styles.contactOptionIcon}>
              <Icon name={option.icon} size={20} color={Colors.primary} />
            </View>
            <View style={styles.contactOptionInfo}>
              <Text style={styles.contactOptionTitle}>{option.title}</Text>
              <Text style={styles.contactOptionDescription}>{option.description}</Text>
            </View>
            <Icon name="external-link" size={16} color={Colors.textMedium} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact Form */}
      <View style={styles.contactFormContainer}>
        <Text style={styles.subsectionTitle}>Enviar Mensaje</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={contactForm.email}
            onChangeText={(text) => setContactForm({ ...contactForm, email: text })}
            placeholder="tu@email.com"
            placeholderTextColor={Colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Asunto</Text>
          <TextInput
            style={styles.textInput}
            value={contactForm.subject}
            onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
            placeholder="Describe brevemente tu consulta"
            placeholderTextColor={Colors.textLight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mensaje</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={contactForm.message}
            onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
            placeholder="Describe tu problema o consulta en detalle..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <Button
          title="Enviar Mensaje"
          onPress={handleSendMessage}
          style={styles.sendButton}
          iconName="send"
        />
      </View>
    </View>
  );

  const renderGuideSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionDescription}>
        Aprende a usar todas las funciones de ChefNet con nuestras guías paso a paso.
      </Text>

      <View style={styles.guideCard}>
        <Icon name="book-open" size={32} color={Colors.primary} />
        <Text style={styles.guideTitle}>Guía de Inicio Rápido</Text>
        <Text style={styles.guideDescription}>
          Aprende los conceptos básicos para comenzar a usar ChefNet
        </Text>
        <Button
          title="Ver Guía"
          onPress={() => Alert.alert('Próximamente', 'La guía interactiva estará disponible pronto')}
          style={styles.guideButton}
          size="small"
        />
      </View>

      <View style={styles.guideCard}>
        <Icon name="video" size={32} color={Colors.success} />
        <Text style={styles.guideTitle}>Tutoriales en Video</Text>
        <Text style={styles.guideDescription}>
          Videos explicativos sobre las funciones principales
        </Text>
        <Button
          title="Ver Videos"
          onPress={() => Linking.openURL('https://www.youtube.com/chefnet')}
          style={styles.guideButton}
          size="small"
        />
      </View>

      <View style={styles.guideCard}>
        <Icon name="download" size={32} color={Colors.warning} />
        <Text style={styles.guideTitle}>Manual de Usuario</Text>
        <Text style={styles.guideDescription}>
          Descarga el manual completo en PDF
        </Text>
        <Button
          title="Descargar PDF"
          onPress={() => Alert.alert('Descarga', 'El manual se descargará en tu dispositivo')}
          style={styles.guideButton}
          size="small"
        />
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('faq', 'FAQ', 'help-circle')}
          {renderTabButton('contact', 'Contacto', 'message-square')}
          {renderTabButton('guides', 'Guías', 'book')}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeSection === 'faq' && renderFAQSection()}
        {activeSection === 'contact' && renderContactSection()}
        {activeSection === 'guides' && renderGuideSection()}
        
        <View style={styles.bottomPadding} />
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
    paddingBottom: Metrics.mediumSpacing,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Metrics.mediumSpacing,
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
  tabsContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
    marginHorizontal: Metrics.smallSpacing,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
    borderRadius: Metrics.baseBorderRadius,
  },
  tabButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    marginLeft: Metrics.smallSpacing,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: Colors.card,
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    padding: Metrics.mediumSpacing,
  },
  sectionDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.largeSpacing,
    textAlign: 'center',
  },
  subsectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
  },
  // FAQ Styles
  faqItem: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.baseSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Metrics.mediumSpacing,
  },
  faqQuestion: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  faqAnswer: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingBottom: Metrics.mediumSpacing,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  faqAnswerText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
    marginTop: Metrics.baseSpacing,
  },
  // Contact Styles
  quickActionsContainer: {
    marginBottom: Metrics.largeSpacing,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  quickActionTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  contactOptionsContainer: {
    marginBottom: Metrics.largeSpacing,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  contactOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.mediumSpacing,
  },
  contactOptionInfo: {
    flex: 1,
  },
  contactOptionTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 4,
  },
  contactOptionDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  contactFormContainer: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
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
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    marginTop: Metrics.baseSpacing,
  },
  // Guide Styles
  guideCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.largeSpacing,
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guideTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    textAlign: 'center',
  },
  guideDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.mediumSpacing,
  },
  guideButton: {
    minWidth: 120,
  },
  bottomPadding: {
    height: Metrics.xxLargeSpacing,
  },
});

export default HelpSupportScreen; 