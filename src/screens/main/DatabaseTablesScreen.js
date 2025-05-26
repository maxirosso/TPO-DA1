import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import dataService from '../../services/dataService';

const DatabaseTablesScreen = ({ navigation }) => {
  const [selectedTable, setSelectedTable] = useState('Recetas');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tables = [
    'Recetas',
    'Cursos',
    'ListaRecetasSeleccionadas',
    'SugerenciasRecetas',
  ];

  useEffect(() => {
    loadTableData();
  }, [selectedTable]);

  const loadTableData = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      switch (selectedTable) {
        case 'Recetas':
          data = await dataService.getAllRecipes();
          break;
        case 'Cursos':
          data = await dataService.getAllCourses(1);
          break;
        case 'ListaRecetasSeleccionadas':
          data = await dataService.getMiListaRecetas();
          break;
        case 'SugerenciasRecetas':
          data = await dataService.getSugerenciasRecetas();
          break;
        default:
          setError('No hay endpoint disponible para esta tabla.');
          setTableData([]);
          setLoading(false);
          return;
      }
      setTableData(data);
    } catch (err) {
      setError(`Error al cargar ${selectedTable}: ${err.message}`);
      console.error(`Error loading ${selectedTable}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const renderTableItem = ({ item }) => {
    const renderValue = (value) => {
      if (value === null || value === undefined) return 'N/A';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    };

    return (
      <View style={styles.tableRow}>
        {Object.entries(item).map(([key, value], index) => (
          <View key={index} style={styles.tableCell}>
            <Text style={styles.cellLabel}>{key}:</Text>
            <Text style={styles.cellValue}>{renderValue(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTableSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tableSelector}
    >
      {tables.map((table) => (
        <TouchableOpacity
          key={table}
          style={[
            styles.tableTab,
            selectedTable === table && styles.selectedTableTab,
          ]}
          onPress={() => setSelectedTable(table)}
        >
          <Text
            style={[
              styles.tableTabText,
              selectedTable === table && styles.selectedTableTabText,
            ]}
          >
            {table}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <Text style={styles.headerTitle}>Base de Datos</Text>
        </View>
      </LinearGradient>

      {renderTableSelector()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadTableData}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tableData}
          renderItem={renderTableItem}
          keyExtractor={(item, index) => `${selectedTable}-${index}`}
          contentContainerStyle={styles.tableContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="database" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>
                No hay datos disponibles en {selectedTable}
              </Text>
            </View>
          }
        />
      )}
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
  },
  backButton: {
    marginRight: Metrics.baseSpacing,
  },
  headerTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  tableSelector: {
    backgroundColor: Colors.card,
    paddingVertical: Metrics.baseSpacing,
  },
  tableTab: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
    marginHorizontal: Metrics.smallSpacing,
    borderRadius: Metrics.roundedFull,
    backgroundColor: Colors.background,
  },
  selectedTableTab: {
    backgroundColor: Colors.primary,
  },
  tableTabText: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    fontWeight: '500',
  },
  selectedTableTabText: {
    color: Colors.card,
  },
  tableContainer: {
    padding: Metrics.mediumSpacing,
  },
  tableRow: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableCell: {
    marginBottom: Metrics.smallSpacing,
  },
  cellLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Metrics.mediumSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Metrics.mediumSpacing,
  },
  errorText: {
    marginTop: Metrics.mediumSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  retryButtonText: {
    color: Colors.card,
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.xLargeSpacing,
  },
  emptyText: {
    marginTop: Metrics.mediumSpacing,
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    textAlign: 'center',
  },
});

export default DatabaseTablesScreen; 