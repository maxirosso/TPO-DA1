import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import dataService from '../../services/dataService';

const AccountSettingsScreen = ({ navigation, route }) => {
  const { user: initialUser, onUserUpdate } = route.params || {};
  
  const [user, setUser] = useState(initialUser || {});
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [studentData, setStudentData] = useState({
    medioPago: '',
    dniFrente: '',
    dniFondo: '',
    tramite: '',
  });

  // Load complete user data including student information if applicable
  useEffect(() => {
    loadCompleteUserData();
  }, []);

  const loadCompleteUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user data from AsyncStorage
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditedUser(parsedUser);
        
        // If user is a student, try to load additional student data
        if (parsedUser.tipo === 'alumno' && parsedUser.idUsuario) {
          try {
            const alumnoData = await dataService.getAlumnoById(parsedUser.idUsuario);
            if (alumnoData) {
              setUser(prev => ({ ...prev, studentInfo: alumnoData }));
              setEditedUser(prev => ({ ...prev, studentInfo: alumnoData }));
            }
          } catch (error) {
            console.log('Error loading student data:', error);
          }
        }
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedUser.nombre?.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    if (!editedUser.mail?.trim() || !editedUser.mail.includes('@')) {
      Alert.alert('Error', 'Ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      // Update user profile via backend if available
      if (dataService.useBackend) {
        await dataService.updateUserProfile(editedUser);
      }
      
      // Update local storage
      await AsyncStorage.setItem('user_data', JSON.stringify(editedUser));
      setUser(editedUser);
      setEditModalVisible(false);
      
      if (onUserUpdate) {
        onUserUpdate(editedUser);
      }
      
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToStudent = async () => {
    // Validate student data
    if (!studentData.medioPago.trim()) {
      Alert.alert('Error', 'El medio de pago es obligatorio');
      return;
    }
    if (!studentData.dniFrente.trim()) {
      Alert.alert('Error', 'La foto del DNI frente es obligatoria');
      return;
    }
    if (!studentData.dniFondo.trim()) {
      Alert.alert('Error', 'La foto del DNI dorso es obligatoria');
      return;
    }
    if (!studentData.tramite.trim()) {
      Alert.alert('Error', 'El número de trámite es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const studentRequest = {
        dniFrente: studentData.dniFrente,
        dniFondo: studentData.dniFondo,
        tramite: studentData.tramite,
        // Note: medioPago will be handled separately as per task requirements
      };

      // Call backend to upgrade user to student
      await dataService.upgradeToStudent(user.idUsuario, studentRequest);
      
      // Update local user data
      const updatedUser = {
        ...user,
        tipo: 'alumno',
        medioPago: studentData.medioPago,
        studentInfo: {
          dniFrente: studentData.dniFrente,
          dniFondo: studentData.dniFondo,
          tramite: studentData.tramite,
          cuentaCorriente: 0, // New account starts at 0
        }
      };
      
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setUpgradeModalVisible(false);
      
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      Alert.alert(
        'Éxito', 
        'Tu cuenta ha sido actualizada a Alumno. Ahora puedes inscribirte a cursos.',
        [{ text: 'Entendido', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.log('Error upgrading to student:', error);
      Alert.alert('Error', 'No se pudo actualizar la cuenta a Alumno');
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeDisplay = () => {
    switch (user.tipo) {
      case 'visitante': return { text: 'Visitante', color: Colors.textMedium, icon: 'eye' };
      case 'comun': return { text: 'Usuario Regular', color: Colors.primary, icon: 'user' };
      case 'alumno': return { text: 'Alumno', color: Colors.success, icon: 'book' };
      case 'empresa': return { text: 'Representante Empresa', color: Colors.warning, icon: 'shield' };
      default: return { text: 'Usuario', color: Colors.textMedium, icon: 'user' };
    }
  };

  const canUpgradeToStudent = () => {
    return user.tipo === 'comun'; // Only regular users can upgrade to student
  };

  const handlePasswordRecovery = async () => {
    if (!user.mail) {
      Alert.alert('Error', 'No se encontró el email del usuario');
      return;
    }

    Alert.alert(
      'Recuperar Contraseña',
      '¿Deseas enviar un código de recuperación a tu email?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar Código',
          onPress: async () => {
            setLoading(true);
            try {
              await dataService.resetPassword(user.mail);
              Alert.alert(
                'Código Enviado',
                'Se ha enviado un código de recuperación a tu email. El código tiene una validez de 30 minutos.'
              );
            } catch (error) {
              console.log('Error sending recovery code:', error);
              Alert.alert('Error', 'No se pudo enviar el código de recuperación');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
            <Text style={styles.modalTitle}>Editar Información Personal</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Icon name="x" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre completo *</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.nombre || ''}
                onChangeText={(text) => setEditedUser({ ...editedUser, nombre: text })}
                placeholder="Ingresa tu nombre completo"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.mail || ''}
                onChangeText={(text) => setEditedUser({ ...editedUser, mail: text })}
                placeholder="tu@email.com"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nickname</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.nickname || ''}
                onChangeText={(text) => setEditedUser({ ...editedUser, nickname: text })}
                placeholder="@usuario"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dirección</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.direccion || ''}
                onChangeText={(text) => setEditedUser({ ...editedUser, direccion: text })}
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

  const renderUpgradeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={upgradeModalVisible}
      onRequestClose={() => setUpgradeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cambiar a Cuenta de Alumno</Text>
            <TouchableOpacity onPress={() => setUpgradeModalVisible(false)}>
              <Icon name="x" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <Text style={styles.upgradeDescription}>
              Para convertir tu cuenta a Alumno necesitas proporcionar la siguiente información adicional:
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Medio de Pago *</Text>
              <TextInput
                style={styles.textInput}
                value={studentData.medioPago}
                onChangeText={(text) => setStudentData({ ...studentData, medioPago: text })}
                placeholder="Tarjeta de crédito, débito, etc."
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Foto DNI Frente *</Text>
              <TextInput
                style={styles.textInput}
                value={studentData.dniFrente}
                onChangeText={(text) => setStudentData({ ...studentData, dniFrente: text })}
                placeholder="URL o referencia de la foto del DNI frente"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Foto DNI Dorso *</Text>
              <TextInput
                style={styles.textInput}
                value={studentData.dniFondo}
                onChangeText={(text) => setStudentData({ ...studentData, dniFondo: text })}
                placeholder="URL o referencia de la foto del DNI dorso"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de Trámite *</Text>
              <TextInput
                style={styles.textInput}
                value={studentData.tramite}
                onChangeText={(text) => setStudentData({ ...studentData, tramite: text })}
                placeholder="Número de trámite del DNI"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.upgradeNote}>
              <Icon name="info" size={16} color={Colors.primary} />
              <Text style={styles.upgradeNoteText}>
                Registrarse como alumno no tiene costo. Solo se facturarán los cursos a los que te inscribas.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              type="outline"
              onPress={() => setUpgradeModalVisible(false)}
              style={styles.modalCancelButton}
            />
            <Button
              title={loading ? "Procesando..." : "Cambiar a Alumno"}
              onPress={handleUpgradeToStudent}
              style={styles.modalSaveButton}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const userType = getUserTypeDisplay();

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
          <Text style={styles.headerTitle}>Configuración de Cuenta</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Cuenta</Text>
          <View style={styles.accountTypeCard}>
            <View style={styles.accountTypeInfo}>
              <View style={[styles.accountTypeIcon, { backgroundColor: userType.color + '20' }]}>
                <Icon name={userType.icon} size={20} color={userType.color} />
              </View>
              <View style={styles.accountTypeDetails}>
                <Text style={styles.accountTypeTitle}>{userType.text}</Text>
                <Text style={styles.accountTypeDescription}>
                  {user.tipo === 'visitante' && 'Acceso limitado a recetas públicas'}
                  {user.tipo === 'comun' && 'Puede crear, gestionar recetas y ver contenido'}
                  {user.tipo === 'alumno' && 'Acceso completo incluyendo cursos'}
                  {user.tipo === 'empresa' && 'Puede aprobar recetas de usuarios'}
                </Text>
              </View>
            </View>
            {canUpgradeToStudent() && (
              <Button
                title="Cambiar a Alumno"
                type="outline"
                onPress={() => setUpgradeModalVisible(true)}
                style={styles.upgradeButton}
                iconName="arrow-up"
              />
            )}
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(true)}>
              <Icon name="edit-2" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{user.nombre || 'No especificado'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user.mail || 'No especificado'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nickname:</Text>
              <Text style={styles.infoValue}>@{user.nickname || 'usuario'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>{user.direccion || 'No especificada'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <Text style={[styles.infoValue, { color: user.habilitado === 'Si' ? Colors.success : Colors.error }]}>
                {user.habilitado === 'Si' ? 'Activo' : 'Pendiente de verificación'}
              </Text>
            </View>
          </View>
        </View>

        {/* Student Information Section - Only show for students */}
        {user.tipo === 'alumno' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Alumno</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Medio de Pago:</Text>
                <Text style={styles.infoValue}>{user.medioPago || 'No especificado'}</Text>
              </View>
              {user.studentInfo && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>DNI Frente:</Text>
                    <Text style={styles.infoValue}>{user.studentInfo.dniFront ? 'Registrado' : 'No registrado'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>DNI Dorso:</Text>
                    <Text style={styles.infoValue}>{user.studentInfo.dniBack ? 'Registrado' : 'No registrado'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Número de Trámite:</Text>
                    <Text style={styles.infoValue}>{user.studentInfo.tramite || 'No especificado'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Cuenta Corriente:</Text>
                    <Text style={[styles.infoValue, { fontWeight: '600' }]}>
                      ${user.studentInfo.accountBalance || '0.00'}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Password Recovery Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recuperación de Contraseña</Text>
          <View style={styles.infoCard}>
            <Text style={styles.recoveryInfo}>
              Si necesitas recuperar tu contraseña, puedes solicitar un código de recuperación. El código será válido por 30 minutos.
            </Text>
            <Button
              title="Solicitar Código de Recuperación"
              type="outline"
              onPress={handlePasswordRecovery}
              style={styles.recoveryButton}
              iconName="key"
            />
          </View>
        </View>
      </ScrollView>

      {renderEditModal()}
      {renderUpgradeModal()}
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
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  section: {
    marginBottom: Metrics.xLargeSpacing,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  sectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
  },
  accountTypeCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accountTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  accountTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.mediumSpacing,
  },
  accountTypeDetails: {
    flex: 1,
  },
  accountTypeTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  accountTypeDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.baseLineHeight,
  },
  upgradeButton: {
    marginTop: Metrics.baseSpacing,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Metrics.baseSpacing,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    flex: 2,
    textAlign: 'right',
  },
  actionsCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Metrics.mediumSpacing,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.mediumSpacing,
    flex: 1,
  },
  dangerAction: {
    borderBottomWidth: 0,
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
  upgradeDescription: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.mediumSpacing,
  },
  upgradeNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '10',
    padding: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginTop: Metrics.mediumSpacing,
  },
  upgradeNoteText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    marginLeft: Metrics.baseSpacing,
    flex: 1,
    lineHeight: Metrics.baseLineHeight,
  },
  recoveryInfo: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.mediumLineHeight,
    marginBottom: Metrics.mediumSpacing,
  },
  recoveryButton: {
    marginTop: Metrics.baseSpacing,
  },
});

export default AccountSettingsScreen; 