import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import store from './store/store';
import 'react-native-gesture-handler'; // Add this import for React Navigation
import { View, ActivityIndicator } from 'react-native';

// Navigators
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';

// Authentication Context
import { AuthContext } from './context/AuthContext';

// Services
import { authService } from './services/auth';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Authentication functions
  const authContext = React.useMemo(() => ({
    signIn: async (email, password) => {
      try {
        // Use the auth service instead of directly working with AsyncStorage
        const result = await authService.login(email, password);
        setUserToken(result.token);
        return result;
      } catch (e) {
        console.log('Sign in error:', e);
        throw e;
      }
    },
    
    signOut: async () => {
      try {
        await authService.logout();
        setUserToken(null);
      } catch (e) {
        console.log('Sign out error:', e);
      }
    },
    
    signUp: async (userData) => {
      try {
        // Use the auth service for registration
        const result = await authService.register(userData);
        setUserToken(result.token);
        return result;
      } catch (e) {
        console.log('Sign up error:', e);
        throw e;
      }
    },
  }), []);

  useEffect(() => {
    // Check if user is already logged in
    const bootstrapAsync = async () => {
      setIsLoading(true);
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          const token = await AsyncStorage.getItem('user_token');
          setUserToken(token);
        }
      } catch (e) {
        console.log('Authentication check error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Simple loading screen
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
    <Provider store={store}>
      <AuthContext.Provider value={authContext}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {userToken == null ? <AuthNavigator /> : <AppNavigator />}
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthContext.Provider>
    </Provider>
  );
};

export default App;