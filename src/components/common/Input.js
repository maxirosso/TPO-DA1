import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  labelStyle,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  onBlur,
  onFocus,
  rightComponent,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const toggleSecureEntry = () => {
    setIsSecureVisible(!isSecureVisible);
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <View style={styles.leftIconContainer}>
        <Icon name={leftIcon} size={20} color={Colors.textMedium} />
      </View>
    );
  };

  const renderRightIcon = () => {
    // For custom right component (like a "forgot password" link)
    if (rightComponent) {
      return rightComponent;
    }
    
    // For password visibility toggle
    if (secureTextEntry) {
      return (
        <TouchableOpacity 
          style={styles.rightIconContainer} 
          onPress={toggleSecureEntry}
        >
          <Icon 
            name={isSecureVisible ? 'eye-off' : 'eye'} 
            size={20} 
            color={Colors.textMedium} 
          />
        </TouchableOpacity>
      );
    }

    // For custom right icon
    if (!rightIcon) return null;

    return (
      <TouchableOpacity 
        style={styles.rightIconContainer} 
        onPress={onRightIconPress}
        disabled={!onRightIconPress}
      >
        <Icon name={rightIcon} size={20} color={Colors.textMedium} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      
      <View 
        style={[
          styles.inputContainer,
          leftIcon && styles.withLeftIcon,
          (rightIcon || secureTextEntry || rightComponent) && styles.withRightIcon,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
          !editable && styles.disabledInput,
          multiline && styles.multilineInput,
        ]}
      >
        {renderLeftIcon()}
        
        <TextInput
          style={[
            styles.input,
            multiline && { height: numberOfLines * 20 },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        
        {renderRightIcon()}
      </View>
      
      {(error || helper) && (
        <Text 
          style={[
            styles.helperText, 
            error && styles.errorText
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Metrics.mediumSpacing,
  },
  label: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.largeBorderRadius,
    backgroundColor: Colors.gradientStart,
    paddingHorizontal: Metrics.mediumSpacing,
    height: Metrics.inputHeight,
  },
  withLeftIcon: {
    paddingLeft: Metrics.baseSpacing,
  },
  withRightIcon: {
    paddingRight: Metrics.baseSpacing,
  },
  focusedInput: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorInput: {
    borderColor: Colors.error,
  },
  disabledInput: {
    backgroundColor: Colors.background,
    opacity: 0.8,
  },
  multilineInput: {
    height: 'auto',
    paddingTop: Metrics.mediumSpacing,
    paddingBottom: Metrics.mediumSpacing,
  },
  input: {
    flex: 1,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    paddingVertical: Metrics.baseSpacing,
  },
  leftIconContainer: {
    marginRight: Metrics.baseSpacing,
  },
  rightIconContainer: {
    marginLeft: Metrics.baseSpacing,
    padding: Metrics.smallSpacing,
  },
  helperText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginTop: Metrics.smallSpacing,
  },
  errorText: {
    color: Colors.error,
  },
});

export default Input;