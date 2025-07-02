import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View 
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const Button = ({
  title,
  onPress,
  type = 'primary', 
  size = 'medium', 
  iconName,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  
  const getButtonStyles = () => {
    let buttonStyles = [styles.button];
    
    if (type === 'primary') {
      buttonStyles.push(styles.primaryButton);
    } else if (type === 'secondary') {
      buttonStyles.push(styles.secondaryButton);
    } else if (type === 'outline') {
      buttonStyles.push(styles.outlineButton);
    }
    
    if (size === 'small') {
      buttonStyles.push(styles.smallButton);
    } else if (size === 'large') {
      buttonStyles.push(styles.largeButton);
    }
    
    if (fullWidth) {
      buttonStyles.push(styles.fullWidth);
    }
    
    if (disabled || isLoading) {
      buttonStyles.push(styles.disabledButton);
    }
    
    return buttonStyles;
  };
  
  const getTextStyles = () => {
    let textStyles = [styles.text];
    
    if (type === 'primary' || type === 'secondary') {
      textStyles.push(styles.primaryText);
    } else if (type === 'outline') {
      textStyles.push(styles.outlineText);
    }
    
    if (size === 'small') {
      textStyles.push(styles.smallText);
    } else if (size === 'large') {
      textStyles.push(styles.largeText);
    }
    
    if (disabled) {
      textStyles.push(styles.disabledText);
    }
    
    return textStyles;
  };
  
  const renderIcon = () => {
    if (!iconName) return null;
    
    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    const iconColor = type === 'outline' ? Colors.primary : Colors.card;
    
    return (
      <Icon 
        name={iconName} 
        size={iconSize} 
        color={disabled ? Colors.textLight : iconColor} 
        style={[
          iconPosition === 'left' ? styles.leftIcon : styles.rightIcon
        ]} 
      />
    );
  };
  
  return (
    <TouchableOpacity
      style={[...getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={type === 'outline' ? Colors.primary : Colors.card} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {iconPosition === 'left' && renderIcon()}
          <Text style={[...getTextStyles(), textStyle]}>{title}</Text>
          {iconPosition === 'right' && renderIcon()}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Metrics.largeBorderRadius,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.largeSpacing,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  outlineButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smallButton: {
    paddingVertical: Metrics.smallSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  largeButton: {
    paddingVertical: Metrics.mediumSpacing,
    paddingHorizontal: Metrics.xLargeSpacing,
  },
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.card,
  },
  outlineText: {
    color: Colors.primary,
  },
  smallText: {
    fontSize: Metrics.smallFontSize,
  },
  largeText: {
    fontSize: Metrics.mediumFontSize,
  },
  disabledText: {
    color: Colors.textLight,
  },
  leftIcon: {
    marginRight: Metrics.baseSpacing,
  },
  rightIcon: {
    marginLeft: Metrics.baseSpacing,
  },
});

export default Button;

