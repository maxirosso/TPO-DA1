import { LogBox } from 'react-native';

// Configuración para ocultar errores a usuarios finales pero mantenerlos en desarrollo
export const configureErrorHandling = () => {
  // En producción, ocultar todos los warnings y errores que no sean críticos
  if (!__DEV__) {
    // Ocultar la consola de errores de React Native para usuarios finales
    console.disableYellowBox = true;
    
    // Suprimir logs específicos que no son críticos para el usuario final
    LogBox.ignoreAllLogs(true);
    
    // Override console methods para producción
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args) => {
      // En producción, no mostrar errores en pantalla pero aún logearlos para debugging remoto
      const errorMessage = args.join(' ');
      
      // Solo logeamos errores críticos que podrían afectar la funcionalidad
      if (errorMessage.includes('Network') || 
          errorMessage.includes('fetch') || 
          errorMessage.includes('HTTP')) {
        originalConsoleError(...args);
      }
      // Otros errores se silencian para el usuario final
    };
    
    console.warn = (...args) => {
      // En producción, silenciar warnings que no son críticos
      const warningMessage = args.join(' ');
      
      // Solo mostrar warnings críticos
      if (warningMessage.includes('deprecated') || 
          warningMessage.includes('security')) {
        originalConsoleWarn(...args);
      }
      // Otros warnings se silencian
    };
    
    // Handler global para errores no capturados
    const defaultHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      // En producción, manejar errores silenciosamente
      if (isFatal) {
        // Solo para errores fatales, mostrar mensaje genérico
        console.log('Error fatal detectado - la aplicación se reiniciará');
      }
      
      // Llamar al handler por defecto para que la app no se cuelgue
      defaultHandler(error, isFatal);
    });
  } else {
    // En desarrollo, mantener todos los errores y warnings visibles
    console.log('🔧 Modo desarrollo: Todos los errores y warnings están habilitados');
    
    // Opcionalmente, puedes silenciar warnings específicos que sepas que no son importantes
    LogBox.ignoreLogs([
      // Puedes agregar aquí warnings específicos que quieras ignorar incluso en desarrollo
      // 'Warning: componentWillReceiveProps has been renamed',
    ]);
  }
};

// Función para restaurar el comportamiento normal de console (útil para debugging)
export const enableAllLogs = () => {
  if (__DEV__) {
    LogBox.ignoreAllLogs(false);
    console.log('✅ Todos los logs están habilitados para debugging');
  }
};

// Función para silenciar logs específicos por patrón
export const silenceSpecificErrors = (patterns) => {
  if (Array.isArray(patterns)) {
    LogBox.ignoreLogs(patterns);
    if (__DEV__) {
      console.log('🔇 Errores específicos silenciados:', patterns);
    }
  }
}; 