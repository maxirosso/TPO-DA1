import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { changeApiUrl, getSavedApiUrl } from '../../config/api.config';
import axios from 'axios';
import apiConfig from '../../config/api.config';

const ServerConfigScreen = ({ navigation }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState({ status: '', message: '' });
  
  useEffect(() => {
    const loadSavedUrl = async () => {
      const url = await getSavedApiUrl();
      if (url) {
        setSavedUrl(url);
        setApiUrl(url);
      }
    };
    
    loadSavedUrl();
  }, []);
  
  const testConnection = async () => {
    if (!apiUrl) {
      Alert.alert('Error', 'Por favor ingresa una URL de API');
      return;
    }
    
    setIsLoading(true);
    setTestResult({ status: '', message: '' });
    
    try {
      // Intentar hacer una petición simple
      const response = await axios.get(`${apiUrl}/getAllRecetas`, { timeout: 5000 });
      
      if (response.status === 200) {
        setTestResult({ 
          status: 'success', 
          message: '¡Conexión exitosa! El servidor está respondiendo correctamente.' 
        });
      } else {
        setTestResult({ 
          status: 'warning', 
          message: `El servidor respondió con código: ${response.status}` 
        });
      }
    } catch (error) {
      console.error('Error testing API connection:', error);
      setTestResult({ 
        status: 'error', 
        message: `Error: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveApiUrl = async () => {
    if (!apiUrl) {
      Alert.alert('Error', 'Por favor ingresa una URL de API');
      return;
    }
    
    try {
      await changeApiUrl(apiUrl);
      setSavedUrl(apiUrl);
      Alert.alert('Éxito', 'La URL de la API ha sido guardada. La aplicación se reiniciará para aplicar los cambios.');
    } catch (error) {
      console.error('Error saving API URL:', error);
      Alert.alert('Error', 'No se pudo guardar la URL de la API');
    }
  };
  
  const getLocalIpSuggestions = () => {
    const suggestions = [
      apiConfig.API_BASE_URL,
      'http://10.0.2.2:8080', // Para emulador Android
      'http://127.0.0.1:8080'
    ];
    
    // Generar algunas IPs comunes de red local
    for (let i = 1; i <= 10; i++) {
      suggestions.push(`http://192.168.1.${i}:8080`);
    }
    
    return suggestions;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Configuración del Servidor</Text>
          
          {savedUrl ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>URL actual:</Text>
              <Text style={styles.infoValue}>{savedUrl}</Text>
            </View>
          ) : null}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>URL del servidor API:</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="Ej: http://192.168.1.5:8080"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.testButton]}
              onPress={testConnection}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Probar Conexión</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={saveApiUrl}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          {testResult.status ? (
            <View style={[
              styles.resultBox,
              testResult.status === 'success' && styles.successBox,
              testResult.status === 'error' && styles.errorBox,
              testResult.status === 'warning' && styles.warningBox
            ]}>
              <Text style={styles.resultText}>{testResult.message}</Text>
            </View>
          ) : null}
          
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Sugerencias comunes:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
            >
              {getLocalIpSuggestions().map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => setApiUrl(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Información útil:</Text>
            <Text style={styles.infoText}>
              • Para emuladores Android: usa <Text style={styles.code}>http://10.0.2.2:8080</Text>
            </Text>
            <Text style={styles.infoText}>
              • Para simulador iOS: usa <Text style={styles.code}>http://localhost:8080</Text>
            </Text>
            <Text style={styles.infoText}>
              • Para dispositivos físicos: usa la dirección IP de tu computadora en tu red local
            </Text>
            <Text style={styles.infoText}>
              • Para encontrar tu IP en Windows: ejecuta <Text style={styles.code}>ipconfig</Text> en cmd
            </Text>
            <Text style={styles.infoText}>
              • Para encontrar tu IP en Mac/Linux: ejecuta <Text style={styles.code}>ifconfig</Text> en terminal
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center'
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginRight: 5,
  },
  infoValue: {
    fontSize: 14,
    color: '#0d47a1',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#4f46e5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  suggestionsList: {
    paddingBottom: 10,
  },
  suggestionChip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#4b5563',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
});

export default ServerConfigScreen; 