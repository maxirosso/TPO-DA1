import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'react-native-image-picker';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { api } from '../../services/api';
import { validarDatosRegistroEstudiante } from '../../utils/validaciones';

const PantallaRegistroEstudiante = ({ navigation, route }) => {
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [dniFrente, setDniFrente] = useState(null);
  const [dniReverso, setDniReverso] = useState(null);
  const [pasoActual, setPasoActual] = useState(1);
  const [tramite, setTramite] = useState('');
  
  const correo = route?.params?.email || '';
  const [idUsuario, setIdUsuario] = useState('');

  const manejarSeleccionImagen = (tipo) => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
      },
      (respuesta) => {
        if (respuesta.didCancel) {
          return;
        }

        if (respuesta.assets && respuesta.assets.length > 0) {
          if (tipo === 'frente') {
            setDniFrente(respuesta.assets[0].uri);
          } else {
            setDniReverso(respuesta.assets[0].uri);
          }
        }
      },
    );
  };

  const obtenerIdUsuario = async (correo) => {
    try {
      const respuesta = await api.users.getByEmail(correo);
      if (respuesta && respuesta.data && respuesta.data.idUsuario) {
        setIdUsuario(respuesta.data.idUsuario);
        return respuesta.data.idUsuario;
      }
    } catch (error) {
      console.error('Error al obtener ID de usuario:', error);
    }
    return null;
  };

  const manejarContinuar = async () => {
    if (pasoActual === 1) {
      // Validar datos del paso 1 usando las utilidades de validación
      const datosValidacion = {
        correo,
        numeroTarjeta,
        fechaVencimiento,
        cvv,
        nombreTarjeta,
        tramite: '',
        dniFrente: 'temp',
        dniReverso: 'temp'
      };
      
      const validacion = validarDatosRegistroEstudiante(datosValidacion);
      const erroresPaso1 = validacion.errores.filter(error => 
        !error.includes('trámite') && 
        !error.includes('DNI')
      );
      
      if (erroresPaso1.length > 0) {
        Alert.alert('Errores de Validación', erroresPaso1.join('\n'));
        return;
      }
      
      setPasoActual(2);
    } else if (pasoActual === 2) {
      // Validar todos los datos antes de enviar
      const datosCompletos = {
        correo,
        numeroTarjeta,
        fechaVencimiento,
        cvv,
        nombreTarjeta,
        tramite,
        dniFrente,
        dniReverso
      };
      
      const validacionCompleta = validarDatosRegistroEstudiante(datosCompletos);
      if (!validacionCompleta.valido) {
        Alert.alert('Errores de Validación', validacionCompleta.errores.join('\n'));
        return;
      }
      setCargando(true);
      try {
        // Extraer nombres de archivo de URIs si es posible
        const obtenerNombreArchivo = (uri) => {
          if (!uri) return 'imagen_dni.jpg';
          const partes = uri.split('/');
          const nombreCompleto = partes[partes.length - 1];
          // Si no tiene extensión, agregar .jpg
          return nombreCompleto.includes('.') ? nombreCompleto : `${nombreCompleto}.jpg`;
        };
        
        const nombreArchivoDniFrente = obtenerNombreArchivo(dniFrente);
        const nombreArchivoDniFondo = obtenerNombreArchivo(dniReverso);
        const mail = correo;
        const medioPago = numeroTarjeta || '';
        const tramiteStr = tramite || '';
        
        // Registrar los datos para depuración
        console.log('Parámetros de registro de estudiante:', { 
          mail, 
          idUsuario: null, 
          medioPago, 
          dniFrente: nombreArchivoDniFrente, 
          dniFondo: nombreArchivoDniFondo, 
          tramite: tramiteStr 
        });
        
        if (!mail) {
          Alert.alert('Error', 'El correo electrónico es requerido para el registro.');
          setCargando(false);
          return;
        }
        
        if (!medioPago) {
          Alert.alert('Error', 'La información de la tarjeta es requerida.');
          setCargando(false);
          return;
        }
        
        if (!tramiteStr) {
          Alert.alert('Error', 'El número de trámite del DNI es requerido.');
          setCargando(false);
          return;
        }
        
        try {
          const respuesta = await api.auth.registerStudent(
            mail,
            null, // idUsuario es null para nuevo estudiante
            medioPago,
            nombreArchivoDniFrente,
            nombreArchivoDniFondo,
            tramiteStr
          );
          
          setCargando(false);
          
          if (respuesta && respuesta.success) {
            Alert.alert(
              'Registro Exitoso',
              'Tu registro como estudiante fue procesado exitosamente. Revisa tu correo para completar la verificación.',
              [{ text: 'ACEPTAR', onPress: () => navigation.navigate('Verification', { email: correo }) }]
            );
          } else {
            // Manejar errores específicos del backend
            const mensajeError = respuesta?.data || 'No se pudo registrar como estudiante.';
            if (mensajeError.includes('Ya existe') || mensajeError.includes('ya sea un estudiante')) {
              Alert.alert(
                'Usuario ya registrado',
                'Este correo electrónico ya está registrado como estudiante. Puedes iniciar sesión o recuperar tu contraseña.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }
                ]
              );
            } else {
              Alert.alert('Error', mensajeError);
            }
          }
        } catch (error) {
          setCargando(false);
          console.error('Error específico de registro de estudiante:', error);
          
          // Manejar tipos específicos de errores
          let mensajeError = 'No se pudo registrar como estudiante.';
          
          if (error.message) {
            if (error.message.includes('403')) {
              mensajeError = 'No tienes permisos para realizar esta acción. Verifica que el correo electrónico sea válido.';
            } else if (error.message.includes('400')) {
              mensajeError = 'Datos incorrectos. Verifica que todos los campos estén completos y correctos.';
            } else if (error.message.includes('404')) {
              mensajeError = 'Servicio no disponible. Intenta nuevamente más tarde.';
            } else if (error.message.includes('500')) {
              mensajeError = 'Error interno del servidor. Intenta nuevamente más tarde.';
            } else if (error.message.includes('Sin conexión')) {
              mensajeError = 'Sin conexión a internet. Verifica tu conexión e intenta nuevamente.';
            } else {
              mensajeError = error.message;
            }
          }
          
          Alert.alert(
            'Error de Registro',
            mensajeError,
            [
              { text: 'Reintentar', onPress: () => {} },
              { text: 'Volver al Login', onPress: () => navigation.navigate('Login') }
            ]
          );
        }
      } catch (error) {
        setCargando(false);
        console.error('Error general de registro de estudiante:', error);
        Alert.alert(
          'Error Inesperado',
          'Ocurrió un error inesperado. Por favor intenta nuevamente.',
          [
            { text: 'Reintentar', onPress: () => {} },
            { text: 'Volver', onPress: () => navigation.goBack() }
          ]
        );
      }
    }
  };
  
  const formatearNumeroTarjeta = (texto) => {
    const limpio = texto.replace(/\D/g, '');
    const formateado = limpio.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formateado.slice(0, 19);
  };
  
  const formatearFechaVencimiento = (texto) => {
    const limpio = texto.replace(/\D/g, '');
    if (limpio.length > 2) {
      return `${limpio.slice(0, 2)}/${limpio.slice(2, 4)}`;
    }
    return limpio;
  };
  
  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <KeyboardAvoidingView
        style={estilos.contenedorTeclado}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={estilos.contenedorEncabezado}
        >
          <View style={estilos.contenidoEncabezado}>
            <TouchableOpacity
              style={estilos.botonVolver}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-left" size={24} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={estilos.tituloEncabezado}>Registro de Estudiante</Text>
          </View>
        </LinearGradient>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={estilos.contenidoScroll}
        >
          <View style={estilos.contenedorProgreso}>
            <View style={estilos.barraProgreso}>
              <View style={[estilos.rellenoProgreso, { width: `${pasoActual * 50}%` }]} />
            </View>
            <Text style={estilos.textoProgreso}>Paso {pasoActual}/2</Text>
          </View>
          
          {pasoActual === 1 ? (
            <>
              <View style={estilos.contenedorInfo}>
                <View style={estilos.iconoInfo}>
                  <Icon name="info" size={20} color={Colors.primary} />
                </View>
                <Text style={estilos.textoInfo}>
                  El registro como estudiante es gratuito a menos que te inscribas en un curso. Necesitarás proporcionar información de pago para futuras inscripciones.
                </Text>
              </View>
              
              <View style={estilos.contenedorSeccion}>
                <Text style={estilos.tituloSeccion}>Método de Pago</Text>
                <Text style={estilos.descripcionSeccion}>
                  Agrega un método de pago para las inscripciones a cursos. No te cobraremos hasta que te registres en un curso.
                </Text>
                
                <Input
                  label="Número de Tarjeta"
                  value={numeroTarjeta}
                  onChangeText={(texto) => setNumeroTarjeta(formatearNumeroTarjeta(texto))}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="number-pad"
                  leftIcon="credit-card"
                />
                
                <View style={estilos.camposEnFila}>
                  <Input
                    label="Fecha de Vencimiento"
                    value={fechaVencimiento}
                    onChangeText={(texto) => setFechaVencimiento(formatearFechaVencimiento(texto))}
                    placeholder="MM/AA"
                    keyboardType="number-pad"
                    style={estilos.campoMitad}
                  />
                  
                  <Input
                    label="Código de Seguridad"
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="CVV"
                    keyboardType="number-pad"
                    maxLength={3}
                    style={estilos.campoMitad}
                  />
                </View>
                
                <Input
                  label="Nombre en la Tarjeta"
                  value={nombreTarjeta}
                  onChangeText={setNombreTarjeta}
                  placeholder="Juan Pérez"
                />
              </View>
            </>
          ) : (
            <View style={estilos.contenedorSeccion}>
              <Text style={estilos.tituloSeccion}>Verificación de Identidad</Text>
              <Text style={estilos.descripcionSeccion}>
                Por favor, proporciona fotos de tu documento de identidad (frente y reverso) para la verificación.
              </Text>
              
              <View style={estilos.contenedorSubidaDni}>
                <TouchableOpacity
                  style={estilos.botonSubidaDni}
                  onPress={() => manejarSeleccionImagen('frente')}
                >
                  {dniFrente ? (
                    <Image source={{ uri: dniFrente }} style={estilos.imagenDni} />
                  ) : (
                    <View style={estilos.marcadorDni}>
                      <Icon name="camera" size={40} color={Colors.textMedium} />
                      <Text style={estilos.textoMarcadorDni}>Frente del DNI</Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={estilos.botonSubidaDni}
                  onPress={() => manejarSeleccionImagen('reverso')}
                >
                  {dniReverso ? (
                    <Image source={{ uri: dniReverso }} style={estilos.imagenDni} />
                  ) : (
                    <View style={estilos.marcadorDni}>
                      <Icon name="camera" size={40} color={Colors.textMedium} />
                      <Text style={estilos.textoMarcadorDni}>Reverso del DNI</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <Input
                label="Número de Trámite del DNI"
                value={tramite}
                onChangeText={setTramite}
                placeholder="Ej: AB1234"
                style={{ marginTop: 16 }}
              />
            </View>
          )}
          
          <Button
            title={pasoActual === 1 ? "Continuar" : "Verificar Identidad"}
            onPress={manejarContinuar}
            fullWidth
            style={estilos.botonContinuar}
            isLoading={cargando}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  contenedorTeclado: {
    flex: 1,
  },
  contenedorEncabezado: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.mediumSpacing,
  },
  contenidoEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonVolver: {
    marginRight: Metrics.baseSpacing,
  },
  tituloEncabezado: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  contenidoScroll: {
    padding: Metrics.mediumSpacing,
  },
  contenedorProgreso: {
    marginBottom: Metrics.mediumSpacing,
  },
  barraProgreso: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Metrics.smallSpacing,
  },
  rellenoProgreso: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  textoProgreso: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  contenedorInfo: {
    backgroundColor: Colors.primary + '15',
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    flexDirection: 'row',
    marginBottom: Metrics.mediumSpacing,
  },
  iconoInfo: {
    marginRight: Metrics.baseSpacing,
    marginTop: 2,
  },
  textoInfo: {
    flex: 1,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    lineHeight: Metrics.baseLineHeight,
  },
  contenedorSeccion: {
    marginBottom: Metrics.mediumSpacing,
  },
  tituloSeccion: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  descripcionSeccion: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.mediumSpacing,
    lineHeight: Metrics.baseLineHeight,
  },
  camposEnFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Metrics.baseSpacing,
  },
  campoMitad: {
    flex: 1,
  },
  contenedorSubidaDni: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Metrics.mediumSpacing,
    gap: Metrics.baseSpacing,
  },
  botonSubidaDni: {
    flex: 1,
    height: 120,
    borderRadius: Metrics.baseBorderRadius,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  imagenDni: {
    width: '100%',
    height: '100%',
    borderRadius: Metrics.baseBorderRadius - 2,
  },
  marcadorDni: {
    alignItems: 'center',
  },
  textoMarcadorDni: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginTop: Metrics.smallSpacing,
    textAlign: 'center',
  },
  botonContinuar: {
    marginTop: Metrics.mediumSpacing,
  },
});

export default PantallaRegistroEstudiante;