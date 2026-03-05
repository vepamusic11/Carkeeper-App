import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import useMantenimientos from '../../hooks/useMantenimientos';
import useVehiculos from '../../hooks/useVehiculos';
import Button from '../../components/Button';
import { useTheme } from '../../hooks/useTheme';
import { t, isSpanish } from '../../utils/i18n';
import { getTip, getUrgency } from '../../constants/maintenanceTips';

const MaintenanceDetailScreen = ({ navigation, route }) => {
  const { maintenanceId, vehicleId } = route.params;
  const { mantenimientos, loadMaintenancesByVehicle, updateMantenimiento, deleteMantenimiento, markAsCompleted, loading } = useMantenimientos();
  const { vehiculos } = useVehiculos();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  
  const [maintenance, setMaintenance] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    loadMaintenanceData();
  }, [maintenanceId, vehicleId]);

  const loadMaintenanceData = async () => {
    // Cargar mantenimientos del vehículo
    const result = await loadMaintenancesByVehicle(vehicleId);
    
    // Encontrar el mantenimiento específico desde el resultado o desde el estado
    let foundMaintenance = null;
    if (result.data) {
      foundMaintenance = result.data.find(m => m._id === maintenanceId);
    } else {
      foundMaintenance = mantenimientos.find(m => m._id === maintenanceId);
    }
    
    setMaintenance(foundMaintenance);
    
    // Encontrar el vehículo
    const foundVehicle = vehiculos.find(v => v._id === vehicleId);
    setVehicle(foundVehicle);
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
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: spacing.md
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm
    },
    headerButton: {
      padding: spacing.sm
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    loadingText: {
      fontSize: fontSize.base,
      color: colors.textSecondary
    },
    maintenanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.md
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg
    },
    headerInfo: {
      flex: 1
    },
    maintenanceTitle: {
      fontSize: fontSize.xl,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xs
    },
    vehicleName: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      marginBottom: spacing.md
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md
    },
    statusText: {
      fontSize: fontSize.sm,
      fontWeight: '600'
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.sm
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md
    },
    infoGrid: {
      gap: spacing.md
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm
    },
    infoContent: {
      marginLeft: spacing.md,
      flex: 1
    },
    infoLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs
    },
    infoValue: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.text
    },
    description: {
      fontSize: fontSize.base,
      color: colors.text,
      lineHeight: 22
    },
    nextMaintenanceCard: {
      backgroundColor: colors.primaryLight + '10',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.sm
    },
    nextMaintenanceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm
    },
    nextMaintenanceText: {
      fontSize: fontSize.sm,
      color: colors.primary,
      fontWeight: '600'
    },
    actionsSection: {
      gap: spacing.md
    },
    completeButton: {
      marginBottom: spacing.md
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.md
    },
    editButton: {
      flex: 1
    },
    deleteButton: {
      flex: 1,
      borderWidth: 1
    }
  });

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
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const handleEdit = () => {
    navigation.navigate('AddMaintenance', {
      vehicleId,
      maintenanceId,
      editMode: true
    });
  };

  const handleDelete = () => {
    Alert.alert(
      t('deleteMaintenance'),
      t('deleteMaintenanceConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteMantenimiento(maintenanceId);
            if (result.success) {
              navigation.goBack();
            } else {
              Alert.alert(t('error'), result.error);
            }
          }
        }
      ]
    );
  };

  const handleMarkAsCompleted = () => {
    Alert.alert(
      t('markAsCompleted'),
      t('markAsCompletedConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('complete'),
          onPress: async () => {
            const result = await markAsCompleted(maintenanceId, {
              completedAt: new Date()
            });
            if (result.success) {
              await loadMaintenanceData(); // Recargar datos
              Alert.alert(t('success'), t('markAsCompletedSuccess'));
            } else {
              Alert.alert(t('error'), result.error);
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    if (!maintenance || !vehicle) return;

    const shareText = `
🔧 ${t('maintenance')}: ${maintenance.title}
🚗 ${t('vehicle')}: ${vehicle.marca} ${vehicle.modelo}
📅 ${t('date')}: ${formatDate(maintenance.date)}
${maintenance.kilometraje ? `🏁 ${t('mileage')}: ${maintenance.kilometraje.toLocaleString()} ${t('km')}` : ''}
${maintenance.cost > 0 ? `💰 ${t('cost')}: ${formatCurrency(maintenance.cost)}` : ''}
${maintenance.provider ? `🏪 ${t('provider')}: ${maintenance.provider}` : ''}
📋 ${t('status')}: ${getStatusText(maintenance.status)}
${maintenance.description ? `\n📝 ${t('description')}: ${maintenance.description}` : ''}
    `.trim();

    try {
      await Share.share({
        message: shareText,
        title: t('shareMaintenanceTitle')
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCallProvider = () => {
    if (!maintenance?.provider) return;
    
    Alert.alert(
      t('contactProvider'),
      t('callProvider', { provider: maintenance.provider }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('call'),
          onPress: () => {
            // En una implementación real, aquí podrías tener el número guardado
            // Por ahora solo mostramos una alerta
            Alert.alert('Info', t('callFunctionality'));
          }
        }
      ]
    );
  };

  if (!maintenance || !vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('maintenance')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('detail')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="pencil-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Maintenance Header */}
        <Animated.View 
          entering={FadeInUp.duration(800).springify()}
          style={styles.maintenanceHeader}
        >
          <View style={[
            styles.iconContainer,
            { backgroundColor: getStatusColor(maintenance.status) + '15' }
          ]}>
            <Ionicons 
              name={getMaintenanceIcon(maintenance.type)} 
              size={40} 
              color={getStatusColor(maintenance.status)} 
            />
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.maintenanceTitle}>{maintenance.title}</Text>
            <Text style={styles.vehicleName}>
              {vehicle.marca} {vehicle.modelo} {vehicle.ano}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(maintenance.status) + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(maintenance.status) }
              ]}>
                {getStatusText(maintenance.status)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Basic Information */}
        <Animated.View 
          entering={FadeInDown.duration(800).delay(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>{t('basicInfo')}</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('date')}</Text>
                <Text style={styles.infoValue}>{formatDate(maintenance.date)}</Text>
              </View>
            </View>

            {maintenance.kilometraje && (
              <View style={styles.infoItem}>
                <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('mileage')}</Text>
                  <Text style={styles.infoValue}>{maintenance.kilometraje.toLocaleString()} km</Text>
                </View>
              </View>
            )}

            {maintenance.cost > 0 && (
              <View style={styles.infoItem}>
                <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('cost')}</Text>
                  <Text style={styles.infoValue}>{formatCurrency(maintenance.cost)}</Text>
                </View>
              </View>
            )}

            {maintenance.provider && (
              <View style={styles.infoItem}>
                <Ionicons name="business-outline" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('provider')}</Text>
                  <Text style={styles.infoValue}>{maintenance.provider}</Text>
                </View>
                <TouchableOpacity onPress={handleCallProvider}>
                  <Ionicons name="call-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {maintenance.location && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('location')}</Text>
                  <Text style={styles.infoValue}>{maintenance.location}</Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Description */}
        {maintenance.description && (
          <Animated.View 
            entering={FadeInDown.duration(800).delay(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>{t('description')}</Text>
            <Text style={styles.description}>{maintenance.description}</Text>
          </Animated.View>
        )}

        {/* Notes */}
        {maintenance.notas && (
          <Animated.View 
            entering={FadeInDown.duration(800).delay(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>{t('notes')}</Text>
            <Text style={styles.description}>{maintenance.notas}</Text>
          </Animated.View>
        )}

        {/* Next Maintenance Info */}
        {(maintenance.nextMaintenanceKm || maintenance.nextMaintenanceDate) && (
          <Animated.View 
            entering={FadeInDown.duration(800).delay(800)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>{t('nextMaintenanceInfo')}</Text>
            <View style={styles.nextMaintenanceCard}>
              {maintenance.nextMaintenanceKm && (
                <View style={styles.nextMaintenanceItem}>
                  <Ionicons name="speedometer" size={16} color={colors.primary} />
                  <Text style={styles.nextMaintenanceText}>
                    {maintenance.nextMaintenanceKm.toLocaleString()} km
                  </Text>
                </View>
              )}
              {maintenance.nextMaintenanceDate && (
                <View style={styles.nextMaintenanceItem}>
                  <Ionicons name="calendar" size={16} color={colors.primary} />
                  <Text style={styles.nextMaintenanceText}>
                    {formatDate(maintenance.nextMaintenanceDate)}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Maintenance Tip */}
        {maintenance.type && (() => {
          const tip = getTip(maintenance.type, isSpanish() ? 'es' : 'en');
          const urgency = getUrgency(maintenance.type, maintenance.date, maintenance.kilometraje, vehicle?.kilometraje);
          const urgencyColors = { overdue: colors.danger, upcoming: colors.warning, ok: colors.success };
          const urgencyColor = urgencyColors[urgency] || colors.primary;
          if (!tip) return null;
          return (
            <Animated.View
              entering={FadeInDown.duration(800).delay(900)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>{t('recommendation')}</Text>
              <View style={{
                backgroundColor: urgencyColor + '10',
                borderRadius: 12,
                padding: spacing.md,
                borderLeftWidth: 4,
                borderLeftColor: urgencyColor,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Ionicons name={tip.icon || 'information-circle'} size={20} color={urgencyColor} />
                  <Text style={{
                    fontSize: fontSize.sm,
                    fontWeight: '700',
                    color: urgencyColor,
                    marginLeft: spacing.sm,
                  }}>
                    {urgency === 'overdue' ? t('maintenanceOverdue') : urgency === 'upcoming' ? t('maintenanceUpcoming') : t('maintenanceOnTrack')}
                  </Text>
                </View>
                <Text style={{
                  fontSize: fontSize.sm,
                  color: colors.text,
                  lineHeight: 20,
                }}>
                  {tip.description}
                </Text>
              </View>
            </Animated.View>
          );
        })()}

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(1000)}
          style={styles.actionsSection}
        >
          {maintenance.status === 'pending' && (
            <Button
              title={t('markAsCompleted')}
              onPress={handleMarkAsCompleted}
              icon={<Ionicons name="checkmark-circle" size={20} color="#ffffff" />}
              style={styles.completeButton}
            />
          )}
          
          <View style={styles.actionButtons}>
            <Button
              title={t('edit')}
              onPress={handleEdit}
              variant="outline"
              icon={<Ionicons name="pencil" size={20} color={colors.primary} />}
              style={styles.editButton}
            />
            
            <Button
              title={t('delete')}
              onPress={handleDelete}
              variant="outline"
              icon={<Ionicons name="trash" size={20} color={colors.danger} />}
              style={[styles.deleteButton, { borderColor: colors.danger }]}
              textStyle={{ color: colors.danger }}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default MaintenanceDetailScreen;