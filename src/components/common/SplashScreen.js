import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4ECDC4" barStyle="light-content" />
      <View style={styles.content}>
        {/* Chef Hat Icon */}
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/images/chef_hat.png')}
            style={styles.chefHatImage}
            resizeMode="contain"
          />
        </View>
        
        {/* App Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>ChefNet</Text>
        </View>
        
        {/* Loading Spinner */}
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4ECDC4',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  chefHatImage: {
    width: 120,
    height: 120,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  spinnerContainer: {
    marginBottom: 60,
  },
});

export default SplashScreen; 