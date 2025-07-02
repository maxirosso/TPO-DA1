import { LogBox } from 'react-native';


export const configureErrorHandling = () => {
  
  if (!__DEV__) {
   
    console.disableYellowBox = true;
    
    
    LogBox.ignoreAllLogs(true);
    
    
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args) => {
      
      const errorMessage = args.join(' ');
      
      
      if (errorMessage.includes('Network') || 
          errorMessage.includes('fetch') || 
          errorMessage.includes('HTTP')) {
        originalConsoleError(...args);
      }
      
    };
    
    console.warn = (...args) => {
      
      const warningMessage = args.join(' ');
      
      
      if (warningMessage.includes('deprecated') || 
          warningMessage.includes('security')) {
        originalConsoleWarn(...args);
      }
      
    };
    
    
    const defaultHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      
      if (isFatal) {
        
        console.log('Error fatal detectado - la aplicación se reiniciará');
      }
      
      
      defaultHandler(error, isFatal);
    });
  } else {
    
    console.log('Modo desarrollo: Todos los errores y warnings están habilitados');
    
    LogBox.ignoreLogs([ ]);
  }
};


export const enableAllLogs = () => {
  if (__DEV__) {
    LogBox.ignoreAllLogs(false);
    console.log('Todos los logs están habilitados para debugging');
  }
};


export const silenceSpecificErrors = (patterns) => {
  if (Array.isArray(patterns)) {
    LogBox.ignoreLogs(patterns);
    if (__DEV__) {
      console.log('Errores específicos silenciados:', patterns);
    }
  }
}; 
