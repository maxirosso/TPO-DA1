import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RecipeCard from '../../components/recipe/RecipeCard';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import dataService from '../../services/dataService';

const AdminPanelScreen = ({ navigation }) => {
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        // Check if user is authorized (empresa/admin)
        const isAuthorized = user.tipo === 'empresa';
        
        if (!isAuthorized) {
          Alert.alert(
            'Acceso Denegado', 
            'Solo los representantes de la empresa pueden acceder a este panel.',
            [{ text: 'Entendido', onPress: () => navigation.goBack() }]
          );
          return;
        }
        
        loadPendingRecipes();
      } else {
        Alert.alert(
          'Error de Autenticación', 
          'Debe iniciar sesión para acceder a este panel.',
          [{ text: 'Entendido', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.log('Error checking authorization:', error);
      navigation.goBack();
    }
  };

  const loadPendingRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get all recipes and filter for pending approval
      const allRecipes = await dataService.getAllRecipes();
      
      // Filter for pending approval - consider null as false (pending)
      const pending = allRecipes.filter(recipe => recipe.autorizada !== true);
      
      setPendingRecipes(pending);
    } catch (err) {
      console.log('Error loading pending recipes:', err);
      setError('No se pudieron cargar las recetas pendientes.');
      setPendingRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecipe = async (recipeId, approve = true) => {
    try {
      await dataService.approveRecipe(recipeId, approve);
      
      // Remove from pending list
      const updatedRecipes = pendingRecipes.filter(recipe => recipe.id !== recipeId);
      setPendingRecipes(updatedRecipes);
      
      const action = approve ? 'aprobada' : 'rechazada';
      Alert.alert('Éxito', `Receta ${action} correctamente`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la aprobación de la receta');
    }
  };

  const showApprovalDialog = (recipe) => {
    Alert.alert(
      'Aprobar Receta',
      `Receta: "${recipe.title}"\nAutor: ${recipe.author}\n\n¿Qué acción deseas realizar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aprobar', 
          onPress: () => handleApproveRecipe(recipe.id, true),
          style: 'default'
        },
        { 
          text: 'Rechazar', 
          onPress: () => handleApproveRecipe(recipe.id, false),
          style: 'destructive'
        }
      ]
    );
  };

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeItemContainer}>
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
        activeOpacity={0.8}
      >
        <RecipeCard
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrl}
  
          tags={item.tags}
          type="list"
          onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
        />
      </TouchableOpacity>
      
      <View style={styles.recipeActions}>
        <View style={styles.recipeInfo}>
          <Text style={styles.authorText}>Autor: {item.author}</Text>
          <Text style={styles.dateText}>Fecha: {item.fecha || 'No especificada'}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveRecipe(item.id, true)}
          >
            <Icon name="check" size={16} color={Colors.success} />
            <Text style={styles.approveText}>Aprobar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleApproveRecipe(item.id, false)}
          >
            <Icon name="x" size={16} color={Colors.error} />
            <Text style={styles.rejectText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadPendingRecipes}
          >
            <Icon name="refresh-cw" size={20} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {pendingRecipes.length} recetas pendientes de aprobación
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {pendingRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="check-circle" size={48} color={Colors.success} />
            <Text style={styles.emptyTitle}>¡Todo al día!</Text>
            <Text style={styles.emptyText}>
              No hay recetas pendientes de aprobación
            </Text>
          </View>
        ) : (
          <FlatList
            data={pendingRecipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recipesList}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadPendingRecipes}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingBottom: Metrics.mediumSpacing,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  backButton: {
    marginRight: Metrics.baseSpacing,
  },
  headerTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.card + '20',
  },
  statsContainer: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  statsText: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  recipesList: {
    padding: Metrics.mediumSpacing,
    paddingBottom: Metrics.xxLargeSpacing,
  },
  recipeItemContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  recipeCard: {
    marginBottom: Metrics.baseSpacing,
  },
  recipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recipeInfo: {
    flex: 1,
  },
  authorText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.baseBorderRadius,
    marginLeft: Metrics.baseSpacing,
  },
  approveButton: {
    backgroundColor: Colors.success + '20',
  },
  rejectButton: {
    backgroundColor: Colors.error + '20',
  },
  approveText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  rejectText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.error,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.xLargeSpacing,
    marginTop: Metrics.xLargeSpacing,
  },
  emptyTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  emptyText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: Metrics.mediumLineHeight,
  },
});

export default AdminPanelScreen; 