import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Modal,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { AuthContext } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);
  
  // User state management
  const [user, setUser] = useState({
    name: 'Sarah Johnson',
    username: '@sarahjcook',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    bio: 'Entusiasta de la comida y chef casera. Me encanta experimentar con nuevos sabores y compartir mis recetas.',
    location: 'San Francisco, CA',
    recipeCount: 42,
    followers: 1253,
    following: 384,
    joinDate: '2023-01-15',
    accountType: 'student', // visitor, user, student
    preferences: {
      notifications: true,
      emailUpdates: true,
      darkMode: false,
      language: 'es',
    }
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({ ...user, ...parsedUser });
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.log('Error saving user data:', error);
      Alert.alert('Error', 'No se pudo guardar la información del perfil');
    }
  };

  const menuItems = [
    {
      id: 'my_recipes',
      icon: 'book-open',
      title: 'Mis Recetas',
      description: 'Ver y gestionar tus recetas creadas',
      badge: user.recipeCount,
    },
    {
      id: 'my_courses',
      icon: 'briefcase',
      title: 'Mis Cursos',
      description: 'Seguimiento de tu progreso de aprendizaje',
      badge: null,
    },
    {
      id: 'saved_recipes',
      icon: 'bookmark',
      title: 'Recetas Guardadas',
      description: 'Recetas que has guardado para después',
      badge: null,
    },
    {
      id: 'saved_scaled_recipes',
      icon: 'sliders',
      title: 'Recetas Escaladas',
      description: 'Recetas con cantidades personalizadas',
      badge: null,
    },
    {
      id: 'shopping_list',
      icon: 'shopping-cart',
      title: 'Lista de Compras',
      description: 'Tu lista de compras de ingredientes',
      badge: null,
    },
    {
      id: 'account_settings',
      icon: 'user',
      title: 'Configuración de Cuenta',
      description: 'Gestionar información personal y preferencias',
      badge: null,
    },
    {
      id: 'app_settings',
      icon: 'settings',
      title: 'Configuración de App',
      description: 'Notificaciones, idioma y preferencias',
      badge: null,
    },
    {
      id: 'server_config',
      icon: 'server',
      title: 'Configuración del Servidor',
      description: 'Conectar con tu servidor backend',
      badge: null,
    },
    {
      id: 'help',
      icon: 'help-circle',
      title: 'Ayuda y Soporte',
      description: 'Preguntas frecuentes e información de contacto',
      badge: null,
    },
    {
      id: 'about',
      icon: 'info',
      title: 'Acerca de',
      description: 'Información de la app y términos de uso',
      badge: null,
    },
  ];

  const handleMenuItemPress = (id) => {
    switch (id) {
      case 'my_recipes':
        navigation.navigate('MyRecipes');
        break;
      case 'saved_recipes':
        navigation.navigate('SavedTab');
        break;
      case 'my_courses':
        navigation.navigate('MyCourses');
        break;
      case 'saved_scaled_recipes':
        navigation.navigate('SavedScaledRecipes');
        break;
      case 'shopping_list':
        navigation.navigate('ShoppingList');
        break;
      case 'account_settings':
        navigation.navigate('AccountSettings', { user, onUserUpdate: saveUserData });
        break;
      case 'app_settings':
        navigation.navigate('AppSettings', { user, onUserUpdate: saveUserData });
        break;
      case 'server_config':
        navigation.navigate('ServerConfig');
        break;
      case 'help':
        navigation.navigate('HelpSupport');
        break;
      case 'about':
        navigation.navigate('About');
        break;
      default:
        Alert.alert('Próximamente', 'Esta función estará disponible pronto.');
    }
  };

  const handleEditProfile = () => {
    setEditedUser({ ...user });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editedUser.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    if (!editedUser.email.trim() || !editedUser.email.includes('@')) {
      Alert.alert('Error', 'Ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await saveUserData(editedUser);
      setEditModalVisible(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      const shareContent = {
        message: `¡Mira el perfil de ${user.name} en ChefNet! ${user.bio}`,
        url: `https://chefnet.app/profile/${user.username}`,
        title: `Perfil de ${user.name} - ChefNet`,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.log('Error sharing profile:', error);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Cambiar Foto de Perfil',
      'Selecciona una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: () => openCamera() },
        { text: 'Galería', onPress: () => openGallery() },
      ]
    );
  };

  const openCamera = () => {
    // In a real app, you would use react-native-image-picker
    Alert.alert('Cámara', 'Funcionalidad de cámara implementada');
  };

  const openGallery = () => {
    // In a real app, you would use react-native-image-picker
    Alert.alert('Galería', 'Funcionalidad de galería implementada');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              signOut();
            } catch (error) {
              console.log('Error signing out:', error);
            }
          }
        },
      ]
    );
  };

  const getAccountTypeBadge = () => {
    const badges = {
      visitor: { text: 'Visitante', color: Colors.textMedium },
      user: { text: 'Usuario', color: Colors.primary },
      student: { text: 'Estudiante', color: Colors.success },
    };
    return badges[user.accountType] || badges.user;
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Icon name="x" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.name}
                onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
                placeholder="Ingresa tu nombre completo"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.email}
                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                placeholder="tu@email.com"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.phone}
                onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={Colors.textLight}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Biografía</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editedUser.bio}
                onChangeText={(text) => setEditedUser({ ...editedUser, bio: text })}
                placeholder="Cuéntanos sobre ti..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ubicación</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.location}
                onChangeText={(text) => setEditedUser({ ...editedUser, location: text })}
                placeholder="Ciudad, País"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              type="outline"
              onPress={() => setEditModalVisible(false)}
              style={styles.modalCancelButton}
            />
            <Button
              title={loading ? "Guardando..." : "Guardar"}
              onPress={handleSaveProfile}
              style={styles.modalSaveButton}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Perfil</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => handleMenuItemPress('app_settings')}
            >
              <Icon name="settings" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handleChangeAvatar}
            >
              <Icon name="camera" size={16} color={Colors.card} />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={[styles.accountBadge, { backgroundColor: getAccountTypeBadge().color + '20' }]}>
                <Text style={[styles.accountBadgeText, { color: getAccountTypeBadge().color }]}>
                  {getAccountTypeBadge().text}
                </Text>
              </View>
            </View>
            <Text style={styles.userHandle}>{user.username}</Text>
            <Text style={styles.userBio}>{user.bio}</Text>

            <View style={styles.userDetails}>
              <View style={styles.detailRow}>
                <Icon name="map-pin" size={14} color={Colors.textMedium} />
                <Text style={styles.detailText}>{user.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="calendar" size={14} color={Colors.textMedium} />
                <Text style={styles.detailText}>Miembro desde {formatJoinDate(user.joinDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="mail" size={14} color={Colors.textMedium} />
                <Text style={styles.detailText}>{user.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{user.recipeCount}</Text>
              <Text style={styles.statLabel}>Recetas</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{user.followers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{user.following}</Text>
              <Text style={styles.statLabel}>Siguiendo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              title="Editar Perfil"
              type="outline"
              style={styles.editButton}
              onPress={handleEditProfile}
              iconName="edit-2"
            />
            <Button
              title="Compartir"
              type="primary"
              iconName="share-2"
              style={styles.shareButton}
              onPress={handleShareProfile}
            />
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>Gestión de Contenido</Text>
          {menuItems.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.badge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Icon name="chevron-right" size={20} color={Colors.textMedium} />
              </View>
            </TouchableOpacity>
          ))}

          <Text style={styles.menuSectionTitle}>Configuración</Text>
          {menuItems.slice(5, 8).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={Colors.textMedium} />
            </TouchableOpacity>
          ))}

          <Text style={styles.menuSectionTitle}>Soporte</Text>
          {menuItems.slice(8).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={Colors.textMedium} />
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Cerrar Sesión"
          type="outline"
          onPress={handleSignOut}
          style={styles.signOutButton}
          iconName="log-out"
        />

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>ChefNet v1.2.0</Text>
          <Text style={styles.copyrightText}>© 2024 ChefNet. Todos los derechos reservados.</Text>
        </View>
      </ScrollView>

      {renderEditModal()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.card + '20',
  },
  profileContainer: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    marginHorizontal: Metrics.mediumSpacing,
    marginTop: -20,
    padding: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: Metrics.mediumSpacing,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.card,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginRight: Metrics.baseSpacing,
  },
  accountBadge: {
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 4,
    borderRadius: Metrics.baseBorderRadius,
  },
  accountBadgeText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
  },
  userHandle: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.baseSpacing,
  },
  userBio: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Metrics.mediumSpacing,
    lineHeight: Metrics.mediumLineHeight,
  },
  userDetails: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  detailText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: Metrics.baseSpacing,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    paddingVertical: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.border,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  editButton: {
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  shareButton: {
    flex: 1,
    marginLeft: Metrics.baseSpacing,
  },
  menuContainer: {
    marginHorizontal: Metrics.mediumSpacing,
    marginVertical: Metrics.mediumSpacing,
  },
  menuSectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
    marginTop: Metrics.mediumSpacing,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.mediumSpacing,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.baseLineHeight,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: Colors.primary,
    borderRadius: Metrics.roundedFull,
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 2,
    marginRight: Metrics.baseSpacing,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '600',
    color: Colors.card,
  },
  signOutButton: {
    marginHorizontal: Metrics.mediumSpacing,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
    borderColor: Colors.error,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: Metrics.xxLargeSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
  },
  versionText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textLight,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    margin: Metrics.mediumSpacing,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  modalTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  modalForm: {
    maxHeight: 400,
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
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Metrics.mediumSpacing,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  modalSaveButton: {
    flex: 1,
    marginLeft: Metrics.baseSpacing,
  },
});

export default ProfileScreen;