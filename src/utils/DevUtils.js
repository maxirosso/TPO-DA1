import { enableAllLogs, silenceSpecificErrors } from './ErrorHandler';

// Utilidades para desarrollo y debugging
export class DevUtils {
  

  static enableDebugging() {
    if (__DEV__) {
      enableAllLogs();
      

      // Mostrar información del dispositivo y entorno
      console.log('Información del entorno:');
      console.log('Modo desarrollo:', __DEV__);
      console.log('Plataforma:', require('react-native').Platform.OS);
      console.log('Versión:', require('react-native').Platform.Version);
    }
  }
  

  static silenceNonCriticalErrors() {
    if (__DEV__) {
      silenceSpecificErrors([
        'Text strings must be rendered within a <Text> component',
        'VirtualizedLists should never be nested',
        'Warning: componentWillReceiveProps has been renamed',
        'Warning: componentWillMount has been renamed',
        'Warning: componentWillReceiveProps is deprecated',
        'Require cycle:',
        'Setting a timer for a long period of time',
        'Non-serializable values were found in the navigation state',
      ]);
      
    }
  }
  

  static showOnlyNetworkErrors() {
    if (__DEV__) {
      silenceSpecificErrors([
        'Text strings must be rendered within a <Text> component',
        'VirtualizedLists should never be nested',
        'Warning:',
        'Require cycle:',
        'Setting a timer',
      ]);
      
    }
  }
  
 
  static enablePerformanceLogging() {
    if (__DEV__) {
      const originalRender = console.time;
      console.log('Logging de performance habilitado');
      this.logMemoryUsage();
    }
  }
  
  
  static logMemoryUsage() {
    if (__DEV__ && global.performance && global.performance.memory) {
      const memory = global.performance.memory;
      console.log('Memoria:', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
      });
    }
  }
 

  static toggleErrorMode(mode = 'balanced') {
    if (!__DEV__) {
      console.log('Solo disponible en modo desarrollo');
      return;
    }
    
    switch (mode) {
      case 'silent':
        silenceSpecificErrors(['.*']); // Silenciar casi todo
        console.log('Modo silencioso activado');
        break;
        
      case 'balanced':
        this.silenceNonCriticalErrors();
        console.log('Modo balanceado activado');
        break;
        
      case 'verbose':
        enableAllLogs();
        console.log('Modo verboso activado');
        break;
        
      case 'network-only':
        this.showOnlyNetworkErrors();
        break;
        
      default:
        console.log('Modos disponibles: silent, balanced, verbose, network-only');
    }
  }
}


global.DevUtils = DevUtils;


if (__DEV__) {
  global.enableDebug = () => DevUtils.enableDebugging();
  global.silenceErrors = () => DevUtils.silenceNonCriticalErrors();
  global.toggleErrors = (mode) => DevUtils.toggleErrorMode(mode);
  global.memoryInfo = () => DevUtils.logMemoryUsage();
  
  console.log(' Utilidades de desarrollo disponibles:');
  console.log('- enableDebug() - Habilitar todos los logs');
  console.log('- silenceErrors() - Silenciar errores no críticos');  
  console.log('- toggleErrors("mode") - Cambiar modo de errores');
  console.log('- memoryInfo() - Mostrar uso de memoria');
} 
