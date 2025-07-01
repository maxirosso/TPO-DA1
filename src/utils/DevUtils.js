import { enableAllLogs, silenceSpecificErrors } from './ErrorHandler';

// Utilidades para desarrollo y debugging
export class DevUtils {
  
  // Habilitar todos los logs para debugging intensivo
  static enableDebugging() {
    if (__DEV__) {
      enableAllLogs();
      console.log('🔍 Modo debugging habilitado - Todos los logs visibles');
      
      // Mostrar información del dispositivo y entorno
      console.log('📱 Información del entorno:');
      console.log('- Modo desarrollo:', __DEV__);
      console.log('- Plataforma:', require('react-native').Platform.OS);
      console.log('- Versión:', require('react-native').Platform.Version);
    }
  }
  
  // Silenciar solo errores específicos pero mantener otros visibles
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
      console.log('🔇 Errores no críticos silenciados para mejor experiencia de desarrollo');
    }
  }
  
  // Mostrar solo errores de red y conexión
  static showOnlyNetworkErrors() {
    if (__DEV__) {
      silenceSpecificErrors([
        'Text strings must be rendered within a <Text> component',
        'VirtualizedLists should never be nested',
        'Warning:',
        'Require cycle:',
        'Setting a timer',
      ]);
      console.log('🌐 Mostrando solo errores de red y conexión');
    }
  }
  
  // Información de performance para debugging
  static enablePerformanceLogging() {
    if (__DEV__) {
      const originalRender = console.time;
      console.log('⚡ Logging de performance habilitado');
      
      // Agregar métricas básicas de performance
      this.logMemoryUsage();
    }
  }
  
  // Mostrar uso de memoria (solo en desarrollo)
  static logMemoryUsage() {
    if (__DEV__ && global.performance && global.performance.memory) {
      const memory = global.performance.memory;
      console.log('💾 Memoria:', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
      });
    }
  }
  
  // Toggle rápido para cambiar entre modos de logging
  static toggleErrorMode(mode = 'balanced') {
    if (!__DEV__) {
      console.log('❌ Solo disponible en modo desarrollo');
      return;
    }
    
    switch (mode) {
      case 'silent':
        silenceSpecificErrors(['.*']); // Silenciar casi todo
        console.log('🔇 Modo silencioso activado');
        break;
        
      case 'balanced':
        this.silenceNonCriticalErrors();
        console.log('⚖️ Modo balanceado activado');
        break;
        
      case 'verbose':
        enableAllLogs();
        console.log('📢 Modo verboso activado');
        break;
        
      case 'network-only':
        this.showOnlyNetworkErrors();
        break;
        
      default:
        console.log('Modos disponibles: silent, balanced, verbose, network-only');
    }
  }
}

// Función global para debugging rápido desde la consola
global.DevUtils = DevUtils;

// En desarrollo, añadir atajos globales para debugging
if (__DEV__) {
  global.enableDebug = () => DevUtils.enableDebugging();
  global.silenceErrors = () => DevUtils.silenceNonCriticalErrors();
  global.toggleErrors = (mode) => DevUtils.toggleErrorMode(mode);
  global.memoryInfo = () => DevUtils.logMemoryUsage();
  
  console.log('🛠️ Utilidades de desarrollo disponibles:');
  console.log('- enableDebug() - Habilitar todos los logs');
  console.log('- silenceErrors() - Silenciar errores no críticos');  
  console.log('- toggleErrors("mode") - Cambiar modo de errores');
  console.log('- memoryInfo() - Mostrar uso de memoria');
} 