import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const AboutScreen = ({ navigation }) => {
  const appInfo = {
    name: 'ChefNet',
    version: '1.2.0',
    buildNumber: '2024.03.15',
    description: 'La aplicación definitiva para amantes de la cocina. Descubre recetas, aprende con cursos profesionales y conecta con una comunidad apasionada por la gastronomía.',
    developer: 'ChefNet Technologies',
    website: 'https://www.chefnet.com',
    email: 'info@chefnet.com',
    phone: '+54 11 4567-8900',
  };

  const teamMembers = [
    {
      name: 'María González',
      role: 'CEO & Fundadora',
      description: 'Chef profesional con 15 años de experiencia',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'CTO',
      description: 'Ingeniero en Software especializado en apps móviles',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    },
    {
      name: 'Ana Martínez',
      role: 'Chef Principal',
      description: 'Especialista en cocina internacional y nutrición',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    },
  ];

  const legalLinks = [
    {
      title: 'Términos de Servicio',
      description: 'Condiciones de uso de la aplicación',
      icon: 'file-text',
      url: 'https://www.chefnet.com/terms',
    },
    {
      title: 'Política de Privacidad',
      description: 'Cómo protegemos tu información personal',
      icon: 'shield',
      url: 'https://www.chefnet.com/privacy',
    },
    {
      title: 'Política de Cookies',
      description: 'Uso de cookies y tecnologías similares',
      icon: 'settings',
      url: 'https://www.chefnet.com/cookies',
    },
    {
      title: 'Licencias de Software',
      description: 'Bibliotecas y componentes de terceros',
      icon: 'code',
      url: 'https://www.chefnet.com/licenses',
    },
  ];

  const socialLinks = [
    {
      platform: 'Instagram',
      username: '@chefnet_oficial',
      url: 'https://instagram.com/chefnet_oficial',
      icon: 'instagram',
      color: '#E4405F',
    },
    {
      platform: 'Facebook',
      username: 'ChefNet',
      url: 'https://facebook.com/chefnet',
      icon: 'facebook',
      color: '#1877F2',
    },
    {
      platform: 'Twitter',
      username: '@chefnet',
      url: 'https://twitter.com/chefnet',
      icon: 'twitter',
      color: '#1DA1F2',
    },
    {
      platform: 'YouTube',
      username: 'ChefNet Cocina',
      url: 'https://youtube.com/chefnet',
      icon: 'youtube',
      color: '#FF0000',
    },
  ];

  const features = [
    'Más de 10,000 recetas verificadas',
    'Cursos profesionales de cocina',
    'Escalador automático de porciones',
    'Modo offline para recetas',
    'Lista de compras inteligente',
    'Comunidad de cocineros',
    'Soporte multiplataforma',
    'Actualizaciones constantes',
  ];

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  const handleContactDeveloper = () => {
    Linking.openURL(`mailto:${appInfo.email}?subject=Contacto desde ChefNet App`);
  };

  const renderTeamMember = (member, index) => (
    <View key={index} style={styles.teamMemberCard}>
      <Image
        source={{ uri: member.avatar }}
        style={styles.memberAvatar}
        resizeMode="cover"
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
        <Text style={styles.memberDescription}>{member.description}</Text>
      </View>
    </View>
  );

  const renderLegalLink = (link, index) => (
    <TouchableOpacity
      key={index}
      style={styles.legalLinkCard}
      onPress={() => handleOpenLink(link.url)}
    >
      <View style={styles.legalLinkIcon}>
        <Icon name={link.icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.legalLinkInfo}>
        <Text style={styles.legalLinkTitle}>{link.title}</Text>
        <Text style={styles.legalLinkDescription}>{link.description}</Text>
      </View>
      <Icon name="external-link" size={16} color={Colors.textMedium} />
    </TouchableOpacity>
  );

  const renderSocialLink = (social, index) => (
    <TouchableOpacity
      key={index}
      style={styles.socialLinkCard}
      onPress={() => handleOpenLink(social.url)}
    >
      <View style={[styles.socialIcon, { backgroundColor: social.color + '20' }]}>
        <Icon name={social.icon} size={24} color={social.color} />
      </View>
      <View style={styles.socialInfo}>
        <Text style={styles.socialPlatform}>{social.platform}</Text>
        <Text style={styles.socialUsername}>{social.username}</Text>
      </View>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Acerca de</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appLogoContainer}>
            <View style={styles.appLogo}>
              <Icon name="chef-hat" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>{appInfo.name}</Text>
            <Text style={styles.appVersion}>Versión {appInfo.version}</Text>
            <Text style={styles.buildNumber}>Build {appInfo.buildNumber}</Text>
          </View>
          
          <Text style={styles.appDescription}>{appInfo.description}</Text>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Características Principales</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon name="check" size={16} color={Colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestro Equipo</Text>
          <Text style={styles.sectionDescription}>
            Conoce a las personas apasionadas que hacen posible ChefNet
          </Text>
          
          {teamMembers.map((member, index) => renderTeamMember(member, index))}
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Icon name="globe" size={20} color={Colors.primary} />
              <TouchableOpacity onPress={() => handleOpenLink(appInfo.website)}>
                <Text style={styles.contactLink}>{appInfo.website}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactRow}>
              <Icon name="mail" size={20} color={Colors.primary} />
              <TouchableOpacity onPress={handleContactDeveloper}>
                <Text style={styles.contactLink}>{appInfo.email}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactRow}>
              <Icon name="phone" size={20} color={Colors.primary} />
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${appInfo.phone}`)}>
                <Text style={styles.contactLink}>{appInfo.phone}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Síguenos</Text>
          <Text style={styles.sectionDescription}>
            Mantente conectado con la comunidad ChefNet
          </Text>
          
          <View style={styles.socialLinksGrid}>
            {socialLinks.map((social, index) => renderSocialLink(social, index))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Text style={styles.sectionDescription}>
            Información legal y políticas de la aplicación
          </Text>
          
          {legalLinks.map((link, index) => renderLegalLink(link, index))}
        </View>

        {/* Developer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desarrollado por</Text>
          
          <View style={styles.developerCard}>
            <View style={styles.developerIcon}>
              <Icon name="code" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.developerName}>{appInfo.developer}</Text>
            <Text style={styles.developerDescription}>
              Especialistas en desarrollo de aplicaciones móviles para la industria gastronómica
            </Text>
            <Button
              title="Contactar Desarrollador"
              onPress={handleContactDeveloper}
              style={styles.contactDeveloperButton}
              size="small"
              iconName="mail"
            />
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créditos</Text>
          
          <View style={styles.creditsCard}>
            <Text style={styles.creditsText}>
              Agradecimientos especiales a todos los chefs, desarrolladores, diseñadores y 
              la comunidad de usuarios que han contribuido a hacer de ChefNet una realidad.
            </Text>
            
            <View style={styles.creditsItem}>
              <Text style={styles.creditsLabel}>Iconos:</Text>
              <Text style={styles.creditsValue}>Feather Icons</Text>
            </View>
            
            <View style={styles.creditsItem}>
              <Text style={styles.creditsLabel}>Imágenes:</Text>
              <Text style={styles.creditsValue}>Unsplash, Pexels</Text>
            </View>
            
            <View style={styles.creditsItem}>
              <Text style={styles.creditsLabel}>Fuentes:</Text>
              <Text style={styles.creditsValue}>System Fonts</Text>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>
            © 2024 {appInfo.developer}. Todos los derechos reservados.
          </Text>
          <Text style={styles.copyrightSubtext}>
            Hecho con ❤️ para la comunidad gastronómica
          </Text>
        </View>

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
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  sectionDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.mediumSpacing,
    textAlign: 'center',
  },
  // App Info Styles
  appLogoContainer: {
    alignItems: 'center',
    marginBottom: Metrics.largeSpacing,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  appName: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  buildNumber: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  appDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
    textAlign: 'center',
    marginBottom: Metrics.largeSpacing,
  },
  featuresContainer: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  featuresTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  featureText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.baseSpacing,
  },
  // Team Styles
  teamMemberCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Metrics.mediumSpacing,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  memberRole: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: Metrics.baseSpacing,
  },
  memberDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.baseLineHeight,
  },
  // Contact Styles
  contactCard: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  contactLink: {
    fontSize: Metrics.baseFontSize,
    color: Colors.primary,
    marginLeft: Metrics.mediumSpacing,
    textDecorationLine: 'underline',
  },
  // Social Media Styles
  socialLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialLinkCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.baseSpacing,
  },
  socialInfo: {
    flex: 1,
  },
  socialPlatform: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 2,
  },
  socialUsername: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  // Legal Styles
  legalLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  legalLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.mediumSpacing,
  },
  legalLinkInfo: {
    flex: 1,
  },
  legalLinkTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 4,
  },
  legalLinkDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  // Developer Styles
  developerCard: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.largeSpacing,
    alignItems: 'center',
  },
  developerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  developerName: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
    textAlign: 'center',
  },
  developerDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.mediumSpacing,
  },
  contactDeveloperButton: {
    minWidth: 180,
  },
  // Credits Styles
  creditsCard: {
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  creditsText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.mediumSpacing,
    textAlign: 'center',
  },
  creditsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Metrics.baseSpacing,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  creditsLabel: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  creditsValue: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  // Copyright Styles
  copyrightContainer: {
    alignItems: 'center',
    paddingVertical: Metrics.largeSpacing,
  },
  copyrightText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  copyrightSubtext: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textLight,
    textAlign: 'center',
  },
  bottomPadding: {
    height: Metrics.xxLargeSpacing,
  },
});

export default AboutScreen; 