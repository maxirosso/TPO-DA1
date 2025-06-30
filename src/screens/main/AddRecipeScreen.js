import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import dataService from '../../services/dataService';

const AddRecipeScreen = ({ navigation, route }) => {
  const { isVisitor, user } = useContext(AuthContext);
  
  const editingRecipe = route?.params?.editingRecipe;
  const isEditing = route?.params?.isEditing || false;
  
  useEffect(() => {
    if (isVisitor) {
      Alert.alert(
        'Acceso Restringido',
        'Debes registrarte para crear recetas.',
        [
          {
            text: 'Ir a Registro',
            onPress: () => navigation.navigate('ProfileTab')
          }
        ]
      );
    }
  }, [isVisitor, navigation]);
  
   const clearAllFields = () => {
     console.log('Limpiando todos los campos del formulario');
     
     setTitle('');
     setDescription('');
     setServings('');
     setRecipeImage(null);
     setIngredients([{ quantity: '', name: '', unit: 'gramos' }]);
     setInstructions([{ text: '', image: null }]);
     setIsLoading(false);
     setCurrentEditingIngredient(null);
     setShowUnitSelector(false);
     setIsTitleValid(true);
     setTitleError('');
     
     if (recipeTypes.length > 0) {
       setSelectedRecipeType(recipeTypes[0]);
     } else {
       setSelectedRecipeType(null);
     }
   };

   const handleBackPress = () => {
     if (isEditing) {
       console.log('Saliendo del modo edición hacia AddTab limpio');
       navigation.navigate('AddTab', {
         editingRecipe: undefined,
         isEditing: false,
         onRecipeUpdated: undefined
       });
     } else {
       navigation.goBack();
     }
   };

  useFocusEffect(
    React.useCallback(() => {
      if (!isEditing) {
        console.log('Limpiando campos de AddRecipeScreen al entrar en la vista');
        clearAllFields();
        
        if (route.params && (route.params.editingRecipe || route.params.isEditing)) {
          navigation.setParams({
            editingRecipe: undefined,
            isEditing: undefined,
            onRecipeUpdated: undefined
          });
        }
      }
    }, [isEditing, recipeTypes, navigation, route.params])
  );

  if (isVisitor) {
    return null;
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState('');
  const [recipeImage, setRecipeImage] = useState(null);

  const [ingredients, setIngredients] = useState([{ quantity: '', name: '', unit: 'gramos' }]);
  const [instructions, setInstructions] = useState([{ text: '', image: null }]);
  const [isLoading, setIsLoading] = useState(false);
  const [recipeTypes, setRecipeTypes] = useState([]);
  const [selectedRecipeType, setSelectedRecipeType] = useState(null);
  const [currentEditingIngredient, setCurrentEditingIngredient] = useState(null);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [titleError, setTitleError] = useState('');

  const unidadesMedida = [
    { id: 1, descripcion: 'gramos' },
    { id: 2, descripcion: 'Unidades' },
    { id: 3, descripcion: 'piezas' },
    { id: 4, descripcion: 'tazas' }
  ];

  useEffect(() => {
    if (isEditing && editingRecipe) {
      loadExistingRecipe(editingRecipe);
    }
  }, [isEditing, editingRecipe]);

  useEffect(() => {
    loadRecipeTypes();
  }, []);

  useEffect(() => {
    if (!isEditing && route.params?.isEditing === false) {
      console.log('Regresando del modo edición, limpiando campos...');
      clearAllFields();
      
      navigation.setParams({
        editingRecipe: undefined,
        isEditing: undefined,
        onRecipeUpdated: undefined
      });
    }
  }, [isEditing, route.params?.isEditing]);

  const loadRecipeTypes = async () => {
    try {
      const { api } = await import('../../services/api');
      const response = await api.recipes.getTypes();
      const types = response.data || response;
      console.log('Tipos de receta cargados:', types);
      setRecipeTypes(types);
      
      if (types.length > 0 && !selectedRecipeType) {
        setSelectedRecipeType(types[0]);
      }
    } catch (error) {
      console.error('Error al cargar tipos de receta:', error);
      const defaultTypes = [{ idTipo: 1, descripcion: 'Postres' }];
      setRecipeTypes(defaultTypes);
      setSelectedRecipeType(defaultTypes[0]);
    }
  };

  const handleSelectImage = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 600,
        maxWidth: 800,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.assets && response.assets.length > 0) {
          setRecipeImage(response.assets[0].uri);
        }
      },
    );
  };



  const handleAddIngredient = () => {
    setIngredients([...ingredients, { quantity: '', name: '', unit: 'gramos' }]);
  };

  const handleUpdateIngredient = (field, text, index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = text;
    setIngredients(updatedIngredients);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length > 1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients.splice(index, 1);
      setIngredients(updatedIngredients);
    }
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, { text: '', image: null }]);
  };

  const handleUpdateInstruction = (text, index) => {
    const updatedInstructions = [...instructions];
    updatedInstructions[index] = { ...updatedInstructions[index], text };
    setInstructions(updatedInstructions);
  };

  const handleRemoveInstruction = (index) => {
    if (instructions.length > 1) {
      const updatedInstructions = [...instructions];
      updatedInstructions.splice(index, 1);
      setInstructions(updatedInstructions);
    }
  };

  const handleSelectInstructionImage = (index) => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 600,
        maxWidth: 800,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const updatedInstructions = [...instructions];
          updatedInstructions[index] = { 
            ...updatedInstructions[index], 
            image: response.assets[0].uri 
          };
          setInstructions(updatedInstructions);
        }
      },
    );
  };

  const handleRemoveInstructionImage = (index) => {
    const updatedInstructions = [...instructions];
    updatedInstructions[index] = { ...updatedInstructions[index], image: null };
    setInstructions(updatedInstructions);
  };

  const loadExistingRecipe = async (recipe) => {
    console.log('Cargando receta existente:', JSON.stringify(recipe, null, 2));
    
    let multimedia = [];
    try {
      const recipeId = recipe.id || recipe.idReceta;
      if (recipeId) {
        const multimediaResponse = await api.recipes.getMultimedia(recipeId);
        multimedia = multimediaResponse.data || multimediaResponse || [];
        console.log('Multimedia cargada:', multimedia);
      }
    } catch (error) {
      console.log('Error cargando multimedia:', error);
      multimedia = [];
    }
    
    setTitle(recipe.title || recipe.nombreReceta || '');
    setDescription(recipe.description || recipe.descripcionReceta || '');
    setServings(recipe.servings?.toString() || recipe.porciones?.toString() || '');
    setRecipeImage(recipe.imageUrl || recipe.fotoPrincipal);
    
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      console.log('Cargando ingredientes del formato frontend:', JSON.stringify(recipe.ingredients));
      const formattedIngredients = recipe.ingredients.map(ing => {
        let quantity = '';
        let name = '';
        let unit = 'gramos';
        
        if (ing.name) {
          name = ing.name;
        } else if (ing.nombre) {
          name = ing.nombre;
        } else if (typeof ing === 'string') {
          name = ing;
        }
        
        if (ing.amount && typeof ing.amount === 'string') {
          const match = ing.amount.match(/^(\d*\.?\d+)\s*(.*)$/);
          if (match) {
            quantity = match[1];
            if (match[2].trim()) {
              unit = match[2].trim();
            }
          } else {
            quantity = ing.amount;
          }
        } else if (ing.cantidad) {
          quantity = ing.cantidad.toString();
          if (ing.unidadMedida) {
            unit = ing.unidadMedida;
          }
        }
        
        console.log(`Ingrediente formateado: ${name}, ${quantity} ${unit}`);
        return { quantity, name, unit };
      });
      
      setIngredients(formattedIngredients);
    } else if (recipe.ingredientes && Array.isArray(recipe.ingredientes)) {
      console.log('Cargando ingredientes del formato backend:', JSON.stringify(recipe.ingredientes));
      const formattedIngredients = recipe.ingredientes.map(ing => {
        let quantity = '';
        let name = '';
        let unit = 'gramos';
        
        if (ing.nombre) {
          name = ing.nombre;
        } else if (typeof ing === 'string') {
          name = ing;
        }
        
        if (ing.cantidad) {
          quantity = ing.cantidad.toString();
        }
        
        if (ing.unidadMedida) {
          unit = ing.unidadMedida;
        }
        
        console.log(`Ingrediente formateado desde backend: ${name}, ${quantity} ${unit}`);
        return { quantity, name, unit };
      });
      
      setIngredients(formattedIngredients);
    } else {
      setIngredients([{ quantity: '', name: '', unit: 'gramos' }]);
    }
    
    let processedInstructions = [];
    if (recipe.instructions && Array.isArray(recipe.instructions)) {
      processedInstructions = recipe.instructions.map(inst => ({
        text: inst.text || inst.toString(),
        image: inst.image || inst.imageUrl || null
      }));
    } else if (recipe.pasos && Array.isArray(recipe.pasos)) {
      processedInstructions = recipe.pasos.map(paso => ({
        text: paso.texto || paso.text || paso.toString(),
        image: paso.imagen || paso.imageUrl || null
      }));
    } else if (recipe.instrucciones) {
      if (Array.isArray(recipe.instrucciones)) {
        processedInstructions = recipe.instrucciones.map(inst => ({
          text: inst.toString(),
          image: null
        }));
      } else if (typeof recipe.instrucciones === 'string') {
        processedInstructions = recipe.instrucciones.split('\n').filter(step => step.trim()).map(step => ({
          text: step,
          image: null
        }));
      }
    }
    
    if (multimedia && Array.isArray(multimedia)) {
      const fotosInstrucciones = multimedia.filter(media => media.idPaso !== null);
      fotosInstrucciones.forEach(foto => {
        const pasoIndex = foto.idPaso - 1; 
        if (pasoIndex >= 0 && pasoIndex < processedInstructions.length) {
          processedInstructions[pasoIndex].image = foto.urlContenido;
        }
      });
    }
    
    setInstructions(processedInstructions);
    
    if (recipe.tipo || recipe.tipoReceta) {
      const recipeTypeFromData = recipe.tipo || recipe.tipoReceta;
      console.log('Tipo de receta desde datos:', recipeTypeFromData);
      
      setTimeout(() => {
        if (recipeTypes.length > 0) {
          const matchingType = recipeTypes.find(type => 
            type.idTipo === recipeTypeFromData.idTipo ||
            type.descripcion === recipeTypeFromData.descripcion
          );
          if (matchingType) {
            setSelectedRecipeType(matchingType);
          }
        }
      }, 100); 
    }
  };

  const updateRecipe = async (recipeData) => {
    try {
      const currentUser = user || await getCurrentUser();
      
      if (!currentUser || !currentUser.idUsuario) {
        Alert.alert('Error', 'No se pudo identificar al usuario. Inicia sesión nuevamente.');
        return;
      }

      const recipeId = editingRecipe.id || editingRecipe.idReceta;
      if (!recipeId) {
        Alert.alert('Error', 'ID de receta no válido');
        return;
      }

      console.log('Ingredientes originales:', JSON.stringify(recipeData.ingredients));
      
      const completeRecipeData = {
        ...recipeData,
        tipoReceta: selectedRecipeType,
        ingredients: recipeData.ingredients.map(ing => ({
          name: ing.name.trim(),
          quantity: ing.quantity || '1',
          unit: ing.unit || 'unidad'
        })),
        fotos: [],
        fotosInstrucciones: []
      };

      if (recipeData.imageUrl) {
        completeRecipeData.fotos.push({
          url: recipeData.imageUrl,
          tipo: 'foto_principal',
          extension: 'jpg'
        });
      }

      recipeData.instructions.forEach((instruction, index) => {
        if (instruction.image) {
          completeRecipeData.fotosInstrucciones.push({
            url: instruction.image,
            paso: index + 1,
            tipo: 'foto_paso',
            extension: 'jpg'
          });
        }
      });
      
      console.log('Datos completos de receta para actualización:', JSON.stringify(completeRecipeData, null, 2));
      console.log('Fotos adicionales:', completeRecipeData.fotos);
      console.log('Fotos de instrucciones:', completeRecipeData.fotosInstrucciones);

      const result = await dataService.updateUserRecipe(
        recipeId, 
        completeRecipeData, 
        currentUser.idUsuario
      );
      
      const onRecipeUpdated = route.params?.onRecipeUpdated;
      
      if (result.success) {
        Alert.alert(
          'Receta Actualizada',
          typeof result.data === 'string' ? result.data : 'Receta actualizada exitosamente',
          [{ 
            text: 'OK', 
            onPress: () => {
              if (typeof onRecipeUpdated === 'function') {
                onRecipeUpdated();
              }
              navigation.navigate('HomeTab');
            } 
          }]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar la receta');
      }
    } catch (error) {
      console.error('Error al actualizar receta:', error);
      let errorMessage = 'No se pudo actualizar la receta';
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'No tienes permisos para editar esta receta';
        } else if (error.message.includes('404') || error.message.includes('not found')) {
          errorMessage = 'Receta no encontrada';
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorMessage = 'Datos incorrectos. Verifica la información e intenta nuevamente';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const getCurrentUser = async () => {
    try {
      let userData = await AsyncStorage.getItem('user_data');
      if (!userData) {
        userData = await AsyncStorage.getItem('user');
      }
      if (!userData) {
        userData = await AsyncStorage.getItem('currentUser');
      }
      
      const parsedUser = userData ? JSON.parse(userData) : null;
      console.log('Usuario actual desde almacenamiento:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      return null;
    }
  };

  const checkNetworkCost = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        Alert.alert(
          'Sin Conexión',
          'No hay conexión a internet. La receta se guardará localmente y se subirá cuando tengas conexión.',
          [{ text: 'Entendido' }]
        );
        return 'offline';
      }

      const connectionType = netInfo.type;
      const isWiFi = connectionType === 'wifi';
      
      if (!isWiFi) {
        return new Promise((resolve) => {
          Alert.alert(
            'Conexión de Datos Móviles',
            'Estás usando datos móviles que pueden tener costo. ¿Deseas continuar o esperar a tener WiFi gratuito?',
            [
              {
                text: 'Esperar WiFi',
                style: 'cancel',
                onPress: () => resolve('wait')
              },
              {
                text: 'Usar Datos',
                onPress: () => resolve('paid')
              }
            ]
          );
        });
      }

      return 'free';
    } catch (error) {
      console.log('Error al verificar la red:', error);
      return 'unknown';
    }
  };

  const saveRecipeLocally = async (recipeData) => {
    try {
      const pendingRecipes = await AsyncStorage.getItem('pendingRecipes');
      const recipes = pendingRecipes ? JSON.parse(pendingRecipes) : [];
      
      const newRecipe = {
        ...recipeData,
        id: Date.now().toString(),
        status: 'pending_upload',
        createdAt: new Date().toISOString(),
        tipoReceta: selectedRecipeType, 
      };
      
      recipes.push(newRecipe);
      await AsyncStorage.setItem('pendingRecipes', JSON.stringify(recipes));
      
      // Limpiar campos después de guardar localmente
      clearAllFields();
      
      Alert.alert(
        'Receta Guardada',
        'Tu receta se ha guardado localmente y se subirá automáticamente cuando tengas conexión WiFi.',
        [{ text: 'OK', onPress: () => navigation.navigate('HomeTab') }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la receta localmente');
    }
  };

  const uploadRecipe = async (recipeData) => {
    try {
      const currentUser = user || await getCurrentUser();
      
      if (!currentUser || !currentUser.idUsuario) {
        Alert.alert('Error', 'No se pudo identificar al usuario. Inicia sesión nuevamente.');
        return;
      }

      const backendRecipeData = {
        nombreReceta: recipeData.title.trim(),
        descripcionReceta: recipeData.description.trim(),
        fotoPrincipal: recipeData.imageUrl,
        porciones: parseInt(recipeData.servings) || 1,
        cantidadPersonas: parseInt(recipeData.servings) || 1,
        instrucciones: recipeData.instructions.map(inst => inst.text).join('\n'),
        fecha: new Date().toISOString().split('T')[0], 
        autorizada: false, // Siempre falso para recetas nuevas que requieren aprobación
        usuario: {
          idUsuario: currentUser.idUsuario
        },
        idTipo: selectedRecipeType, 
        ingredientes: recipeData.ingredients.map((ing, index) => {
          const amountText = ing.amount || '1 unidad';
          const match = amountText.match(/^(\d*\.?\d+)\s*(.*)$/);
          
          let cantidad = 1;
          let unidadMedida = ing.unit || 'unidad';
          
          if (match) {
            cantidad = parseFloat(match[1]) || 1;
            if (!ing.unit && match[2].trim()) {
              unidadMedida = match[2].trim();
            }
          }
          
          return {
            nombre: ing.name,
            cantidad: cantidad,
            unidadMedida: unidadMedida
          };
        }),
        fotos: [],
        fotosInstrucciones: []
      };

      if (recipeData.imageUrl) {
        backendRecipeData.fotos.push({
          url: recipeData.imageUrl,
          tipo: 'foto_principal',
          extension: 'jpg'
        });
      }

      recipeData.instructions.forEach((instruction, index) => {
        if (instruction.image) {
          backendRecipeData.fotosInstrucciones.push({
            url: instruction.image,
            paso: index + 1,
            tipo: 'foto_paso',
            extension: 'jpg'
          });
        }
      });

      console.log('Enviando datos de receta al backend:', backendRecipeData);
      console.log('Fotos adicionales:', backendRecipeData.fotos);
      console.log('Fotos de instrucciones:', backendRecipeData.fotosInstrucciones);

      let response;
      
      try {
        response = await api.recipes.createSimple(backendRecipeData);
      } catch (primaryError) {
        console.log('Falló el endpoint simple, intentando alternativa:', primaryError.message);
        try {
          response = await api.recipes.create(backendRecipeData);
        } catch (secondaryError) {
          console.log('Falló el endpoint principal, intentando último recurso:', secondaryError.message);
          response = await api.recipes.createAlternative(backendRecipeData);
        }
      }

      if (response.success || response.data) {
        clearAllFields();
        
        Alert.alert(
          'Receta Enviada',
          'Tu receta ha sido enviada y está pendiente de aprobación. Una vez aprobada por nuestro equipo, será visible para otros usuarios.',
          [{ text: 'OK', onPress: () => navigation.navigate('HomeTab') }]
        );
      } else {
        throw new Error(response.message || 'Error al enviar la receta');
      }

    } catch (error) {
      console.error('Error al subir la receta:', error);
      let errorMessage = 'No se pudo subir la receta.';
      
      if (error.message.includes('400')) {
        errorMessage = 'Datos de receta inválidos. Verifica que todos los campos estén completos.';
      } else if (error.message.includes('401')) {
        errorMessage = 'No tienes autorización para crear recetas. Inicia sesión nuevamente.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error del servidor. Inténtalo nuevamente más tarde.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', `${errorMessage} Se guardará localmente.`);
      await saveRecipeLocally(recipeData);
    }
  };

  const checkRecipeTitleExists = async (title) => {
    try {
      if (!title.trim() || isEditing) return null;
      
      const currentUser = user || await getCurrentUser();
      if (!currentUser || !currentUser.idUsuario) return null;

      try {
        const { data } = await api.recipes.getByName(title.trim());
        
        const matchingRecipes = Array.isArray(data) ? data.filter(r => 
          r.usuario && 
          r.usuario.idUsuario === currentUser.idUsuario && 
          r.nombreReceta.toLowerCase() === title.trim().toLowerCase()
        ) : [];

        return matchingRecipes.length > 0 ? matchingRecipes[0] : null;
      } catch (error) {
        if (error.message && error.message.includes('404')) {
          return null;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error verificando nombre de receta:', error);
      return null;
    }
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    
    if (newTitle.trim().length > 0) {
      setTimeout(async () => {
        const existingRecipe = await checkRecipeTitleExists(newTitle);
        setIsTitleValid(!existingRecipe);
        if (existingRecipe) {
          setTitleError('Ya tienes una receta con este nombre. Se te dará la opción de reemplazar o editar al guardar.');
        } else {
          setTitleError('');
        }
      }, 500);
    } else {
      setIsTitleValid(true);
      setTitleError('');
    }
  };

  const replaceExistingRecipe = async (existingRecipe, newRecipeData) => {
    try {
      const currentUser = user || await getCurrentUser();
      
      if (!currentUser || !currentUser.idUsuario) {
        Alert.alert('Error', 'No se pudo identificar al usuario. Inicia sesión nuevamente.');
        return;
      }

      console.log('Eliminando receta existente:', existingRecipe.idReceta);
      const deleteResult = await dataService.deleteUserRecipe(existingRecipe.idReceta, currentUser.idUsuario);
      
      if (!deleteResult.success) {
        Alert.alert('Error', 'No se pudo eliminar la receta existente: ' + deleteResult.message);
        return;
      }

       console.log('Creando nueva receta para reemplazar...');
       await uploadRecipe(newRecipeData);
       
       clearAllFields();
       
     } catch (error) {
       console.error('Error al reemplazar receta:', error);
       Alert.alert('Error', 'No se pudo reemplazar la receta. Intenta nuevamente.');
     }
   };

  const editExistingRecipe = (existingRecipe) => {
    const mappedRecipe = {
      id: existingRecipe.idReceta,
      idReceta: existingRecipe.idReceta,
      title: existingRecipe.nombreReceta,
      nombreReceta: existingRecipe.nombreReceta,
      description: existingRecipe.descripcionReceta,
      descripcionReceta: existingRecipe.descripcionReceta,
      imageUrl: existingRecipe.fotoPrincipal,
      fotoPrincipal: existingRecipe.fotoPrincipal,
      servings: existingRecipe.porciones,
      porciones: existingRecipe.porciones,
      instructions: typeof existingRecipe.instrucciones === 'string' ? 
        existingRecipe.instrucciones.split('\n').filter(step => step.trim()) : 
        existingRecipe.instrucciones || [],
      instrucciones: existingRecipe.instrucciones,
      ingredients: existingRecipe.ingredientes ? existingRecipe.ingredientes.map(ing => ({
        name: ing.nombre,
        amount: `${ing.cantidad} ${ing.unidadMedida}`.trim(),
        quantity: ing.cantidad.toString(),
        unit: ing.unidadMedida
      })) : [],
      ingredientes: existingRecipe.ingredientes,
      tipo: existingRecipe.tipo || existingRecipe.idTipo,
      tipoReceta: existingRecipe.tipo || existingRecipe.idTipo,
      usuario: existingRecipe.usuario
    };

    navigation.navigate('AddTab', {
      editingRecipe: mappedRecipe,
      isEditing: true,
      onRecipeUpdated: () => {
        navigation.navigate('HomeTab');
      }
    });
  };

  const handleSaveRecipe = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título de la receta es obligatorio');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción de la receta es obligatoria');
      return;
    }

    if (ingredients.filter(ing => ing.name.trim()).length === 0) {
      Alert.alert('Error', 'Debes agregar al menos un ingrediente');
      return;
    }

    if (instructions.filter(inst => inst.text && inst.text.trim()).length === 0) {
      Alert.alert('Error', 'Debes agregar al menos una instrucción');
      return;
    }

    setIsLoading(true);

    console.log('Ingredientes actuales en handleSaveRecipe:', JSON.stringify(ingredients));

    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      servings: parseInt(servings) || 1,
      imageUrl: recipeImage || null,
      ingredients: ingredients.filter(ing => ing.name.trim()).map(ing => ({
        name: ing.name.trim(),
        amount: ing.quantity.trim() || '1',
        unit: ing.unit || 'unidad',
        preparation: ''
      })),
      instructions: instructions.filter(inst => inst.text && inst.text.trim()).map((inst, index) => ({
        step: index + 1,
        text: inst.text.trim(),
        image: inst.image || null
      }))
    };

          console.log('Datos de receta formateados para guardar/actualizar:', JSON.stringify(recipeData, null, 2));
      console.log('Fotos adicionales:', recipeData.fotos);
      console.log('Fotos de instrucciones:', recipeData.fotosInstrucciones);

    try {
      if (isEditing && editingRecipe) {
        await updateRecipe(recipeData);
      } else {
        const existingRecipe = await checkRecipeTitleExists(recipeData.title);
        
        if (existingRecipe) {
          setIsLoading(false);
          
          Alert.alert(
            'Receta Existente',
            `Ya tienes una receta llamada "${recipeData.title}". ¿Qué deseas hacer?`,
            [
              {
                text: 'Cancelar',
                style: 'cancel'
              },
              {
                text: 'Reemplazar',
                style: 'destructive',
                onPress: async () => {
                  setIsLoading(true);
                  await replaceExistingRecipe(existingRecipe, recipeData);
                  setIsLoading(false);
                }
              },
              {
                text: 'Editar Existente',
                onPress: () => {
                  editExistingRecipe(existingRecipe);
                }
              }
            ],
            { cancelable: true }
          );
          return;
        }

        const networkStatus = await checkNetworkCost();

        switch (networkStatus) {
          case 'offline':
            await saveRecipeLocally(recipeData);
            break;
          case 'wait':
            await saveRecipeLocally(recipeData);
            break;
          case 'free':
          case 'paid':
            await uploadRecipe(recipeData);
            break;
          default:
            await uploadRecipe(recipeData);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la receta. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Icon name="chevron-left" size={24} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Editar Receta' : 'Crear Receta'}
            </Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRecipe}
            >
              <Icon name="check" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleSelectImage}
          >
            {recipeImage ? (
              <Image
                source={{ uri: recipeImage }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="camera" size={40} color={Colors.textMedium} />
                <Text style={styles.imagePlaceholderText}>Añadir Foto de Receta</Text>
              </View>
            )}
          </TouchableOpacity>



          <View style={styles.formSection}>
            <Input
              label="Título de la Receta"
              value={title}
              onChangeText={handleTitleChange}
              placeholder="Ingresa el título de la receta"
              error={titleError}
              rightComponent={
                titleError ? (
                  <Icon name="alert-circle" size={20} color={Colors.error} />
                ) : (title.trim().length > 0 && isTitleValid ? (
                  <Icon name="check-circle" size={20} color={Colors.success} />
                ) : null)
              }
            />

            <Input
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe brevemente tu receta"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Porciones"
              value={servings}
              onChangeText={setServings}
              placeholder="4"
              keyboardType="number-pad"
            />

            <Text style={styles.labelText}>Tipo de Receta</Text>
            <View style={styles.categoriesContainer}>
              {recipeTypes.map((tipo) => (
                <TouchableOpacity
                  key={tipo.idTipo}
                  style={[
                    styles.categoryTag,
                    selectedRecipeType && selectedRecipeType.idTipo === tipo.idTipo &&
                      styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedRecipeType(tipo)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedRecipeType && selectedRecipeType.idTipo === tipo.idTipo &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {tipo.descripcion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedRecipeType && (
              <Text style={styles.infoText}>
                Tipo de receta seleccionado: <Text style={styles.highlightText}>{selectedRecipeType.descripcion}</Text>
              </Text>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredientes</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddIngredient}
              >
                <Icon name="plus" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {ingredients.map((ingredient, index) => (
              <View key={`ingredient-${index}`} style={styles.ingredientContainer}>
                <View style={styles.ingredientRow}>
                  <TextInput
                    style={styles.quantityInput}
                    value={ingredient.quantity}
                    onChangeText={(text) => handleUpdateIngredient('quantity', text, index)}
                    placeholder="Cantidad"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.unitPickerButton}
                    onPress={() => {
                      setCurrentEditingIngredient(index);
                      setShowUnitSelector(true);
                    }}
                  >
                    <Text style={styles.unitLabelText}>{ingredient.unit}</Text>
                    <Icon name="chevron-down" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.ingredientNameInput}
                    value={ingredient.name}
                    onChangeText={(text) => handleUpdateIngredient('name', text, index)}
                    placeholder={`Ingrediente ${index + 1}`}
                    placeholderTextColor={Colors.textLight}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Icon
                      name="x"
                      size={18}
                      color={
                        ingredients.length === 1
                          ? Colors.textLight
                          : Colors.textDark
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Instrucciones</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddInstruction}
              >
                <Icon name="plus" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {instructions.map((instruction, index) => (
              <View key={`instruction-${index}`} style={styles.instructionContainer}>
                <View style={styles.instructionRow}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.instructionInput}
                    value={instruction.text}
                    onChangeText={(text) => handleUpdateInstruction(text, index)}
                    placeholder={`Paso ${index + 1}`}
                    placeholderTextColor={Colors.textLight}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveInstruction(index)}
                    disabled={instructions.length === 1}
                  >
                    <Icon
                      name="x"
                      size={18}
                      color={
                        instructions.length === 1
                          ? Colors.textLight
                          : Colors.textDark
                      }
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.instructionImageControls}>
                  {instruction.image ? (
                    <View style={styles.instructionImagePreview}>
                      <Image
                        source={{ uri: instruction.image }}
                        style={styles.instructionImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeInstructionImageButton}
                        onPress={() => handleRemoveInstructionImage(index)}
                      >
                        <Icon name="x" size={16} color={Colors.card} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addInstructionImageButton}
                      onPress={() => handleSelectInstructionImage(index)}
                    >
                      <Icon name="camera" size={20} color={Colors.primary} />
                      <Text style={styles.addInstructionImageText}>
                        Agregar foto al paso
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <Button
              title={isLoading ? "Guardando..." : (isEditing ? "Actualizar Receta" : "Guardar Receta")}
              onPress={handleSaveRecipe}
              style={styles.saveRecipeButton}
              disabled={isLoading}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showUnitSelector}
        onRequestClose={() => setShowUnitSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar unidad</Text>
            
            {unidadesMedida.map((unidad) => (
              <TouchableOpacity 
                key={unidad.id} 
                style={[
                  styles.unitOption,
                  currentEditingIngredient !== null && 
                  ingredients[currentEditingIngredient]?.unit === unidad.descripcion &&
                  styles.selectedUnitOption
                ]}
                onPress={() => {
                  if (currentEditingIngredient !== null) {
                    const updatedIngredients = [...ingredients];
                    updatedIngredients[currentEditingIngredient].unit = unidad.descripcion;
                    setIngredients(updatedIngredients);
                  }
                  setShowUnitSelector(false);
                }}
              >
                <Text 
                  style={[
                    styles.unitOptionText,
                    currentEditingIngredient !== null &&
                    ingredients[currentEditingIngredient]?.unit === unidad.descripcion &&
                    styles.selectedUnitOptionText
                  ]}
                >
                  {unidad.descripcion}
                </Text>
                {currentEditingIngredient !== null && 
                 ingredients[currentEditingIngredient]?.unit === unidad.descripcion && (
                  <Icon name="check" size={16} color={Colors.card} />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowUnitSelector(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.mediumSpacing,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Metrics.xLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  saveButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    overflow: 'hidden',
    marginBottom: Metrics.mediumSpacing,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  imagePlaceholderText: {
    marginTop: Metrics.baseSpacing,
    color: Colors.textMedium,
    fontSize: Metrics.baseFontSize,
  },
  formSection: {
    marginBottom: Metrics.largeSpacing,
  },
  rowFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '48%',
  },
  labelText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },

  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Metrics.mediumSpacing,
  },
  categoryTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: Metrics.roundedFull,
    marginRight: Metrics.baseSpacing,
    marginBottom: Metrics.baseSpacing,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCategory: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
  },
  selectedCategoryText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
    marginTop: Metrics.mediumSpacing,
  },
  sectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  ingredientContainer: {
    marginBottom: Metrics.baseSpacing,
  },
  instructionContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 90,
    height: Metrics.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    paddingHorizontal: Metrics.baseSpacing,
    backgroundColor: Colors.card,
    color: Colors.textDark,
    marginRight: 0,
  },
  unitPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Metrics.inputHeight,
    width: 90,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  ingredientNameInput: {
    flex: 1,
    height: Metrics.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    paddingHorizontal: Metrics.mediumSpacing,
    backgroundColor: Colors.card,
    color: Colors.textDark,
  },
  removeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Metrics.baseSpacing,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.baseSpacing,
    marginTop: 12,
  },
  instructionNumberText: {
    fontSize: Metrics.smallFontSize,
    fontWeight: '600',
    color: Colors.card,
  },
  instructionInput: {
    flex: 1,
    minHeight: Metrics.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
    backgroundColor: Colors.card,
    color: Colors.textDark,
    textAlignVertical: 'top',
  },
  saveRecipeButton: {
    marginTop: Metrics.largeSpacing,
    marginBottom: Metrics.xxLargeSpacing,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    padding: Metrics.mediumSpacing,
    borderRadius: Metrics.mediumBorderRadius,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
    textAlign: 'center',
  },
  unitOption: {
    padding: Metrics.baseSpacing,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    marginBottom: Metrics.baseSpacing,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitOptionText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    padding: 10,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    padding: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
    alignItems: 'center',
    marginTop: Metrics.baseSpacing,
  },
  closeButtonText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.card,
  },
  selectedUnitOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedUnitOptionText: {
    color: Colors.card,
    fontWeight: '600',
  },
  unitLabelText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
    marginRight: 4,
  },
  infoText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.baseSpacing,
    marginTop: -Metrics.smallSpacing,
    paddingHorizontal: 4,
  },
  highlightText: {
    fontWeight: '600',
    color: Colors.primary,
  },

    instructionImageControls: {
    marginTop: Metrics.baseSpacing,
    marginLeft: 34, 
  },
  instructionImagePreview: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  instructionImage: {
    width: 120,
    height: 80,
    borderRadius: Metrics.baseBorderRadius,
  },
  removeInstructionImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addInstructionImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Metrics.baseBorderRadius,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    alignSelf: 'flex-start',
  },
  addInstructionImageText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    marginLeft: Metrics.baseSpacing,
  },
});

export default AddRecipeScreen;