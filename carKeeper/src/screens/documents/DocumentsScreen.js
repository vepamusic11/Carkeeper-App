import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import useDocuments from '../../hooks/useDocuments';
import useVehiculos from '../../hooks/useVehiculos';
// Servicio eliminado - ahora se usa a través del provider
import { colors, spacing, fontSize, borderRadius, shadows } from '../../constants/theme';
import { t } from '../../utils/i18n';

const DocumentsScreen = ({ navigation }) => {
  const { 
    documents, 
    expiringDocuments, 
    loading, 
    refreshData, 
    getDocumentStats,
    downloadDocument,
    deleteDocument
  } = useDocuments();
  const { vehiculos } = useVehiculos();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(getDocumentStats());
  }, [documents]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleDownloadDocument = async (document) => {
    if (!document.fileUrl) {
      Alert.alert(t('error'), t('documentNoFileAttached'));
      return;
    }

    const result = await downloadDocument(document.fileUrl, document.fileName || 'documento.pdf');
    
    if (result.uri) {
      Alert.alert(
        t('downloadComplete'),
        t('documentDownloadedSuccessfully'),
        [
          { text: t('ok') },
          { text: t('open'), onPress: () => Linking.openURL(result.uri) }
        ]
      );
    } else {
      Alert.alert(t('error'), result.error);
    }
  };

  const handleDeleteDocument = (document) => {
    Alert.alert(
      t('deleteDocument'),
      `¿Estás seguro de eliminar "${document.name}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteDocument(document.id);
            if (result.error) {
              Alert.alert(t('error'), result.error);
            }
          }
        }
      ]
    );
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehiculos.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.marca} ${vehicle.modelo}` : t('deletedVehicle');
  };

  const formatDate = (date) => {
    if (!date) return t('noDate');
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFilteredDocuments = () => {
    switch (filter) {
      case 'expiring':
        return expiringDocuments;
      case 'expired':
        const now = new Date();
        return documents.filter(doc => 
          doc.expirationDate && doc.expirationDate < now
        );
      default:
        return documents;
    }
  };

  const renderStatsCard = () => (
    <Animated.View 
      entering={FadeInDown.duration(600).springify()}
      style={styles.statsCard}
    >
      <Text style={styles.statsTitle}>{t('documentsOverview')}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.total || 0}</Text>
          <Text style={styles.statLabel}>{t('total')}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {stats?.expiringSoon || 0}
          </Text>
          <Text style={styles.statLabel}>{t('expiringSoon')}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.danger }]}>
            {stats?.expired || 0}
          </Text>
          <Text style={styles.statLabel}>{t('expired')}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderFilterButtons = () => (
    <Animated.View 
      entering={FadeInDown.duration(600).delay(200).springify()}
      style={styles.filterContainer}
    >
      {[
        { key: 'all', label: t('all'), count: documents.length },
        { key: 'expiring', label: t('expiring'), count: expiringDocuments.length },
        { key: 'expired', label: t('expired'), count: stats?.expired || 0 }
      ].map((filterItem) => (
        <TouchableOpacity
          key={filterItem.key}
          style={[
            styles.filterButton,
            filter === filterItem.key && styles.filterButtonActive
          ]}
          onPress={() => setFilter(filterItem.key)}
        >
          <Text style={[
            styles.filterButtonText,
            filter === filterItem.key && styles.filterButtonTextActive
          ]}>
            {filterItem.label}
          </Text>
          {filterItem.count > 0 && (
            <View style={[
              styles.filterBadge,
              filter === filterItem.key && styles.filterBadgeActive
            ]}>
              <Text style={[
                styles.filterBadgeText,
                filter === filterItem.key && styles.filterBadgeTextActive
              ]}>
                {filterItem.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const renderDocument = ({ item, index }) => {
    const isExpired = item.expirationDate && item.expirationDate < new Date();
    const isExpiring = item.daysUntilExpiration && item.daysUntilExpiration <= 30;
    
    return (
      <Animated.View
        entering={SlideInRight.duration(600).delay(index * 100).springify()}
      >
        <TouchableOpacity
          style={[
            styles.documentCard,
            isExpired && styles.expiredCard,
            isExpiring && !isExpired && styles.expiringCard
          ]}
          onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
          activeOpacity={0.7}
        >
          <View style={[
            styles.documentIcon,
            { backgroundColor: documentsService.getDocumentTypeColor(item.type) + '15' }
          ]}>
            <Ionicons 
              name={documentsService.getDocumentTypeIcon(item.type)} 
              size={24} 
              color={documentsService.getDocumentTypeColor(item.type)} 
            />
          </View>
          
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>{item.name}</Text>
            <Text style={styles.documentVehicle}>{getVehicleName(item.vehicleId)}</Text>
            
            <View style={styles.documentMeta}>
              {item.expirationDate && (
                <View style={styles.expirationContainer}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={14} 
                    color={isExpired ? colors.danger : isExpiring ? colors.warning : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.expirationDate,
                    isExpired && styles.expiredText,
                    isExpiring && !isExpired && styles.expiringText
                  ]}>
                    {formatDate(item.expirationDate)}
                  </Text>
                </View>
              )}
              
              {item.fileUrl && (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => handleDownloadDocument(item)}
                >
                  <Ionicons name="download-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleDeleteDocument(item)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Animated.View 
        entering={FadeInDown.duration(800).springify()}
        style={styles.emptyContent}
      >
        <View style={styles.emptyIcon}>
          <Ionicons name="document-text-outline" size={80} color={colors.textLight} />
        </View>
        <Text style={styles.emptyTitle}>{t('noDocuments')}</Text>
        <Text style={styles.emptySubtitle}>
          {t('addImportantDocuments')}
        </Text>
      </Animated.View>
    </View>
  );

  const filteredDocuments = getFilteredDocuments();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('documents')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddDocument')}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {vehiculos.length === 0 ? (
        <View style={styles.noVehiclesContainer}>
          <Text style={styles.noVehiclesText}>
            {t('addVehicleToManageDocuments')}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Vehicles')}
            style={styles.goToVehiclesButton}
          >
            <Text style={styles.goToVehiclesText}>{t('goToVehicles')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item) => item.id}
          renderItem={renderDocument}
          ListHeaderComponent={
            <View>
              {renderStatsCard()}
              {renderFilterButtons()}
            </View>
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContainer,
            filteredDocuments.length === 0 && styles.emptyListContainer
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  addButton: {
    padding: spacing.sm
  },
  statsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary
  },
  filterButtonTextActive: {
    color: '#ffffff'
  },
  filterBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    minWidth: 20,
    alignItems: 'center'
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  filterBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary
  },
  filterBadgeTextActive: {
    color: '#ffffff'
  },
  listContainer: {
    paddingBottom: spacing.xl
  },
  emptyListContainer: {
    flex: 1
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm
  },
  expiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger
  },
  expiringCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  documentInfo: {
    flex: 1
  },
  documentName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs
  },
  documentVehicle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  expirationDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs
  },
  expiredText: {
    color: colors.danger,
    fontWeight: '600'
  },
  expiringText: {
    color: colors.warning,
    fontWeight: '600'
  },
  downloadButton: {
    padding: spacing.xs
  },
  menuButton: {
    padding: spacing.sm
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
    backgroundColor: colors.border,
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
  noVehiclesText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg
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
  }
});

export default DocumentsScreen;