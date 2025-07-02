import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default {
  screenWidth: width,
  screenHeight: height,
  
  baseSpacing: 8,
  smallSpacing: 4,
  mediumSpacing: 16,
  largeSpacing: 24,
  xLargeSpacing: 32,
  xxLargeSpacing: 40,
  
  basePadding: 8,
  smallPadding: 4,
  mediumPadding: 16,
  largePadding: 24,
  xLargePadding: 32,
  
  
  baseMargin: 8,
  smallMargin: 4,
  mediumMargin: 16,
  largeMargin: 24,
  xLargeMargin: 32,
  

  baseBorderRadius: 8,
  smallBorderRadius: 4,
  mediumBorderRadius: 12,
  largeBorderRadius: 16,
  xLargeBorderRadius: 24,
  xxLargeBorderRadius: 32,
  roundedFull: 9999,
  
  
  xSmallFontSize: 10,
  smallFontSize: 12,
  baseFontSize: 14,
  mediumFontSize: 16,
  largeFontSize: 18,
  xLargeFontSize: 20,
  xxLargeFontSize: 24,
  xxxLargeFontSize: 32,
  
  
  smallLineHeight: 16,
  baseLineHeight: 20,
  mediumLineHeight: 24,
  largeLineHeight: 28,
  xLargeLineHeight: 32,
  xxLargeLineHeight: 36,
  xxxLargeLineHeight: 40,
  
  
  smallIconSize: 16,
  baseIconSize: 20,
  mediumIconSize: 24,
  largeIconSize: 32,
  
  
  tabBarHeight: 60,
  headerHeight: 56,
  buttonHeight: 48,
  inputHeight: 48,
  cardWidth: (width - 48) / 2, 
};