import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  SlideInRight
} from 'react-native-reanimated';
import useVehiculos from '../../hooks/useVehiculos';
import useMantenimientos from '../../hooks/useMantenimientos';
import useGastos from '../../hooks/useGastos';
import Button from '../../components/Button';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import { getImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

const VehicleDetailScreen = ({ navigation, route }) => {
  const { vehicleId } = route.params;
  const { vehiculos, deleteVehiculo } = useVehiculos();
  const { mantenimientos, loadAllUserMaintenances } = useMantenimientos();
  const { gastos, loadAllGastos } = useGastos();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  
  const [vehicle, setVehicle] = useState(null);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [allMaintenances, setAllMaintenances] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);

  // Load data when screen opens - similar to MaintenanceListScreen
  useEffect(() => {
    const loadData = async () => {
      console.log('VehicleDetail - Loading data...');
      
      // Load maintenances like MaintenanceListScreen does
      if (loadAllUserMaintenances) {
        try {
          console.log('VehicleDetail - Loading maintenances...');
          const result = await loadAllUserMaintenances();
          console.log('VehicleDetail - Maintenances result:', result);
          if (result.data) {
            const sortedMaintenances = result.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAllMaintenances(sortedMaintenances);
            console.log('VehicleDetail - Set sorted maintenances:', sortedMaintenances.length);
          }
        } catch (error) {
          console.error('VehicleDetail - Error loading maintenances:', error);
        }
      }
      
      // Load expenses
      if (loadAllGastos) {
        try {
          console.log('VehicleDetail - Loading expenses...');
          const result = await loadAllGastos();
          console.log('VehicleDetail - Expenses result:', result);
          if (result.data) {
            const sortedExpenses = result.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAllExpenses(sortedExpenses);
            console.log('VehicleDetail - Set sorted expenses:', sortedExpenses.length);
          }
        } catch (error) {
          console.error('VehicleDetail - Error loading expenses:', error);
        }
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const foundVehicle = vehiculos.find(v => v._id === vehicleId);
    setVehicle(foundVehicle);

    console.log('VehicleDetail - vehicleId:', vehicleId);
    console.log('VehicleDetail - allMaintenances:', allMaintenances.length);
    console.log('VehicleDetail - allExpenses:', allExpenses.length);
    
    // Log first items to understand structure
    if (allMaintenances.length > 0) {
      console.log('VehicleDetail - first maintenance item:', allMaintenances[0]);
    }
    if (allExpenses.length > 0) {
      console.log('VehicleDetail - first expense item:', allExpenses[0]);
    }

    // Filter recent maintenance for this vehicle using local state
    const vehicleMaintenance = allMaintenances
      .filter(m => {
        // The vehicleId field is an object with _id property based on logs
        const matches = m.vehiculo === vehicleId || 
                      m.vehicleId === vehicleId || 
                      m.vehicle === vehicleId ||
                      m.vehicle?._id === vehicleId ||
                      m.vehiculo?._id === vehicleId ||
                      m.vehicleId?._id === vehicleId ||  // This should match!
                      (typeof m.vehicleId === 'object' && m.vehicleId._id === vehicleId);
        if (matches) {
          console.log('Found maintenance match:', m);
        }
        return matches;
      })
      .slice(0, 3); // Already sorted in loadData
    setRecentMaintenance(vehicleMaintenance);

    // Filter recent expenses for this vehicle using local state
    const vehicleExpenses = allExpenses
      .filter(g => {
        // The vehicleId field is an object with _id property based on logs
        const matches = g.vehiculo === vehicleId || 
                      g.vehicleId === vehicleId || 
                      g.vehicle === vehicleId ||
                      g.vehicle?._id === vehicleId ||
                      g.vehiculo?._id === vehicleId ||
                      g.vehicleId?._id === vehicleId ||  // This should match!
                      (typeof g.vehicleId === 'object' && g.vehicleId._id === vehicleId);
        if (matches) {
          console.log('Found expense match:', g);
        }
        return matches;
      })
      .slice(0, 3); // Already sorted in loadData
    setRecentExpenses(vehicleExpenses);

    console.log('VehicleDetail - filtered maintenance:', vehicleMaintenance.length);
    console.log('VehicleDetail - filtered expenses:', vehicleExpenses.length);
  }, [vehicleId, vehiculos, allMaintenances, allExpenses]);

  const handleDeleteVehicle = () => {
    if (!vehicle) return;
    
    Alert.alert(
      t('deleteVehicle'),
      t('deleteVehicleDetailConfirm', { brand: vehicle.marca, model: vehicle.modelo }),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: async () => {
            const result = await deleteVehiculo(vehicleId);
            if (result.error) {
              Alert.alert(t('error'), result.error);
            } else {
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  const handleEditVehicle = () => {
    navigation.navigate('AddVehicle', { vehicleId, editMode: true });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md
    },
    backButton: {
      padding: spacing.sm
    },
    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: spacing.md
    },
    editButton: {
      padding: spacing.sm
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl
    },
    vehicleHeader: {
      alignItems: 'center',
      marginBottom: spacing.xl
    },
    imageContainer: {
      marginBottom: spacing.lg
    },
    vehicleImage: {
      width: width * 0.6,
      height: width * 0.4,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.border
    },
    imagePlaceholder: {
      width: width * 0.6,
      height: width * 0.4,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed'
    },
    vehicleInfo: {
      alignItems: 'center'
    },
    vehicleTitle: {
      fontSize: fontSize.xxl,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xs
    },
    vehicleSubtitle: {
      fontSize: fontSize.base,
      color: colors.textSecondary
    },
    detailsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.md
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md
    },
    detailItem: {
      alignItems: 'center',
      flex: 1
    },
    fullWidthDetail: {
      alignItems: 'center',
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border
    },
    detailLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      marginBottom: spacing.xs
    },
    detailValue: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.text
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.md
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md
    },
    seeAllText: {
      fontSize: fontSize.sm,
      color: colors.primary,
      fontWeight: '600'
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    listItemIcon: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primaryLight + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md
    },
    listItemContent: {
      flex: 1
    },
    listItemTitle: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs
    },
    listItemSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary
    },
    listItemAmount: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.primary
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xl
    },
    emptyText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      marginTop: spacing.sm
    },
    actionButtons: {
      gap: spacing.md
    },
    editVehicleButton: {
      marginBottom: spacing.sm
    },
    deleteButton: {
      borderWidth: 1
    }
  });

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('vehicleNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('vehicleDetail')}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditVehicle}
        >
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Vehicle Image and Basic Info */}
        <Animated.View 
          entering={FadeInUp.duration(800).springify()}
          style={styles.vehicleHeader}
        >
          <View style={styles.imageContainer}>
            {vehicle.imageUrl ? (
              <Image 
                source={{ uri: getImageUrl(vehicle.imageUrl) }} 
                style={styles.vehicleImage}
                onLoad={() => console.log(`Imagen cargada correctamente: ${getImageUrl(vehicle.imageUrl)}`)}
                onError={(error) => console.log(`Error cargando imagen: ${getImageUrl(vehicle.imageUrl)}`, error)}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="car" size={60} color={colors.textSecondary} />
              </View>
            )}
          </View>
          
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleTitle}>
              {vehicle.marca} {vehicle.modelo}
            </Text>
            <Text style={styles.vehicleSubtitle}>
              {vehicle.ano} • {vehicle.version}
            </Text>
          </View>
        </Animated.View>

        {/* Vehicle Details */}
        <Animated.View 
          entering={FadeInDown.duration(800).delay(200)}
          style={styles.detailsCard}
        >
          <Text style={styles.sectionTitle}>{t('vehicleInformation')}</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="speedometer" size={20} color={colors.primary} />
              <Text style={styles.detailLabel}>{t('mileage')}</Text>
              <Text style={styles.detailValue}>
                {vehicle.kilometraje?.toLocaleString()} km
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="card" size={20} color={colors.primary} />
              <Text style={styles.detailLabel}>{t('licensePlate')}</Text>
              <Text style={styles.detailValue}>{vehicle.patente}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="color-palette" size={20} color={colors.primary} />
              <Text style={styles.detailLabel}>{t('color')}</Text>
              <Text style={styles.detailValue}>{vehicle.color}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="build" size={20} color={colors.primary} />
              <Text style={styles.detailLabel}>{t('engine')}</Text>
              <Text style={styles.detailValue}>{vehicle.motor}</Text>
            </View>
          </View>

          {vehicle.numeroChasis && (
            <View style={styles.fullWidthDetail}>
              <Ionicons name="barcode" size={20} color={colors.primary} />
              <Text style={styles.detailLabel}>{t('chassisNumber')}</Text>
              <Text style={styles.detailValue}>{vehicle.numeroChasis}</Text>
            </View>
          )}
        </Animated.View>

        {/* Recent Maintenance */}
        <Animated.View 
          entering={SlideInRight.duration(600).delay(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recentMaintenance')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Maintenance')}>
              <Text style={styles.seeAllText}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {recentMaintenance.length > 0 ? (
            recentMaintenance.map((maintenance, index) => (
              <View key={maintenance._id} style={styles.listItem}>
                <View style={styles.listItemIcon}>
                  <Ionicons name="build" size={16} color={colors.primary} />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{maintenance.title || maintenance.tipo || maintenance.type}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {formatDate(maintenance.date || maintenance.fecha)} • {(maintenance.kilometraje || maintenance.mileage)?.toLocaleString()} km
                  </Text>
                </View>
                <Text style={styles.listItemAmount}>
                  {formatCurrency(maintenance.cost || maintenance.costo || maintenance.amount || 0)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="build-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyText}>{t('noMaintenanceRecords')}</Text>
            </View>
          )}
        </Animated.View>

        {/* Recent Expenses */}
        <Animated.View 
          entering={SlideInRight.duration(600).delay(600)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recentExpenses')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
              <Text style={styles.seeAllText}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense, index) => (
              <View key={expense._id} style={styles.listItem}>
                <View style={styles.listItemIcon}>
                  <Ionicons name="wallet" size={16} color={colors.primary} />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{expense.description || expense.category || expense.categoria}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {formatDate(expense.date || expense.fecha)}
                  </Text>
                </View>
                <Text style={styles.listItemAmount}>
                  {formatCurrency(expense.amount || expense.monto || 0)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyText}>{t('noExpenseRecords')}</Text>
            </View>
          )}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInUp.duration(800).delay(800)}
          style={styles.actionButtons}
        >
          <Button
            title={t('editVehicle')}
            onPress={handleEditVehicle}
            icon={<Ionicons name="pencil" size={20} color="#ffffff" />}
            style={styles.editVehicleButton}
          />
          
          <Button
            title={t('deleteVehicle')}
            onPress={handleDeleteVehicle}
            variant="outline"
            icon={<Ionicons name="trash" size={20} color={colors.danger} />}
            style={[styles.deleteButton, { borderColor: colors.danger }]}
            textStyle={{ color: colors.danger }}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default VehicleDetailScreen;