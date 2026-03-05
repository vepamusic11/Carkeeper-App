import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import { ActivityIndicator } from 'react-native';
import useSubscription from '../../hooks/useSubscription';
import useAuth from '../../hooks/useAuth';
import { t } from '../../utils/i18n';

const { width, height } = Dimensions.get('window');


const SubscriptionScreen = ({ navigation, route }) => {
  const {
    subscriptionType,
    packages = [],
    purchasePackage,
    restorePurchases,
    loading,
    isPremium,
    isPro
  } = useSubscription();

  const { needsPaywall, logout, updateSubscriptionStatus } = useAuth();

  // Detectar si es paywall obligatorio (no modal)
  const isMandatory = route?.name === 'MandatoryPaywall' || needsPaywall;

  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Procesar correctamente los datos de RevenueCat
  const processedPlans = packages.map(pkg => {
    const product = pkg.product;
    const isWeekly = pkg.packageType === 'WEEKLY';
    const isLifetime = pkg.packageType === 'LIFETIME';

    let displayPrice = product.priceString;
    let subtitle = '';
    let savings = '';
    let trialInfo = '';

    // Detectar trial/introductory offer
    if (product.introPrice) {
      const introPeriod = product.introPrice;
      const trialDays = introPeriod.periodNumberOfUnits || 3; // Default to 3 if not specified
      const periodUnit = introPeriod.periodUnit || 'DAY';

      // Solo mostrar si es un trial gratuito (precio 0)
      if (introPeriod.price === 0 || introPeriod.priceString === '$0.00' || introPeriod.priceString === '0') {
        if (periodUnit === 'DAY') {
          trialInfo = t('freeTrialThenPrice', { days: trialDays, price: displayPrice });
        }
      }
    }

    if (isWeekly && product.pricePerMonthString) {
      subtitle = trialInfo || `${product.pricePerMonthString}/mes`;
    } else if (isLifetime) {
      subtitle = t('oneTimePayment');
    } else {
      subtitle = trialInfo || subtitle;
    }

    // Calcular ahorros para plan anual vs mensual
    if (isWeekly && product.pricePerYear && product.pricePerMonth) {
      const yearlyPrice = product.pricePerYear;
      const monthlyPrice = product.pricePerMonth * 12;
      const savingsAmount = Math.round(((monthlyPrice - yearlyPrice) / monthlyPrice) * 100);
      if (savingsAmount > 0) {
        savings = t('savePercent', { percent: savingsAmount });
      }
    }

    return {
      id: pkg.packageType.toLowerCase(),
      packageType: pkg.packageType,
      title: product.title || 'Premium',
      description: product.description || '',
      price: displayPrice,
      subtitle: subtitle,
      savings: savings,
      trialInfo: trialInfo,
      packageObj: pkg,
      rawProduct: product
    };
  });

  // Seleccionar el primer plan por defecto
  useEffect(() => {
    if (processedPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(processedPlans[0].id);
    }
  }, [processedPlans, selectedPlan]);

  const handlePurchase = async () => {
    const selectedPlanInfo = processedPlans.find(plan => plan.id === selectedPlan);
    const packageToPurchase = selectedPlanInfo?.packageObj;

    if (!packageToPurchase) {
      Alert.alert(t('error'), t('planNotAvailable'));
      return;
    }

    setPurchasing(true);
    const result = await purchasePackage(packageToPurchase);

    if (result.success) {
      // Actualizar estado de suscripción en AuthProvider
      await updateSubscriptionStatus();

      Alert.alert(
        t('success'),
        t('subscriptionActivated'),
        [{
          text: t('continueButton'),
          onPress: () => {
            if (isMandatory) {
              // Si era paywall obligatorio, la navegación se manejará automáticamente por RootNavigator
              // Solo cerramos el alert
            } else {
              // Si era modal de upgrade, volver atrás
              navigation.navigate('Main', {
                screen: 'Vehicles',
                params: { forceRefresh: true }
              });
            }
          }
        }]
      );
    } else if (result.error !== t('purchaseCancelled')) {
      Alert.alert(t('error'), result.error);
    }

    setPurchasing(false);
  };

  const handleRestore = async () => {
    const result = await restorePurchases();
    if (result.success) {
      // Actualizar estado de suscripción en AuthProvider
      await updateSubscriptionStatus();

      Alert.alert(t('restored'), t('purchasesRestored'));
    } else {
      Alert.alert(t('error'), result.error);
    }
  };

  const handleClose = async () => {
    if (isMandatory) {
      // Paywall obligatorio: desloguear y volver a WelcomeScreen
      Alert.alert(
        t('exitWithoutSubscription'),
        t('exitWithoutSubscriptionMessage'),
        [
          {
            text: t('cancel'),
            style: 'cancel'
          },
          {
            text: t('exit'),
            style: 'destructive',
            onPress: async () => {
              await logout();
              // La navegación se manejará automáticamente cuando isAuthenticated cambie a false
            }
          }
        ]
      );
    } else {
      // Modal de upgrade: simplemente cerrar
      navigation.goBack();
    }
  };

  // Si el usuario ya es premium
  if (isPremium || isPro) {
    // Si es paywall obligatorio, no mostrar nada - dejar que RootNavigator maneje la transición automáticamente
    if (isMandatory) {
      return null;
    }

    // Si es modal de upgrade, mostrar pantalla de éxito
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Video
          source={require('../../../assets/fondo.mp4')}
          style={styles.background}
          shouldPlay={true}
          isLooping={true}
          isMuted={true}
          resizeMode="cover"
        />
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#00D4AA" />
            </View>
            <Text style={styles.successTitle}>{t('alreadyPro')}</Text>
            <Text style={styles.successSubtitle}>{t('enjoyPremiumFeatures')}</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.successButtonText}>{t('continueButton')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Loading state
  if (loading && packages.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Video
          source={require('../../../assets/fondo.mp4')}
          style={styles.background}
          shouldPlay={true}
          isLooping={true}
          isMuted={true}
          resizeMode="cover"
        />
        <View style={styles.overlay} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>{t("loadingPlans")}</Text>
        </View>
      </View>
    );
  }

  // Main paywall con diseño estilo Together
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Video
        source={require('../../../assets/fondo.mp4')}
        style={styles.background}
        shouldPlay={true}
        isLooping={true}
        isMuted={true}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.restoreText}>{t('restore')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>{t('unlockCarKeeperPro')}</Text>
            <Text style={styles.heroSubtitle}>{t('manageAllVehicles')}</Text>

            {/* Features Grid */}
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="infinite" size={24} color="#00D4AA" />
                <Text style={styles.featureText}>{t('unlimitedVehicles')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="cloud-upload" size={24} color="#00D4AA" />
                <Text style={styles.featureText}>{t('automaticBackups')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="analytics" size={24} color="#00D4AA" />
                <Text style={styles.featureText}>{t('advancedReports')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={24} color="#00D4AA" />
                <Text style={styles.featureText}>{t('noAds')}</Text>
              </View>
            </View>
          </View>

          {/* Plans */}
          <View style={styles.plansSection}>
            {processedPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.selectedPlanCard
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.trialInfo && (
                  <View style={styles.trialBadge}>
                    <Text style={styles.trialBadgeText}>{t('freeTrial', { days: 3 })}</Text>
                  </View>
                )}
                <View style={styles.planContent}>
                  <View style={styles.planLeft}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                    {plan.savings ? (
                      <Text style={styles.planSavings}>{plan.savings}</Text>
                    ) : null}
                  </View>

                  <View style={styles.planRight}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    {selectedPlan === plan.id && (
                      <View style={styles.selectedCheck}>
                        <Ionicons name="checkmark" size={16} color="#00D4AA" />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.ctaButtonText}>{t('startNow')}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>{t('cancelAnytime')}</Text>
        </View>
      </SafeAreaView>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 0,
  },
  featureItem: {
    flexBasis: '48%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  plansSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'visible',
  },
  selectedPlanCard: {
    borderColor: '#00D4AA',
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
  trialBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#00D4AA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  trialBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  planLeft: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  planSavings: {
    fontSize: 12,
    color: '#00D4AA',
    fontWeight: '600',
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00D4AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  ctaButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  // Success screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  successButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Loading screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 16,
  },
  // Skip button (para paywall obligatorio)
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'underline',
  },
});



export default SubscriptionScreen;