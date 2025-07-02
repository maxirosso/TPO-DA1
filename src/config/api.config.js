import { Platform } from 'react-native';
import { DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Aca setear la API_BASE_URL para el emulador 
let API_BASE_URL = 'http://localhost:8080';
if (Platform.OS === 'android') {
  API_BASE_URL = 'http://10.0.2.2:8080';
}

const apiConfig = {
  get API_BASE_URL() {
    return API_BASE_URL;
  },
  TIMEOUT: 30000, 
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export const changeApiUrl = async (newUrl) => {
  if (newUrl && newUrl !== API_BASE_URL) {
    API_BASE_URL = newUrl;
    await AsyncStorage.setItem('custom_api_url', newUrl);

    if (__DEV__ && DevSettings.reload) {
      DevSettings.reload();
    }
    return true;
  }
  return false;
};

export const getSavedApiUrl = async () => {
  try {
    return await AsyncStorage.getItem('custom_api_url');
  } catch (error) {
    console.error('Error al obtener la API URL guardada:', error);
    return null;
  }
};

export const initializeApiUrl = async () => {
  const savedUrl = await getSavedApiUrl();

  if (savedUrl) {
    API_BASE_URL = savedUrl;
    return;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
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

(async () => {
  await initializeApiUrl();
})();

export default apiConfig;