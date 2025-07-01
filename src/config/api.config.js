import { Platform } from 'react-native';
import { DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set API_BASE_URL for emulator/dev environments
let API_BASE_URL = 'http://localhost:8080';
if (Platform.OS === 'android') {
  API_BASE_URL = 'http://10.0.2.2:8080';
}

// Configuración de la API
const apiConfig = {
  get API_BASE_URL() {
    return API_BASE_URL;
  },
  TIMEOUT: 30000, // Tiempo de espera máximo para las solicitudes en ms (aumentado de 15000 a 30000)
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

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
export const initializeApiUrl = async () => {
  // Verificar si hay una URL guardada
  const savedUrl = await getSavedApiUrl();
  
  if (savedUrl) {
    API_BASE_URL = savedUrl;
    return;
  }
  
  // URL predeterminada basada en entorno
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Para emulador Android, usar 10.0.2.2 que redirige a localhost de la máquina host
      API_BASE_URL = 'http://10.0.2.2:8080';
      await AsyncStorage.setItem('custom_api_url', 'http://10.0.2.2:8080');
      return;
    } else if (Platform.OS === 'ios') {
      API_BASE_URL = 'http://localhost:8080';
      await AsyncStorage.setItem('custom_api_url', 'http://localhost:8080');
      return;
    } else {
      API_BASE_URL = 'http://localhost:8080';
      await AsyncStorage.setItem('custom_api_url', 'http://localhost:8080');
      return;
    }
  } else {
    API_BASE_URL = 'https://tu-dominio-produccion.com/api';
  }
};

// Ejecutar inicialización
(async () => {
  await initializeApiUrl();
})();

export default apiConfig;