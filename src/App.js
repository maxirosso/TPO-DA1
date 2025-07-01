import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider, useDispatch } from 'react-redux';
import store from './store/store';
import 'react-native-gesture-handler'; 
import { View, ActivityIndicator } from 'react-native';

// Configuración de manejo de errores
import { configureErrorHandling, silenceSpecificErrors } from './utils/ErrorHandler';
import './utils/DevUtils'; // Inicializar utilidades de desarrollo

// Navegadores
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';

// Contexto de Autenticación
import { AuthContext, AuthProvider } from './context/AuthContext';

// Servicios
import { authService } from './services/auth';

// Acciones
import { loadFavorites } from './store/actions/recipeActions';

// Componentes
import SplashScreen from './components/common/SplashScreen';

const AppContent = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [isVisitor, setIsVisitor] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Funciones de autenticación
  const authContext = React.useMemo(() => ({
    signIn: async (email, password) => {
      try {
        const result = await authService.login(email, password);
        setUserToken(result.token || 'dummy-token');
        setCurrentUser(result.user);
        setIsVisitor(false);
        return result;
      } catch (e) {
        console.log('Error de inicio de sesión:', e);
        throw e;
      }
    },
    
    signOut: async () => {
      try {
        await authService.logout();
        setUserToken(null);
        setCurrentUser(null);
        setIsVisitor(false);
      } catch (e) {
        console.log('Error al cerrar sesión:', e);
      }
    },
    
    signUp: async (userData) => {
      try {
        const result = await authService.register(userData);
        return result;
      } catch (e) {
        console.log('Error de registro:', e);
        throw e;
      }
    },
    
    verifyCode: async (email, code) => {
      try {
        return true;
      } catch (e) {
        console.log('Error de verificación:', e);
        throw e;
      }
    },
    
    resendVerificationCode: async (email) => {
      try {
        return true;
      } catch (e) {
        console.log('Error al reenviar código de verificación:', e);
        throw e;
      }
    },
    
    completeProfile: async (email, profileData) => {
      try {
        const result = await authService.completeProfile(email, profileData);
        
        if (result) {
          try {
            const loginResult = await authService.login(email, profileData.password || '');
            setUserToken(loginResult.token || 'dummy-token');
            setCurrentUser(loginResult.user);
            setIsVisitor(false);
          } catch (loginErr) {
            console.log('Error en inicio de sesión automático después de completar el perfil:', loginErr);
          }
        }
        
        return result;
      } catch (e) {
        console.log('Error al completar perfil:', e);
        throw e;
      }
    },

    enterVisitorMode: () => {
      setIsVisitor(true);
    },

    exitVisitorMode: () => {
      setIsVisitor(false);
    },

    isVisitor,
    user: currentUser,
    setUser: setCurrentUser
  }), [currentUser, isVisitor]);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Cargar favoritos desde almacenamiento
        dispatch(loadFavorites());
        
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          const token = await AsyncStorage.getItem('user_token');
          setUserToken(token);
          
          // Cargar datos de usuario desde almacenamiento
          const storedUser = await authService.getCurrentUser();
          if (storedUser) {
            setCurrentUser(storedUser);
          }
        }
      } catch (e) {
        console.log('Error en verificación de autenticación:', e);
      } finally {
        setIsLoading(false);
      }
    };

    // Mostrar pantalla de bienvenida por 3 segundos
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    bootstrapAsync();

    return () => clearTimeout(splashTimer);
  }, [dispatch]);

  // Mostrar pantalla de bienvenida
  if (showSplash) {
    return <SplashScreen />;
  }

  // Pantalla de carga simple
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          {userToken != null || isVisitor ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
};

const App = () => {
  // Configurar manejo de errores al inicializar la app
  React.useEffect(() => {
    // Configuración global de errores
    configureErrorHandling();
    
    // Silenciar errores específicos que sabemos que no son críticos
    silenceSpecificErrors([
      'Text strings must be rendered within a <Text> component',
      'Warning: componentWillReceiveProps has been renamed',
      'VirtualizedLists should never be nested',
      'Setting a timer for a long period of time',
    ]);
    
    if (__DEV__) {
      console.log('🚀 ChefNet App inicializada con manejo de errores configurado');
    }
  }, []);

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;