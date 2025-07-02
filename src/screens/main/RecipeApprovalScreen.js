import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AuthContext } from '../../context/AuthContext';
import Colors from '../../themes/colors';
import dataService from '../../services/dataService';

const RecipeApprovalScreen = ({ navigation }) => {
  const { user, isAdmin } = useContext(AuthContext);
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // chequear si el usuario es admin
    if (!user || !(user.rol === 'admin' || user.tipo === 'empresa')) {
      Alert.alert(
        'Acceso Denegado',
        'Solo los administradores pueden acceder a esta sección.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    loadPendingRecipes();
  }, []);

  const loadPendingRecipes = async () => {
    try {
      if (!user || !(user.rol === 'admin' || user.tipo === 'empresa')) {
        throw new Error('Acceso desautorizado');
      }
      setLoading(true);
      const recipes = await dataService.getPendingRecipes();
      setPendingRecipes(recipes || []);
    } catch (error) {
      console.error('Error al cargar las recetas pendientes:', error);
      Alert.alert(
        'Error',
        'Error al cargar las recetas pendientes. Intente nuevamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApproval = async (recipeId, approve) => {
    if (!user || !(user.rol === 'admin' || user.tipo === 'empresa')) {
      Alert.alert('Error', 'No tiene permisos para realizar esta acción');
      return;
    }

    const action = approve ? 'aprobar' : 'rechazar';
    
    Alert.alert(
      'Confirmar acción',
      `¿Está seguro que desea ${action} esta receta?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await dataService.approveRecipe(recipeId, approve);
              Alert.alert(
                'Éxito',
                `Receta ${approve ? 'aprobada' : 'rechazada'} exitosamente`
              );
              loadPendingRecipes(); 
            } catch (error) {
              console.error('Error al aprobar la receta:', error);
              Alert.alert(
                'Error',
                `Error al ${action} la receta. Intente nuevamente.`
              );
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPendingRecipes();
  };

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <Image
          source={{
            uri: item.fotoPrincipal || 'https://via.placeholder.com/100x100',
          }}
          style={styles.recipeImage}
        />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{item.nombreReceta}</Text>
          <Text style={styles.authorName}>
            Por: {item.usuario?.nombre || 'Usuario desconocido'}
          </Text>
          <Text style={styles.recipeDate}>
            Fecha: {item.fecha ? new Date(item.fecha).toLocaleDateString() : 'Sin fecha'}
          </Text>
          {item.idTipo && item.idTipo.descripcion && (
            <Text style={styles.recipeType}>
              Tipo: {item.idTipo.descripcion}
            </Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.recipeDetails} nestedScrollEnabled>
        <Text style={styles.sectionTitle}>Descripción:</Text>
        <Text style={styles.recipeDescription}>
          {item.descripcionReceta || 'Sin descripción'}
        </Text>

        <Text style={styles.sectionTitle}>Porciones:</Text>
        <Text style={styles.recipeText}>{item.porciones || 0} porciones</Text>

        <Text style={styles.sectionTitle}>Personas:</Text>
        <Text style={styles.recipeText}>{item.cantidadPersonas || 0} personas</Text>

        {item.instrucciones && (
          <>
            <Text style={styles.sectionTitle}>Instrucciones:</Text>
            <Text style={styles.recipeText}>{item.instrucciones}</Text>
          </>
        )}

        {item.ingredientes && item.ingredientes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ingredientes:</Text>
            {item.ingredientes.map((ing, index) => (
              <Text key={index} style={styles.recipeText}>
                • {ing.cantidad || ''} {ing.unidadMedida || ''} de {ing.nombre || 'Ingrediente'}
              </Text>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleApproval(item.idReceta, false)}
        >
          <Icon name="x" size={20} color="#fff" />
          <Text style={styles.buttonText}>Rechazar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproval(item.idReceta, true)}
        >
          <Icon name="check" size={20} color="#fff" />
          <Text style={styles.buttonText}>Aprobar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando recetas pendientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Aprobación</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Icon name="refresh-cw" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {pendingRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="check-circle" size={64} color={Colors.success} />
          <Text style={styles.emptyTitle}>No hay recetas pendientes</Text>
          <Text style={styles.emptySubtitle}>
            Todas las recetas han sido revisadas
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingRecipes}
          keyExtractor={(item) => item.idReceta.toString()}
          renderItem={renderRecipeItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  listContainer: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 2,
  },
  recipeDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 2,
  },
  recipeType: {
    fontSize: 12,
    color: Colors.textLight,
  },
  recipeDetails: {
    maxHeight: 200,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 8,
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  recipeText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});

export default RecipeApprovalScreen;