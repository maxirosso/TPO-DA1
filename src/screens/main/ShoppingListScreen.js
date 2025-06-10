import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

const ShoppingListScreen = ({ navigation }) => {
  const [shoppingList, setShoppingList] = useState([]);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: 'Otros',
    notes: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    'Todos',
    'Frutas y Verduras',
    'Carnes y Pescados',
    'Lácteos',
    'Panadería',
    'Despensa',
    'Congelados',
    'Bebidas',
    'Limpieza',
    'Otros',
  ];

  const units = [
    'kg', 'g', 'lb', 'oz',
    'L', 'ml', 'tazas', 'cucharadas', 'cucharaditas',
    'unidades', 'paquetes', 'latas', 'botellas',
    'al gusto', 'pizca'
  ];

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    setLoading(true);
    setError(null);
    try {
      // Aquí deberías usar el endpoint real del backend para la lista de compras
      // Por ahora, uso almacenamiento local real
      const savedList = await AsyncStorage.getItem('shoppingList');
      if (savedList) {
        setShoppingList(JSON.parse(savedList));
      } else {
        setShoppingList([]);
      }
    } catch (error) {
      setError('No se pudo cargar la lista de compras.');
      setShoppingList([]);
    } finally {
      setLoading(false);
    }
  };

  const saveShoppingList = async (list) => {
    try {
      await AsyncStorage.setItem('shoppingList', JSON.stringify(list));
      setShoppingList(list);
    } catch (error) {
      console.log('Error saving shopping list:', error);
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }

    const item = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      quantity: newItem.quantity || '1',
      unit: newItem.unit || 'unidades',
      category: newItem.category,
      notes: newItem.notes.trim(),
      completed: false,
      addedDate: new Date().toISOString().split('T')[0],
      fromRecipe: null,
    };

    const updatedList = [...shoppingList, item];
    await saveShoppingList(updatedList);
    
    setNewItem({
      name: '',
      quantity: '',
      unit: '',
      category: 'Otros',
      notes: '',
    });
    setAddItemModalVisible(false);
  };

  const toggleItemCompleted = async (itemId) => {
    const updatedList = shoppingList.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await saveShoppingList(updatedList);
  };

  const deleteItem = async (itemId) => {
    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro que quieres eliminar este producto de la lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedList = shoppingList.filter(item => item.id !== itemId);
            await saveShoppingList(updatedList);
          }
        }
      ]
    );
  };

  const clearCompletedItems = async () => {
    const completedItems = shoppingList.filter(item => item.completed);
    if (completedItems.length === 0) {
      Alert.alert('Info', 'No hay productos completados para eliminar');
      return;
    }

    Alert.alert(
      'Limpiar Completados',
      `¿Eliminar ${completedItems.length} producto(s) completado(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedList = shoppingList.filter(item => !item.completed);
            await saveShoppingList(updatedList);
          }
        }
      ]
    );
  };

  const clearAllItems = async () => {
    if (shoppingList.length === 0) {
      Alert.alert('Info', 'La lista ya está vacía');
      return;
    }

    Alert.alert(
      'Vaciar Lista',
      '¿Estás seguro que quieres eliminar todos los productos de la lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            await saveShoppingList([]);
          }
        }
      ]
    );
  };

  const shareShoppingList = () => {
    const listText = shoppingList
      .filter(item => selectedCategory === 'Todos' || item.category === selectedCategory)
      .map(item => {
        const status = item.completed ? '' : '';
        const quantity = item.quantity && item.unit ? `${item.quantity} ${item.unit}` : '';
        const notes = item.notes ? ` (${item.notes})` : '';
        return `${status} ${item.name} ${quantity}${notes}`;
      })
      .join('\n');

    const shareText = `Lista de Compras - ChefNet\n\n${listText}\n\nGenerada con ChefNet`;
    
    // In a real app, you would use React Native's Share API
    Alert.alert('Compartir Lista', shareText);
  };

  const addFromRecipe = () => {
    Alert.alert(
      'Agregar desde Receta',
      'Selecciona una receta para agregar sus ingredientes automáticamente a tu lista de compras.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver Recetas', onPress: () => navigation.navigate('ExploreTab') }
      ]
    );
  };

  const getFilteredItems = () => {
    return shoppingList.filter(item => 
      selectedCategory === 'Todos' || item.category === selectedCategory
    );
  };

  const getItemsByCategory = () => {
    const filtered = getFilteredItems();
    const grouped = {};
    
    filtered.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    return grouped;
  };

  const getStats = () => {
    const total = shoppingList.length;
    const completed = shoppingList.filter(item => item.completed).length;
    const pending = total - completed;
    
    return { total, completed, pending };
  };

  const renderCategoryTab = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === category && styles.selectedCategoryText,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderShoppingItem = (item) => (
    <View key={item.id} style={[styles.shoppingItem, item.completed && styles.completedItem]}>
      <TouchableOpacity
        style={styles.itemCheckbox}
        onPress={() => toggleItemCompleted(item.id)}
      >
        {item.completed && <Icon name="check" size={16} color={Colors.card} />}
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, item.completed && styles.completedItemText]}>
            {item.name}
          </Text>
          <Text style={[styles.itemQuantity, item.completed && styles.completedItemText]}>
            {item.quantity} {item.unit}
          </Text>
        </View>
        
        {item.notes && (
          <Text style={[styles.itemNotes, item.completed && styles.completedItemText]}>
            {item.notes}
          </Text>
        )}
        
        {item.fromRecipe && (
          <View style={styles.recipeTag}>
            <Icon name="book-open" size={12} color={Colors.primary} />
            <Text style={styles.recipeTagText}>De: {item.fromRecipe}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Icon name="trash-2" size={16} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderAddItemModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addItemModalVisible}
      onRequestClose={() => setAddItemModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agregar Producto</Text>
            <TouchableOpacity onPress={() => setAddItemModalVisible(false)}>
              <Icon name="x" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del producto *</Text>
              <TextInput
                style={styles.textInput}
                value={newItem.name}
                onChangeText={(text) => setNewItem({ ...newItem, name: text })}
                placeholder="Ej: Tomates, Leche, Pan..."
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Metrics.baseSpacing }]}>
                <Text style={styles.inputLabel}>Cantidad</Text>
                <TextInput
                  style={styles.textInput}
                  value={newItem.quantity}
                  onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
                  placeholder="1"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Unidad</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    // In a real app, you would show a picker modal
                    Alert.alert('Unidades', units.join(', '));
                  }}
                >
                  <Text style={styles.pickerButtonText}>
                    {newItem.unit || 'Seleccionar'}
                  </Text>
                  <Icon name="chevron-down" size={16} color={Colors.textMedium} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoría</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  // In a real app, you would show a picker modal
                  Alert.alert('Categorías', categories.slice(1).join(', '));
                }}
              >
                <Text style={styles.pickerButtonText}>{newItem.category}</Text>
                <Icon name="chevron-down" size={16} color={Colors.textMedium} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notas (opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newItem.notes}
                onChangeText={(text) => setNewItem({ ...newItem, notes: text })}
                placeholder="Ej: Maduro, sin piel, marca específica..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              type="outline"
              onPress={() => setAddItemModalVisible(false)}
              style={styles.modalCancelButton}
            />
            <Button
              title="Agregar"
              onPress={addItem}
              style={styles.modalAddButton}
              iconName="plus"
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const stats = getStats();
  const groupedItems = getItemsByCategory();

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
          <Text style={styles.headerTitle}>Lista de Compras</Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareShoppingList}
          >
            <Icon name="share-2" size={20} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => renderCategoryTab(category))}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title="Agregar Producto"
          onPress={() => setAddItemModalVisible(true)}
          style={styles.addButton}
          iconName="plus"
          size="small"
        />
        <Button
          title="Desde Receta"
          onPress={addFromRecipe}
          style={styles.recipeButton}
          iconName="book-open"
          size="small"
          type="outline"
        />
      </View>

      {/* Shopping List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando lista...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Recargar"
              onPress={loadShoppingList}
              style={styles.reloadButton}
              iconName="refresh"
            />
          </View>
        ) : Object.keys(groupedItems).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="shopping-cart" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Lista vacía</Text>
            <Text style={styles.emptyText}>
              Agrega productos a tu lista de compras para comenzar
            </Text>
            <Button
              title="Agregar Primer Producto"
              onPress={() => setAddItemModalVisible(true)}
              style={styles.emptyButton}
              iconName="plus"
            />
          </View>
        ) : (
          Object.entries(groupedItems).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categorySectionTitle}>
                {category} ({items.length})
              </Text>
              {items.map(item => renderShoppingItem(item))}
            </View>
          ))
        )}

        {shoppingList.length > 0 && (
          <View style={styles.listActions}>
            <Button
              title="Limpiar Completados"
              onPress={clearCompletedItems}
              style={styles.clearButton}
              textStyle={styles.clearButtonText}
              iconName="check"
              type="outline"
            />
            <Button
              title="Vaciar Lista"
              onPress={clearAllItems}
              style={styles.clearAllButton}
              textStyle={styles.clearAllButtonText}
              iconName="trash-2"
              type="outline"
            />
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {renderAddItemModal()}
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
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.card + '20',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  categoriesContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Metrics.baseSpacing,
  },
  categoryTab: {
    backgroundColor: Colors.background,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
    marginHorizontal: Metrics.smallSpacing,
  },
  selectedCategoryTab: {
    backgroundColor: Colors.primary,
  },
  categoryTabText: {
    color: Colors.textDark,
    fontSize: Metrics.smallFontSize,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: Colors.card,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: Metrics.mediumSpacing,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addButton: {
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  recipeButton: {
    flex: 1,
    marginLeft: Metrics.baseSpacing,
  },
  content: {
    flex: 1,
    padding: Metrics.mediumSpacing,
  },
  categorySection: {
    marginBottom: Metrics.largeSpacing,
  },
  categorySectionTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completedItem: {
    opacity: 0.6,
  },
  itemCheckbox: {
    marginRight: Metrics.mediumSpacing,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    flex: 1,
  },
  itemQuantity: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  completedItemText: {
    textDecorationLine: 'line-through',
    color: Colors.textMedium,
  },
  itemNotes: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: 4,
  },
  recipeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Metrics.baseSpacing,
    paddingVertical: 2,
    borderRadius: Metrics.baseBorderRadius,
    alignSelf: 'flex-start',
  },
  recipeTagText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.primary,
    marginLeft: 4,
  },
  deleteButton: {
    padding: Metrics.baseSpacing,
    marginLeft: Metrics.baseSpacing,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.xLargeSpacing,
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
    marginBottom: Metrics.mediumSpacing,
  },
  emptyButton: {
    minWidth: 200,
  },
  listActions: {
    flexDirection: 'row',
    marginTop: Metrics.largeSpacing,
  },
  clearButton: {
    flex: 1,
    marginRight: Metrics.baseSpacing,
    borderColor: Colors.success,
  },
  clearButtonText: {
    color: Colors.success,
  },
  clearAllButton: {
    flex: 1,
    marginLeft: Metrics.baseSpacing,
    borderColor: Colors.error,
  },
  clearAllButtonText: {
    color: Colors.error,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    margin: Metrics.mediumSpacing,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  modalTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  modalForm: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: Metrics.mediumSpacing,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputLabel: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.baseSpacing,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    backgroundColor: Colors.background,
  },
  pickerButtonText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Metrics.mediumSpacing,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  modalAddButton: {
    flex: 1,
    marginLeft: Metrics.baseSpacing,
  },
  bottomPadding: {
    height: Metrics.xxLargeSpacing,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: Metrics.mediumSpacing,
  },
  reloadButton: {
    minWidth: 200,
  },
});

export default ShoppingListScreen; 