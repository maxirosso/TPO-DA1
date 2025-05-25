import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const AppSettingsScreen = ({ route, navigation }) => {
  const { user, onUserUpdate } = route.params;
  const [settings, setSettings] = useState({
    notifications: user.preferences?.notifications || true,
    emailUpdates: user.preferences?.emailUpdates || true,
    pushNotifications: user.preferences?.pushNotifications || true,
    soundEnabled: user.preferences?.soundEnabled || true,
    vibrationEnabled: user.preferences?.vibrationEnabled || true,
    darkMode: user.preferences?.darkMode || false,
    language: user.preferences?.language || 'es',
    autoSync: user.preferences?.autoSync || true,
    offlineMode: user.preferences?.offlineMode || false,
    dataUsage: user.preferences?.dataUsage || 'wifi', // wifi, cellular, both
    cacheSize: user.preferences?.cacheSize || 'medium', // small, medium, large
  });

  const [loading, setLoading] = useState(false);

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
  ];

  const dataUsageOptions = [
    { value: 'wifi', label: 'Solo WiFi', description: 'Usar datos solo con WiFi' },
    { value: 'cellular', label: 'Solo Datos Móviles', description: 'Usar solo datos móviles' },
    { value: 'both', label: 'WiFi y Datos Móviles', description: 'Usar ambos tipos de conexión' },
  ];

  const cacheSizeOptions = [
    { value: 'small', label: 'Pequeño (50MB)', description: 'Menos espacio, más descargas' },
    { value: 'medium', label: 'Medio (200MB)', description: 'Balance entre espacio y rendimiento' },
    { value: 'large', label: 'Grande (500MB)', description: 'Más espacio, mejor rendimiento' },
  ];

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          ...settings,
        }
      };

      await onUserUpdate(updatedUser);
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      
      Alert.alert('Éxito', 'Configuración guardada correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Restablecer Configuración',
      '¿Estás seguro que quieres restablecer toda la configuración a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            setSettings({
              notifications: true,
              emailUpdates: true,
              pushNotifications: true,
              soundEnabled: true,
              vibrationEnabled: true,
              darkMode: false,
              language: 'es',
              autoSync: true,
              offlineMode: false,
              dataUsage: 'wifi',
              cacheSize: 'medium',
            });
            Alert.alert('Éxito', 'Configuración restablecida');
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpiar Caché',
      'Esto eliminará todas las imágenes y datos temporales almacenados. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          onPress: async () => {
            try {
              // Simulate cache clearing
              await new Promise(resolve => setTimeout(resolve, 2000));
              Alert.alert('Éxito', 'Caché limpiado correctamente. Se liberaron 150MB de espacio.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar el caché');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Datos',
      'Se creará un archivo con todas tus recetas, configuraciones y datos personales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: async () => {
            try {
              // Simulate data export
              await new Promise(resolve => setTimeout(resolve, 3000));
              Alert.alert('Éxito', 'Datos exportados correctamente. Revisa tu carpeta de descargas.');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron exportar los datos');
            }
          }
        }
      ]
    );
  };

  const handleOpenPermissions = () => {
    Alert.alert(
      'Configurar Permisos',
      'Se abrirá la configuración del sistema para gestionar los permisos de la aplicación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir', onPress: () => Linking.openSettings() }
      ]
    );
  };

  const renderSettingRow = (title, description, value, onValueChange, icon = null) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        {icon && <Icon name={icon} size={20} color={Colors.primary} style={styles.settingIcon} />}
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
        thumbColor={value ? Colors.primary : Colors.textLight}
      />
    </View>
  );

  const renderSelectionRow = (title, description, options, selectedValue, onSelect, icon = null) => (
    <View style={styles.section}>
      <View style={styles.selectionHeader}>
        {icon && <Icon name={icon} size={20} color={Colors.primary} style={styles.settingIcon} />}
        <View style={styles.settingTextContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
      </View>
      
      {options.map((option) => (
        <TouchableOpacity
          key={option.value || option.code}
          style={[
            styles.optionCard,
            selectedValue === (option.value || option.code) && styles.selectedOption
          ]}
          onPress={() => onSelect(option.value || option.code)}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionInfo}>
              <Text style={[
                styles.optionTitle,
                selectedValue === (option.value || option.code) && styles.selectedOptionTitle
              ]}>
                {option.flag ? `${option.flag} ${option.name}` : option.label}
              </Text>
              {option.description && (
                <Text style={styles.optionDescription}>{option.description}</Text>
              )}
            </View>
            <View style={[
              styles.radioButton,
              selectedValue === (option.value || option.code) && styles.selectedRadioButton
            ]}>
              {selectedValue === (option.value || option.code) && (
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
          <Text style={styles.headerTitle}>Configuración de App</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          
          {renderSettingRow(
            'Notificaciones Push',
            'Recibir notificaciones en tiempo real',
            settings.pushNotifications,
            (value) => setSettings({ ...settings, pushNotifications: value }),
            'bell'
          )}

          {renderSettingRow(
            'Actualizaciones por Email',
            'Recibir newsletters y actualizaciones',
            settings.emailUpdates,
            (value) => setSettings({ ...settings, emailUpdates: value }),
            'mail'
          )}

          {renderSettingRow(
            'Sonido',
            'Reproducir sonidos para notificaciones',
            settings.soundEnabled,
            (value) => setSettings({ ...settings, soundEnabled: value }),
            'volume-2'
          )}

          {renderSettingRow(
            'Vibración',
            'Vibrar para notificaciones importantes',
            settings.vibrationEnabled,
            (value) => setSettings({ ...settings, vibrationEnabled: value }),
            'smartphone'
          )}
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          
          {renderSettingRow(
            'Modo Oscuro',
            'Usar tema oscuro para la interfaz',
            settings.darkMode,
            (value) => setSettings({ ...settings, darkMode: value }),
            'moon'
          )}
        </View>

        {/* Language */}
        {renderSelectionRow(
          'Idioma',
          'Selecciona el idioma de la aplicación',
          languages,
          settings.language,
          (value) => setSettings({ ...settings, language: value }),
          'globe'
        )}

        {/* Data & Sync */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos y Sincronización</Text>
          
          {renderSettingRow(
            'Sincronización Automática',
            'Sincronizar datos automáticamente',
            settings.autoSync,
            (value) => setSettings({ ...settings, autoSync: value }),
            'refresh-cw'
          )}

          {renderSettingRow(
            'Modo Offline',
            'Permitir uso sin conexión a internet',
            settings.offlineMode,
            (value) => setSettings({ ...settings, offlineMode: value }),
            'wifi-off'
          )}
        </View>

        {/* Data Usage */}
        {renderSelectionRow(
          'Uso de Datos',
          'Configura cómo la app usa tu conexión',
          dataUsageOptions,
          settings.dataUsage,
          (value) => setSettings({ ...settings, dataUsage: value }),
          'wifi'
        )}

        {/* Cache Size */}
        {renderSelectionRow(
          'Tamaño de Caché',
          'Cantidad de datos temporales a almacenar',
          cacheSizeOptions,
          settings.cacheSize,
          (value) => setSettings({ ...settings, cacheSize: value }),
          'hard-drive'
        )}

        {/* Storage & Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de Datos</Text>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
            <View style={styles.actionInfo}>
              <Icon name="trash-2" size={20} color={Colors.warning} style={styles.actionIcon} />
              <View>
                <Text style={styles.actionTitle}>Limpiar Caché</Text>
                <Text style={styles.actionDescription}>Liberar espacio eliminando archivos temporales</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textMedium} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
            <View style={styles.actionInfo}>
              <Icon name="download" size={20} color={Colors.primary} style={styles.actionIcon} />
              <View>
                <Text style={styles.actionTitle}>Exportar Datos</Text>
                <Text style={styles.actionDescription}>Crear copia de seguridad de tus datos</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textMedium} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleOpenPermissions}>
            <View style={styles.actionInfo}>
              <Icon name="shield" size={20} color={Colors.success} style={styles.actionIcon} />
              <View>
                <Text style={styles.actionTitle}>Permisos de App</Text>
                <Text style={styles.actionDescription}>Gestionar permisos del sistema</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textMedium} />
          </TouchableOpacity>
        </View>

        {/* Reset Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.error }]}>Restablecer</Text>
          
          <View style={styles.dangerCard}>
            <View style={styles.dangerInfo}>
              <Text style={styles.dangerTitle}>Restablecer Configuración</Text>
              <Text style={styles.dangerDescription}>
                Esto restablecerá todas las configuraciones a sus valores por defecto.
              </Text>
            </View>
            <Button
              title="Restablecer"
              onPress={handleResetSettings}
              style={styles.resetButton}
              textStyle={styles.resetButtonText}
              iconName="rotate-ccw"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Button
          title={loading ? "Guardando..." : "Guardar Configuración"}
          onPress={handleSaveSettings}
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
    marginBottom: Metrics.mediumSpacing,
  },
  sectionDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.mediumSpacing,
    lineHeight: Metrics.baseLineHeight,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Metrics.mediumSpacing,
  },
  settingIcon: {
    marginRight: Metrics.baseSpacing,
  },
  settingTextContainer: {
    flex: 1,
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
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    backgroundColor: Colors.background,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 4,
  },
  selectedOptionTitle: {
    color: Colors.primary,
  },
  optionDescription: {
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Metrics.mediumSpacing,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: Metrics.mediumSpacing,
  },
  actionTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
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
  resetButton: {
    backgroundColor: Colors.error,
    borderWidth: 0,
  },
  resetButtonText: {
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

export default AppSettingsScreen; 