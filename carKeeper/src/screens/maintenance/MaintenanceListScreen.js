import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import useMantenimientos from '../../hooks/useMantenimientos';
import useVehiculos from '../../hooks/useVehiculos';
import useSubscription from '../../hooks/useSubscription';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import PremiumModal from '../../components/PremiumModal';

const createStyles = (colors, spacing, fontSize, borderRadius, shadows) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  scheduleButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md
  },
  addButton: {
    padding: spacing.sm
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.md
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm
  },
  activeTab: {
    backgroundColor: colors.primary + '15'
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeTabText: {
    color: colors.primary
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl
  },
  emptyListContainer: {
    flex: 1
  },
  maintenanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  maintenanceInfo: {
    flex: 1
  },
  maintenanceTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textTransform: 'capitalize'
  },
  vehicleName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs
  },
  kmIcon: {
    marginLeft: spacing.md
  },
  kmText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs
  },
  providerText: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontStyle: 'italic'
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  cost: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600'
  },
  chevron: {
    marginTop: spacing.xs
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.border + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  noVehiclesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl
  },
  noVehiclesTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm
  },
  noVehiclesText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl
  },
  goToVehiclesButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg
  },
  goToVehiclesText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: '#ffffff'
  },
  usageContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  usageTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
    marginLeft: spacing.sm
  },
  usageBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm
  },
  usageText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border + '40',
    borderRadius: borderRadius.xs,
    marginBottom: spacing.sm
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.xs
  },
  limitText: {
    fontSize: fontSize.xs,
    color: colors.danger,
    textAlign: 'center'
  }
});

const MaintenanceListScreen = ({ navigation }) => {
  const { mantenimientos, upcomingMaintenances, loading, refreshData, loadAllUserMaintenances } = useMantenimientos();
  const { vehiculos } = useVehiculos();
  const { canAddMaintenance, getMaintenanceLimit, isFree } = useSubscription();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, fontSize, borderRadius, shadows), [colors, spacing, fontSize, borderRadius, shadows]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('historial');
  const [allMaintenances, setAllMaintenances] = useState([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    loadAllMaintenances();
  }, [vehiculos]);

  // Recargar cuando la pantalla está en foco (regresa de AddMaintenance)
  useFocusEffect(
    React.useCallback(() => {
      if (vehiculos.length > 0) {
        loadAllMaintenances();
      }
    }, [vehiculos])
  );

  const loadAllMaintenances = async () => {
    if (vehiculos.length === 0) return;
    
    try {
      const result = await loadAllUserMaintenances();
      if (result.data) {
        const sortedMaintenances = result.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllMaintenances(sortedMaintenances);
      }
    } catch (error) {
      console.error('Error loading all maintenances:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await loadAllMaintenances();
    setRefreshing(false);
  };

  const getMaintenanceIcon = (type) => {
    const iconMap = {
      'cambio_aceite': 'water',
      'cambio_filtros': 'funnel',
      'frenos': 'disc',
      'neumaticos': 'sync',
      'alineacion': 'resize',
      'balanceado': 'refresh',
      'bateria': 'battery-charging',
      'aire_acondicionado': 'snow',
      'revision_general': 'eye',
      'otro': 'build'
    };
    return iconMap[type] || 'build';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'completed': colors.success,
      'pending': colors.warning,
      'in_progress': colors.primary,
      'cancelled': colors.danger
    };
    return statusColors[status] || colors.textSecondary;
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'completed': t('completed'),
      'pending': t('pending'),
      'in_progress': t('inProgress'),
      'cancelled': t('cancelled')
    };
    return statusTexts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('tomorrow');
    if (diffDays === -1) return t('yesterday');
    if (diffDays < -1) return t('daysAgo', { days: Math.abs(diffDays) });
    if (diffDays > 1 && diffDays <= 7) return t('inDays', { days: diffDays });
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehiculos.find(v => v._id === vehicleId);
    return vehicle ? `${vehicle.marca} ${vehicle.modelo}` : t('vehicle');
  };

  const handleAddMaintenance = (scheduleMode = false) => {
    // Check if user can add maintenance
    if (!canAddMaintenance(allMaintenances)) {
      setShowPremiumModal(true);
      return;
    }

    const navigationParams = scheduleMode ? { scheduleMode: true } : {};
    if (vehiculos.length === 1) {
      navigation.navigate('AddMaintenance', {
        vehicleId: vehiculos[0]._id,
        ...navigationParams
      });
    } else {
      navigation.navigate('AddMaintenance', navigationParams);
    }
  };

  const getMonthlyMaintenanceCount = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allMaintenances.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;
  };

  const renderEmptyState = (type) => (
    <View style={styles.emptyContainer}>
      <Animated.View 
        entering={FadeInDown.duration(800).springify()}
        style={styles.emptyContent}
      >
        <View style={styles.emptyIcon}>
          <Ionicons 
            name={type === 'historial' ? 'document-text-outline' : 'calendar-outline'} 
            size={80} 
            color={colors.textSecondary} 
          />
        </View>
        <Text style={styles.emptyTitle}>
          {type === 'historial' ? t('noHistory') : t('noScheduledMaintenances')}
        </Text>
        <Text style={styles.emptySubtitle}>
          {type === 'historial' 
            ? t('noHistoryMessage')
            : t('noScheduledMaintenancesMessage')
          }
        </Text>
      </Animated.View>
    </View>
  );

  const renderMaintenanceItem = ({ item, index }) => {
    const isUpcoming = activeTab === 'programados';
    const vehicle = vehiculos.find(v => v._id === item.vehicleId);
    
    return (
      <Animated.View
        entering={SlideInRight.duration(600).delay(index * 100).springify()}
      >
        <TouchableOpacity
          style={[
            styles.maintenanceCard,
            isUpcoming && item.status === 'pending' && styles.pendingCard
          ]}
          onPress={() => navigation.navigate('MaintenanceDetail', { 
            maintenanceId: item._id,
            vehicleId: typeof item.vehicleId === 'object' ? item.vehicleId._id || item.vehicleId.id : item.vehicleId
          })}
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            { backgroundColor: getStatusColor(item.status) + '15' }
          ]}>
            <Ionicons 
              name={getMaintenanceIcon(item.type)} 
              size={24} 
              color={getStatusColor(item.status)} 
            />
          </View>
          
          <View style={styles.maintenanceInfo}>
            <Text style={styles.maintenanceTitle}>
              {item.title || item.type}
            </Text>
            <Text style={styles.vehicleName}>
              {getVehicleName(item.vehicleId)}
            </Text>
            <View style={styles.dateContainer}>
              <Ionicons 
                name="calendar-outline" 
                size={14} 
                color={colors.textSecondary} 
              />
              <Text style={styles.dateText}>
                {formatDate(item.date)}
              </Text>
              {item.kilometraje && (
                <>
                  <Ionicons 
                    name="speedometer-outline" 
                    size={14} 
                    color={colors.textSecondary}
                    style={styles.kmIcon}
                  />
                  <Text style={styles.kmText}>
                    {item.kilometraje?.toLocaleString()} km
                  </Text>
                </>
              )}
            </View>
            {item.provider && (
              <Text style={styles.providerText}>
                {item.provider}
              </Text>
            )}
          </View>
          
          <View style={styles.rightSection}>
            {item.cost > 0 && (
              <Text style={styles.cost}>
                {formatCurrency(item.cost)}
              </Text>
            )}
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(item.status) }
              ]}>
                {getStatusText(item.status)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} style={styles.chevron} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Filtrar mantenimientos según la pestaña activa
  const getFilteredMaintenances = () => {
    if (activeTab === 'historial') {
      return allMaintenances.filter(m => m.status === 'completed');
    } else {
      return allMaintenances.filter(m => m.status === 'pending' || m.status === 'in_progress');
    }
  };

  const filteredMaintenances = getFilteredMaintenances();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('maintenanceList')}</Text>
        <View style={styles.headerButtons}>
          {activeTab === 'programados' && (
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => handleAddMaintenance(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddMaintenance()}
          >
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Free user usage indicator */}
      {isFree && vehiculos.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.usageContainer}
        >
          <View style={styles.usageHeader}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.usageTitle}>Mantenimientos este mes</Text>
            <View style={styles.usageBadge}>
              <Text style={styles.usageText}>
                {getMonthlyMaintenanceCount()}/{getMaintenanceLimit()}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min((getMonthlyMaintenanceCount() / getMaintenanceLimit()) * 100, 100)}%`,
                  backgroundColor: getMonthlyMaintenanceCount() >= getMaintenanceLimit() ? colors.danger : colors.primary
                }
              ]}
            />
          </View>
          {getMonthlyMaintenanceCount() >= getMaintenanceLimit() && (
            <Text style={styles.limitText}>
              Has alcanzado el límite mensual. Actualiza a Premium para mantenimientos ilimitados.
            </Text>
          )}
        </Animated.View>
      )}

      {vehiculos.length === 0 ? (
        <View style={styles.noVehiclesContainer}>
          <Ionicons name="car-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.noVehiclesTitle}>{t('noVehicles')}</Text>
          <Text style={styles.noVehiclesText}>
            {t('addVehicleFirst')}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Vehicles')}
            style={styles.goToVehiclesButton}
          >
            <Text style={styles.goToVehiclesText}>{t('goToVehicles')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'historial' && styles.activeTab
              ]}
              onPress={() => setActiveTab('historial')}
            >
              <Ionicons 
                name="document-text" 
                size={20} 
                color={activeTab === 'historial' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'historial' && styles.activeTabText
              ]}>
                {t('history')}
              </Text>
              {allMaintenances.filter(m => m.status === 'completed').length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {allMaintenances.filter(m => m.status === 'completed').length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'programados' && styles.activeTab
              ]}
              onPress={() => setActiveTab('programados')}
            >
              <Ionicons 
                name="calendar" 
                size={20} 
                color={activeTab === 'programados' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'programados' && styles.activeTabText
              ]}>
                {t('scheduled')}
              </Text>
              {allMaintenances.filter(m => m.status === 'pending' || m.status === 'in_progress').length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {allMaintenances.filter(m => m.status === 'pending' || m.status === 'in_progress').length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Content */}
          <FlatList
            data={filteredMaintenances}
            keyExtractor={(item) => item._id}
            renderItem={renderMaintenanceItem}
            ListEmptyComponent={() => renderEmptyState(activeTab)}
            contentContainerStyle={[
              styles.listContainer,
              filteredMaintenances.length === 0 && styles.emptyListContainer
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || loading}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={() => {
          setShowPremiumModal(false);
          navigation.navigate('Subscription');
        }}
        title="Límite de mantenimientos alcanzado"
        description="Has alcanzado el límite de 2 mantenimientos por mes en tu plan gratuito."
        featureIcon="calendar-outline"
      />
    </SafeAreaView>
  );
};

export default MaintenanceListScreen;