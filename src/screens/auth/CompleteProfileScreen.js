import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const CompleteProfileScreen = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCompleteProfile = () => {
    if (!name || !password || password !== confirmPassword) {
      // Add validation feedback
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }, 1500);
  };
  
  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
            <Text style={styles.headerTitle}>Complete Profile</Text>
          </View>
        </LinearGradient>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '66%' }]} />
            </View>
            <Text style={styles.progressText}>Step 2/3</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              leftIcon="user"
            />
            
            <Input
              label="Create Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 8 characters"
              secureTextEntry
              leftIcon="lock"
            />
            
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              leftIcon="lock"
            />
            
            <Input
              label="Phone Number (Optional)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1 (___) ___-____"
              keyboardType="phone-pad"
              leftIcon="phone"
            />
            
            <Button
              title="Complete Registration"
              onPress={handleCompleteProfile}
              fullWidth
              style={styles.completeButton}
              isLoading={isLoading}
            />
          </View>
          
          <TouchableOpacity
            style={styles.skipContainer}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>Skip for now</Text>
            <Text style={styles.skipSubtext}>
              You can complete your profile later
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Metrics.mediumSpacing,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.largeSpacing,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: Metrics.roundedFull,
    overflow: 'hidden',
    marginRight: Metrics.baseSpacing,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Metrics.roundedFull,
  },
  progressText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  formContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  completeButton: {
    marginTop: Metrics.mediumSpacing,
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: Metrics.mediumSpacing,
  },
  skipText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: Metrics.smallSpacing,
  },
  skipSubtext: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
});

export default CompleteProfileScreen;