import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const VerificationScreen = ({ navigation, route }) => {
  const { email = 'example@email.com' } = route.params || {};
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleCodeChange = (text, index) => {
    // Update the code digits
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);
    
    // Auto-focus next input if current input is filled
    if (text && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };
  
  const handleKeyPress = (e, index) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };
  
  const handleVerify = () => {
    const code = verificationCode.join('');
    if (code.length !== 4) {
      // Add validation feedback
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('CompleteProfile');
    }, 1500);
  };
  
  const handleResendCode = () => {
    // Implement resend code logic
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
            <Text style={styles.headerTitle}>Verify Email</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Icon name="check" size={40} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Registration Successful!</Text>
            <Text style={styles.successMessage}>We've sent a verification code to</Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.codeInfo}>
              Please enter the 4-digit code to complete your registration. This code is valid for 24 hours.
            </Text>
          </View>
          
          <View style={styles.codeInputContainer}>
            {verificationCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={styles.codeInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0}
              />
            ))}
          </View>
          
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive a code?</Text>
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendButton}>Resend</Text>
            </TouchableOpacity>
          </View>
          
          <Button
            title="Verify and Continue"
            onPress={handleVerify}
            fullWidth
            style={styles.verifyButton}
            isLoading={isLoading}
          />
          
          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>
              Having trouble? <Text style={styles.supportLink}>Contact Support</Text>
            </Text>
          </View>
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.expirationText}>
            Your verification code will expire in{' '}
            <Text style={styles.expirationTime}>{formatTimeLeft()}</Text>
          </Text>
        </View>
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
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: Metrics.largeSpacing,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success + '20', // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  successTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.smallSpacing,
    textAlign: 'center',
  },
  emailText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
  },
  codeInfo: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    paddingHorizontal: Metrics.mediumSpacing,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.mediumBorderRadius,
    backgroundColor: Colors.gradientStart,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: Metrics.baseSpacing / 2,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Metrics.xLargeSpacing,
  },
  resendText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  resendButton: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: Metrics.smallSpacing,
  },
  verifyButton: {
    marginBottom: Metrics.mediumSpacing,
  },
  supportContainer: {
    alignItems: 'center',
  },
  supportText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  supportLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Metrics.mediumSpacing,
    alignItems: 'center',
  },
  expirationText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  expirationTime: {
    fontWeight: '500',
    color: Colors.textDark,
  },
});

export default VerificationScreen;