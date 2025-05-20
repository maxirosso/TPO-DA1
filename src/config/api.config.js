import { Platform } from 'react-native';
import { DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Determinar si estamos en un emulador
const isAndroidEmulator = Platform.OS === 'android' && !__DEV__;

// Configurar la URL base de la API dependiendo del entorno
let API_BASE_URL;

// Función para cambiar la URL API en tiempo de ejecución
export const changeApiUrl = async (newUrl) => {
  if (newUrl && newUrl !== API_BASE_URL) {
    API_BASE_URL = newUrl;
    await AsyncStorage.setItem('custom_api_url', newUrl);
    
    // Reiniciar la app en desarrollo (si está disponible)
    if (__DEV__ && DevSettings.reload) {
      DevSettings.reload();
    }
    return true;
  }
  return false;
};

// Función para obtener la URL API guardada
export const getSavedApiUrl = async () => {
  try {
    return await AsyncStorage.getItem('custom_api_url');
  } catch (error) {
    console.error('Error getting saved API URL:', error);
    return null;
  }
};

// Inicialización de la URL API
const initializeApiUrl = async () => {
  // Verificar si hay una URL guardada
  const savedUrl = await getSavedApiUrl();
  
  if (savedUrl) {
    API_BASE_URL = savedUrl;
    return;
  }
  
  // URL predeterminada basada en entorno
  if (__DEV__) {
    if (isAndroidEmulator) {
      // Para emulador Android, usar 10.0.2.2 que redirige a localhost de la máquina host
      API_BASE_URL = 'http://10.0.2.2:8080';
    } else if (Platform.OS === 'ios') {
      // Para iOS simulator, puedes usar localhost
      API_BASE_URL = 'http://localhost:8080';
    } else {
      // Para dispositivo físico Android o cualquier otro caso
      API_BASE_URL = 'http://localhost:8080'; // Usamos localhost como predeterminado, pero probablemente no funcione en dispositivos físicos
    }
  } else {
    // Ambiente de producción
    API_BASE_URL = 'https://tu-dominio-produccion.com/api';
  }
};

// Ejecutar inicialización
initializeApiUrl();

export default {
  API_BASE_URL,
  TIMEOUT: 15000, // Tiempo de espera máximo para las solicitudes en ms
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}; 