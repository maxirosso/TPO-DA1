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
import { AuthContext, AuthProvider } from './context/AuthContext';

// Services
import { authService } from './services/auth';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [isVisitor, setIsVisitor] = useState(false);

  // Authentication functions
  const authContext = React.useMemo(() => ({
    signIn: async (email, password) => {
      try {
        const result = await authService.login(email, password);
        setUserToken(result.token);
        setIsVisitor(false);
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
        setIsVisitor(false);
      } catch (e) {
        console.log('Sign out error:', e);
      }
    },
    
    signUp: async (userData) => {
      try {
        const result = await authService.register(userData);
        return result;
      } catch (e) {
        console.log('Sign up error:', e);
        throw e;
      }
    },
    
    verifyCode: async (email, code) => {
      try {
        return true;
      } catch (e) {
        console.log('Verification error:', e);
        throw e;
      }
    },
    
    resendVerificationCode: async (email) => {
      try {
        return true;
      } catch (e) {
        console.log('Resend verification error:', e);
        throw e;
      }
    },
    
    completeProfile: async (email, profileData) => {
      try {
        const result = await authService.completeProfile(email, profileData);
        
        if (result) {
          try {
            const loginResult = await authService.login(email, profileData.password || '');
            setUserToken(loginResult.token);
            setIsVisitor(false);
          } catch (loginErr) {
            console.log('Auto login after profile completion failed:', loginErr);
          }
        }
        
        return result;
      } catch (e) {
        console.log('Complete profile error:', e);
        throw e;
      }
    },

    enterVisitorMode: () => {
      setIsVisitor(true);
    },

    exitVisitorMode: () => {
      setIsVisitor(false);
    }
  }), []);

  useEffect(() => {
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
            {userToken != null || isVisitor ? <AppNavigator /> : <AuthNavigator />}
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthContext.Provider>
    </Provider>
  );
};

export default App;