import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const AccountSettingsScreen = ({ route, navigation }) => {
  const { user, onUserUpdate } = route.params;
  const [editedUser, setEditedUser] = useState({ ...user });
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const accountTypes = [
    { id: 'visitor', name: 'Visitante', description: 'Acceso básico a recetas' },
    { id: 'user', name: 'Usuario', description: 'Crear y guardar recetas' },
    { id: 'student', name: 'Estudiante', description: 'Acceso completo a cursos' },
  ];

  const handleSaveChanges = async () => {
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await onUserUpdate(editedUser);
      Alert.alert('Éxito', 'Información de cuenta actualizada correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Todos los campos de contraseña son obligatorios');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción es irreversible. Se eliminarán todos tus datos, recetas, cursos y configuraciones.\n\n¿Estás seguro que quieres continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmación Final',
              'Escribe "ELIMINAR" para confirmar la eliminación de tu cuenta',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Confirmar',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Simulate account deletion
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      Alert.alert('Cuenta Eliminada', 'Tu cuenta ha sido eliminada exitosamente');
                      // Navigate to login or welcome screen
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                      });
                    } catch (error) {
                      Alert.alert('Error', 'No se pudo eliminar la cuenta');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderAccountTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tipo de Cuenta</Text>
      <Text style={styles.sectionDescription}>
        Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
      </Text>
      
      {accountTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.accountTypeCard,
            editedUser.accountType === type.id && styles.selectedAccountType
          ]}
          onPress={() => setEditedUser({ ...editedUser, accountType: type.id })}
        >
          <View style={styles.accountTypeHeader}>
            <View style={styles.accountTypeInfo}>
              <Text style={[
                styles.accountTypeName,
                editedUser.accountType === type.id && styles.selectedAccountTypeName
              ]}>
                {type.name}
              </Text>
              <Text style={styles.accountTypeDescription}>{type.description}</Text>
            </View>
            <View style={[
              styles.radioButton,
              editedUser.accountType === type.id && styles.selectedRadioButton
            ]}>
              {editedUser.accountType === type.id && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
          <Text style={styles.headerTitle}>Configuración de Cuenta</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
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
            <Text style={styles.inputLabel}>Ubicación</Text>
            <TextInput
              style={styles.textInput}
              value={editedUser.location}
              onChangeText={(text) => setEditedUser({ ...editedUser, location: text })}
              placeholder="Ciudad, País"
              placeholderTextColor={Colors.textLight}
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
        </View>

        {/* Account Type */}
        {renderAccountTypeSelector()}

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de Privacidad</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Perfil Público</Text>
              <Text style={styles.settingDescription}>
                Permite que otros usuarios vean tu perfil y recetas
              </Text>
            </View>
            <Switch
              value={editedUser.preferences?.publicProfile || false}
              onValueChange={(value) => setEditedUser({
                ...editedUser,
                preferences: { ...editedUser.preferences, publicProfile: value }
              })}
              trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              thumbColor={editedUser.preferences?.publicProfile ? Colors.primary : Colors.textLight}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Mostrar Email</Text>
              <Text style={styles.settingDescription}>
                Permite que otros usuarios vean tu email en tu perfil
              </Text>
            </View>
            <Switch
              value={editedUser.preferences?.showEmail || false}
              onValueChange={(value) => setEditedUser({
                ...editedUser,
                preferences: { ...editedUser.preferences, showEmail: value }
              })}
              trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              thumbColor={editedUser.preferences?.showEmail ? Colors.primary : Colors.textLight}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Recibir Mensajes</Text>
              <Text style={styles.settingDescription}>
                Permite que otros usuarios te envíen mensajes privados
              </Text>
            </View>
            <Switch
              value={editedUser.preferences?.allowMessages || true}
              onValueChange={(value) => setEditedUser({
                ...editedUser,
                preferences: { ...editedUser.preferences, allowMessages: value }
              })}
              trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              thumbColor={editedUser.preferences?.allowMessages ? Colors.primary : Colors.textLight}
            />
          </View>
        </View>

        {/* Change Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña actual</Text>
            <TextInput
              style={styles.textInput}
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
              placeholder="Ingresa tu contraseña actual"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nueva contraseña</Text>
            <TextInput
              style={styles.textInput}
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
              placeholder="Ingresa tu nueva contraseña"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
            <TextInput
              style={styles.textInput}
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
              placeholder="Confirma tu nueva contraseña"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
            />
          </View>

          <Button
            title="Cambiar Contraseña"
            onPress={handleChangePassword}
            style={styles.changePasswordButton}
            disabled={loading}
            iconName="lock"
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.error }]}>Zona de Peligro</Text>
          
          <View style={styles.dangerCard}>
            <View style={styles.dangerInfo}>
              <Text style={styles.dangerTitle}>Eliminar Cuenta</Text>
              <Text style={styles.dangerDescription}>
                Esta acción eliminará permanentemente tu cuenta y todos los datos asociados. 
                No se puede deshacer.
              </Text>
            </View>
            <Button
              title="Eliminar Cuenta"
              onPress={handleDeleteAccount}
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
              iconName="trash-2"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Button
          title={loading ? "Guardando..." : "Guardar Cambios"}
          onPress={handleSaveChanges}
          style={styles.saveButton}
          disabled={loading}
          iconName="save"
        />
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
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.mediumSpacing,
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
  accountTypeCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    backgroundColor: Colors.background,
  },
  selectedAccountType: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  accountTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountTypeInfo: {
    flex: 1,
  },
  accountTypeName: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 4,
  },
  selectedAccountTypeName: {
    color: Colors.primary,
  },
  accountTypeDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
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
  selectedRadioButton: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Metrics.baseSpacing,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: Metrics.mediumSpacing,
  },
  settingTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.baseLineHeight,
  },
  changePasswordButton: {
    marginTop: Metrics.baseSpacing,
  },
  dangerCard: {
    backgroundColor: Colors.error + '10',
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  dangerInfo: {
    marginBottom: Metrics.mediumSpacing,
  },
  dangerTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: Metrics.baseSpacing,
  },
  dangerDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    lineHeight: Metrics.baseLineHeight,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderWidth: 0,
  },
  deleteButtonText: {
    color: Colors.card,
  },
  saveContainer: {
    padding: Metrics.mediumSpacing,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    width: '100%',
  },
  bottomPadding: {
    height: Metrics.xxLargeSpacing,
  },
});

export default AccountSettingsScreen; 