import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
  Animated as RNAnimated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  SlideInRight,
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  withSequence,
  interpolate,
  FadeInUp,
  BounceIn,
  SlideInLeft,
  ZoomIn,
  withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import useVehiculos from '../../hooks/useVehiculos';
import useAuth from '../../hooks/useAuth';
import useSubscription from '../../hooks/useSubscription';
import useMantenimientos from '../../hooks/useMantenimientos';
import useGastos from '../../hooks/useGastos';
import Button from '../../components/Button';
import PromoBanner from '../../components/PromoBanner';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import { getImageUrl } from '../../utils/imageUtils';

const { width, height } = Dimensions.get('window');

const createStyles = (colors, spacing, fontSize, borderRadius, shadows) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 80
  },

  // Header Styles
  headerGradient: {
    paddingBottom: spacing.sm,
    ...shadows.sm
  },
  safeArea: {
    flex: 0
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerGreeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planUsage: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  planUsageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planUsageText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4AA',
    borderRadius: 2,
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    right: 20,
    zIndex: 1000
  },
  floatingButtonTouch: {
    borderRadius: 28,
    overflow: 'hidden',
    ...shadows.lg,
    elevation: 8
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center'
  },
  plusIcon: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
    lineHeight: 32
  },

  bottomPadding: {
    height: 20
  },

  // Vehicles Section
  vehiclesSection: {
    paddingHorizontal: spacing.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  sectionCount: {
    fontSize: 14,
    color: colors.textSecondary
  },
  vehiclesList: {
    gap: spacing.md
  },
  vehicleListItem: {
    width: '100%'
  },

  // Vehicle Card
  vehicleCardContainer: {
    flex: 1
  },
  vehicleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
    minHeight: 100
  },
  vehicleCardGradient: {
    padding: spacing.md,
    flex: 1
  },
  vehicleMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  vehicleImageContainer: {
    position: 'relative'
  },
  vehicleImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.border
  },
  vehicleImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  vehicleImageEmoji: {
    fontSize: 24,
    color: 'white'
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white'
  },
  vehicleInfo: {
    flex: 2,
    marginLeft: spacing.md
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2
  },
  vehicleYear: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4
  },
  vehicleMetrics: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metricText: {
    fontSize: 11,
    color: colors.textSecondary
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm
  },
  vehicleStatsHorizontal: {
    flexDirection: 'column',
    gap: 4,
    marginLeft: spacing.sm
  },
  statItemHorizontal: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  statInfo: {
    flex: 1,
    marginLeft: 4
  },
  statValueSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text
  },
  statLabelSmall: {
    fontSize: 10,
    color: colors.textSecondary
  },

  // Upgrade Card
  upgradeCard: {
    marginTop: 8,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.sm
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md
  },
  upgradeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  upgradeContent: {
    flex: 1
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: colors.textSecondary
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    paddingBottom: spacing.xl
  },
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm
  },
  emptyIconContainer: {
    marginBottom: spacing.md
  },
  emptyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary + '30'
  },
  emptyIconEmoji: {
    fontSize: 80
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20
  },
  featuresContainer: {
    marginBottom: spacing.md
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  featureCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden'
  },
  featureGradient: {
    padding: 10,
    alignItems: 'center',
    minHeight: 70
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    textAlign: 'center'
  },
  featureDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.lg
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
    gap: spacing.sm
  },
  emptyButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff'
  },

  // Quick Stats Styles
  quickStatsContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg
  },
  quickStatsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs
  },
  quickStatNumber: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2
  },
  quickStatLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center'
  },

  // PRO Badge
  proBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    zIndex: 10,
    ...shadows.sm
  },
  proBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#fff'
  }
});

const VehicleListScreen = ({ navigation, route }) => {
  const { vehiculos, loading, deleteVehiculo, canAddVehicle, vehicleLimit } = useVehiculos();
  const { mantenimientos, getNextMaintenance } = useMantenimientos();
  const { gastos } = useGastos();
  const { isPremium, user } = useAuth();
  const { isPro, isFree, subscriptionType, refreshData } = useSubscription();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const scrollY = useRef(new RNAnimated.Value(0)).current;

  const styles = useMemo(() => createStyles(colors, spacing, fontSize, borderRadius, shadows), [colors, spacing, fontSize, borderRadius, shadows]);

  // Control para evitar llamadas excesivas a RevenueCat
  const lastRefreshTime = useRef(0);
  const REFRESH_COOLDOWN = 5000; // 5 segundos entre llamadas

  // Animaciones para el estado vacío
  const floatValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);

  // Animación para el botón flotante
  const buttonScale = useSharedValue(1);
  const buttonRotation = useSharedValue(0);

  // Verificar suscripción con cooldown para evitar spam a RevenueCat
  useFocusEffect(
    React.useCallback(() => {
      const verifySubscription = async () => {
        // Si viene de una compra exitosa, resetear cooldown
        const forceRefresh = route?.params?.forceRefresh;

        // Verificar cooldown (skip si viene de compra)
        const now = Date.now();
        if (!forceRefresh && now - lastRefreshTime.current < REFRESH_COOLDOWN) {
          return;
        }

        lastRefreshTime.current = now;

        // Refrescar información de suscripción desde RevenueCat
        if (refreshData && typeof refreshData === 'function') {
          try {
            await refreshData();
          } catch (error) {
            console.error('Error al refrescar suscripción:', error);
          }
        }

        // Limpiar el parámetro para evitar múltiples refreshes
        if (forceRefresh) {
          navigation.setParams({ forceRefresh: undefined });
        }
      };

      // Solo verificar si el usuario está logueado
      if (user && user._id) {
        verifySubscription();
      }
    }, [route?.params?.forceRefresh]) // Solo re-ejecutar si cambia forceRefresh
  );

  React.useEffect(() => {
    if (vehiculos.length === 0) {
      floatValue.value = withRepeat(
        withSequence(
          withTiming(10, { duration: 2000 }),
          withTiming(-10, { duration: 2000 })
        ),
        -1,
        true
      );

      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }

    // Animación del botón flotante
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [vehiculos.length]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value }]
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }]
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: buttonScale.value },
      { rotate: `${buttonRotation.value}deg` }
    ]
  }));

  const handleAddVehicle = () => {
    // Animación de presión
    buttonRotation.value = withSequence(
      withTiming(15, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    if (!canAddVehicle()) {
      Alert.alert(
        '🚗 Límite alcanzado',
        `Has alcanzado el límite de ${vehicleLimit} vehículo${vehicleLimit > 1 ? 's' : ''} en tu plan gratuito.\n\n¡Actualiza a Premium para vehículos ilimitados!`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: '⭐ Ver Planes',
            onPress: () => navigation.navigate('Subscription'),
            style: 'default'
          }
        ]
      );
      return;
    }

    navigation.navigate('AddVehicle');
  };

  const handleDeleteVehicle = (vehicleId, vehicleName) => {
    Alert.alert(
      t('deleteVehicle'),
      t('deleteVehicleConfirm', { name: vehicleName }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteVehiculo(vehicleId);
            if (result.error) {
              Alert.alert(t('error'), result.error);
            }
          }
        }
      ]
    );
  };

  const handleUpgrade = () => {
    navigation.navigate('Subscription');
  };

  const dismissPromoBanner = () => {
    setShowPromoBanner(false);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>{t('hello')} {user?.nombre || t('user')}! 👋</Text>
              <Text style={styles.headerTitle}>{t('vehiclesList')}</Text>
            </View>

            {/* Premium/Pro Status Badge */}
            {(isPremium || isPro) && (
              <Animated.View entering={SlideInRight.duration(600).delay(200)}>
                <View style={[
                  styles.premiumBadge,
                  { backgroundColor: isPro ? '#FFD700' : '#00D4AA' }
                ]}>
                  <Ionicons
                    name={isPro ? 'diamond' : 'star'}
                    size={12}
                    color={isPro ? '#000' : '#fff'}
                  />
                  <Text style={[
                    styles.premiumBadgeText,
                    { color: isPro ? '#000' : '#fff' }
                  ]}>
                    {isPro ? 'PRO' : 'PREMIUM'}
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Plan Usage Progress for Free Users */}
          {isFree && (
            <Animated.View entering={FadeInUp.duration(600).delay(400)}>
              <View style={styles.planUsage}>
                <View style={styles.planUsageHeader}>
                  <Text style={styles.planUsageText}>
                    Vehículos: {vehiculos.length}/{vehicleLimit}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Subscription')}
                    style={styles.upgradeButton}
                  >
                    <Text style={styles.upgradeButtonText}>Actualizar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(vehiculos.length / vehicleLimit) * 100}%` }
                    ]}
                  />
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderStats = () => (
    <Animated.View
      entering={FadeInUp.duration(800).delay(200)}
      style={styles.statsContainer}
    >
      <LinearGradient
        colors={[colors.surface, colors.background]}
        style={styles.statsCard}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="car-sport" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{vehiculos.length}</Text>
            <Text style={styles.statLabel}>{t('vehicles')}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="build" size={20} color="#EA580C" />
            </View>
            <Text style={styles.statValue}>
              {mantenimientos.filter(m => m.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>{t('pending')}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="wallet" size={20} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>
              ${gastos.reduce((sum, g) => sum + g.amount, 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>{t('thisMonth')}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.emptyContainer}>
      {renderHeader()}
      {/* {renderStats()} */}
      <Animated.View
        entering={FadeInDown.duration(800).delay(400)}
        style={styles.emptyContent}
      >
        <View style={styles.emptyIconContainer}>
          <Animated.View style={[styles.emptyIcon, floatStyle]}>
            <Animated.View style={pulseStyle}>
              <Text style={styles.emptyIconEmoji}>🚗</Text>
            </Animated.View>
          </Animated.View>
        </View>

        <Text style={styles.emptyTitle}>{t('startYourJourney')}</Text>
        <Text style={styles.emptySubtitle}>
          {t('addFirstVehicleDescription')}
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featuresRow}>
            {[
              { icon: 'build', title: t('maintenance'), desc: t('automaticReminders'), color: colors.primary },
              { icon: 'wallet', title: t('expenses'), desc: t('financialControl'), color: '#16A34A' }
            ].map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={ZoomIn.delay(600 + index * 100)}
                style={styles.featureCard}
              >
                <LinearGradient
                  colors={[feature.color + '15', feature.color + '05']}
                  style={styles.featureGradient}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                    <Ionicons name={feature.icon} size={18} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
          <View style={styles.featuresRow}>
            {[
              { icon: 'document-text', title: t('documents'), desc: t('allOrganized'), color: '#EA580C' },
              { icon: 'analytics', title: t('analytics'), desc: t('detailedAnalysis'), color: '#8B5CF6' }
            ].map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={ZoomIn.delay(800 + index * 100)}
                style={styles.featureCard}
              >
                <LinearGradient
                  colors={[feature.color + '15', feature.color + '05']}
                  style={styles.featureGradient}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                    <Ionicons name={feature.icon} size={18} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </View>

        <Animated.View entering={BounceIn.delay(1000)}>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleAddVehicle}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.emptyButtonText}>{t('addFirstVehicle')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );

  const vehicleStatsMap = useMemo(() => {
    const map = {};
    vehiculos.forEach(v => {
      const vehicleMaintenances = mantenimientos.filter(m => m.vehicleId === v._id);
      const vehicleExpenses = gastos.filter(g => g.vehicleId === v._id);
      const nextMaintenance = getNextMaintenance(v._id);
      map[v._id] = {
        totalExpenses: vehicleExpenses.reduce((sum, e) => sum + e.amount, 0),
        pendingMaintenances: vehicleMaintenances.filter(m => m.status === 'pending').length,
        nextMaintenance
      };
    });
    return map;
  }, [vehiculos, mantenimientos, gastos, getNextMaintenance]);

  const renderVehicle = useCallback(({ item, index }) => {
    const stats = vehicleStatsMap[item._id] || { totalExpenses: 0, pendingMaintenances: 0, nextMaintenance: null };

    return (
      <Animated.View
        entering={SlideInRight.duration(600).delay(index * 100).springify()}
        style={styles.vehicleCardContainer}
      >
        <TouchableOpacity
          style={styles.vehicleCard}
          onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item._id })}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.surface, colors.background]}
            style={styles.vehicleCardGradient}
          >
            <View style={styles.vehicleMainContent}>
              <View style={styles.vehicleImageContainer}>
                {item.imageUrl && !imageErrors.has(item._id) ? (
                  <Image
                    source={{ uri: getImageUrl(item.imageUrl) }}
                    style={styles.vehicleImage}
                    onError={() => {
                      // Marcar esta imagen como error para mostrar placeholder
                      setImageErrors(prev => new Set([...prev, item._id]));
                    }}
                  />
                ) : (
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.vehicleImagePlaceholder}
                  >
                    <Text style={styles.vehicleImageEmoji}>🚗</Text>
                  </LinearGradient>
                )}
                {stats.pendingMaintenances > 0 && (
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>{stats.pendingMaintenances}</Text>
                  </View>
                )}
              </View>

              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName} numberOfLines={1}>
                  {item.marca} {item.modelo}
                </Text>
                <Text style={styles.vehicleYear}>{item.ano}</Text>
                <View style={styles.vehicleMetrics}>
                  <View style={styles.metric}>
                    <Ionicons name="speedometer-outline" size={12} color="#6B7280" />
                    <Text style={styles.metricText}>
                      {item.kilometraje?.toLocaleString() || '0'} km
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.vehicleStatsHorizontal}>
                <View style={styles.statItemHorizontal}>
                  <View style={[styles.statIconSmall, { backgroundColor: colors.warning + '20' }]}>
                    <Ionicons name="wallet" size={14} color={colors.warning} />
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statValueSmall} numberOfLines={1}>
                      ${stats.totalExpenses.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabelSmall}>{t('spent')}</Text>
                  </View>
                </View>

                {stats.nextMaintenance && (
                  <View style={styles.statItemHorizontal}>
                    <View style={[styles.statIconSmall, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="build" size={14} color={colors.primary} />
                    </View>
                    <View style={styles.statInfo}>
                      <Text style={styles.statValueSmall} numberOfLines={1}>
                        {new Date(stats.nextMaintenance.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </Text>
                      <Text style={styles.statLabelSmall}>{t('service')}</Text>
                    </View>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteVehicle(item._id, `${item.marca} ${item.modelo}`)}
              >
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [vehicleStatsMap, styles, colors, imageErrors, navigation, handleDeleteVehicle]);

  const renderListHeader = useCallback(() => (
    <>
      {/* {renderStats()} */}

      {isFree && showPromoBanner && (
        <PromoBanner
          type="premium"
          onPress={handleUpgrade}
          onDismiss={dismissPromoBanner}
          style={{ marginTop: 8, marginBottom: 8 }}
        />
      )}

      {/* Quick Stats Summary */}
      <Animated.View
        entering={FadeInUp.delay(400)}
        style={styles.quickStatsContainer}
      >
        {isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>✨ PRO</Text>
          </View>
        )}
        <View style={styles.quickStatsGrid}>
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="car-sport" size={20} color={colors.primary} />
            </View>
            <Text style={styles.quickStatNumber}>{vehiculos.length}</Text>
            <Text style={styles.quickStatLabel}>
              {isPro ? t('unlimited') : (vehiculos.length === 1 ? t('vehicle') : t('vehicles'))}
            </Text>
          </View>

          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="wallet" size={20} color={colors.warning} />
            </View>
            <Text style={styles.quickStatNumber}>
              ${gastos.reduce((sum, g) => sum + (g.amount || 0), 0).toLocaleString()}
            </Text>
            <Text style={styles.quickStatLabel}>Total gastado</Text>
          </View>

          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.danger + '20' }]}>
              <Ionicons name="build" size={20} color={colors.danger} />
            </View>
            <Text style={styles.quickStatNumber}>
              {mantenimientos.filter(m => m.status === 'pending').length}
            </Text>
            <Text style={styles.quickStatLabel}>Pendientes</Text>
          </View>
        </View>
      </Animated.View>
    </>
  ), [isFree, showPromoBanner, isPro, styles, colors, vehiculos, gastos, mantenimientos, handleUpgrade, dismissPromoBanner]);

  if (vehiculos.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={vehiculos}
        renderItem={renderVehicle}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={<View style={styles.bottomPadding} />}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={() => {}}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <Animated.View
        entering={BounceIn.delay(800)}
        style={[styles.floatingButton, buttonAnimatedStyle]}
      >
        <TouchableOpacity
          onPress={handleAddVehicle}
          activeOpacity={0.8}
          style={styles.floatingButtonTouch}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.floatingButtonGradient}
          >
            <Text style={styles.plusIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default VehicleListScreen;