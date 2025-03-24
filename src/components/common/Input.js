import React, { forwardRef } from 'react';
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

// Using forwardRef for proper ref passing
const Input = forwardRef((props, ref) => {
  const {
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
  } = props;

  // Simplifying security toggle for troubleshooting
  const renderRightIcon = () => {
    if (rightComponent) {
      return rightComponent;
    }
    
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
          (rightIcon || rightComponent) && styles.withRightIcon,
          error && styles.errorInput,
          !editable && styles.disabledInput,
          multiline && styles.multilineInput,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Icon name={leftIcon} size={20} color={Colors.textMedium} />
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={[
            styles.input,
            multiline && { height: numberOfLines * 20 },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          onBlur={onBlur}
          onFocus={onFocus}
          // Ensuring these key keyboard properties are set
          autoCorrect={false}
          spellCheck={false}
          caretHidden={false}
          contextMenuHidden={false}
          selectTextOnFocus={false}
          // Providing default keyboard behavior
          returnKeyType={rest.returnKeyType || "next"}
          blurOnSubmit={rest.blurOnSubmit || false}
          // Debug trace helpers (uncomment these if needed to debug)
          // onKeyPress={(e) => console.log('Key pressed:', e.nativeEvent.key)}
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
});

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
    // Ensuring no competing padding issues
    paddingTop: 0,
    paddingBottom: 0,
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

// Set display name for debugging purposes
Input.displayName = 'Input';

export default Input;